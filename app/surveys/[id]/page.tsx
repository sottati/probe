import Link from "next/link";
import { notFound } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { PublishButton } from "@/components/PublishButton";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Message, MessageContent } from "@/components/ui/message";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { previewQuestions } from "@/lib/survey-spec";
import { getSurveyById, readDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getSurveyById(id);
  if (!survey) notFound();

  const db = await readDb();
  const responses = db.responses.filter((response) => response.surveyId === survey.id);
  const completed = responses.filter((response) => response.status === "completed");
  const answers = db.structuredAnswers.filter((answer) =>
    responses.some((response) => response.id === answer.responseId),
  );
  const usage = db.aiUsageEvents.filter((event) => event.surveyId === survey.id);
  const cost = usage.reduce((sum, event) => sum + event.creditDebitUsd, 0);

  return (
    <AppChrome>
      <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{survey.title}</h1>
            <Badge variant={survey.status === "published" ? "default" : "secondary"}>{survey.status}</Badge>
          </div>
          <p className="text-muted-foreground">{survey.spec.goal}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {survey.status === "draft" ? <PublishButton surveyId={survey.id} /> : null}
          {survey.publicToken ? (
            <Button render={<Link href={`/r/${survey.publicToken}`} />}>Open public link</Button>
          ) : null}
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Responses started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{responses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Responses completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">${cost.toFixed(4)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SurveySpec</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Audience:</strong> {survey.spec.audience}
            </p>
            <p>
              <strong>Duration:</strong> {survey.spec.estimatedMinutes} minutes, {survey.spec.maxTurns} turns max
            </p>
            <p>
              <strong>Tone:</strong> {survey.spec.tone}
            </p>
            <div>
              <strong>Required capture</strong>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                {survey.spec.mustCapture.map((field) => (
                  <li key={field.id}>{field.label}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversation preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {previewQuestions(survey.spec).map((question) => (
              <Message key={question} align="start">
                <MessageContent>
                  <Bubble variant="outline">
                    <BubbleContent>{question}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 flex flex-wrap gap-2">
        <Button variant="outline" render={<a href={`/api/surveys/${survey.id}/export?format=json`} />}>
          Export JSON
        </Button>
        <Button variant="outline" render={<a href={`/api/surveys/${survey.id}/export?format=csv`} />}>
          Export CSV
        </Button>
      </section>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Response</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Quotes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => {
                const answer = answers.find((item) => item.responseId === response.id);
                return (
                  <TableRow key={response.id}>
                    <TableCell className="font-mono text-xs">{response.id}</TableCell>
                    <TableCell>
                      <Badge variant={response.status === "completed" ? "default" : "secondary"}>
                        {response.status}
                      </Badge>
                      {response.completionReason ? (
                        <div className="mt-1 text-xs text-muted-foreground">{response.completionReason}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      {answer?.summary ?? <span className="text-muted-foreground">No extraction yet</span>}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal">{answer?.quotes.join(" / ") ?? ""}</TableCell>
                  </TableRow>
                );
              })}
              {responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No responses yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppChrome>
  );
}
