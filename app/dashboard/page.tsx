import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { CreditTopUp } from "@/components/CreditTopUp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { readDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = await readDb();
  const workspace = db.workspaces[0];
  const completed = db.responses.filter((response) => response.status === "completed").length;
  const total = db.responses.length;
  const totalCost = db.aiUsageEvents.reduce((sum, event) => sum + event.creditDebitUsd, 0);
  const avgCost = completed > 0 ? totalCost / completed : 0;

  return (
    <AppChrome>
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Credits, completion rate, and survey overview.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">${workspace.creditBalanceUsd.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. cost per completed response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">${avgCost.toFixed(4)}</p>
          </CardContent>
        </Card>
      </section>

      <CreditTopUp />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Survey</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Public link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {db.surveys.map((survey) => {
                const responses = db.responses.filter((response) => response.surveyId === survey.id);
                return (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <div className="font-medium">{survey.title}</div>
                      <div className="text-sm text-muted-foreground">{survey.spec.goal}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={survey.status === "published" ? "default" : "secondary"}>
                        {survey.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{responses.length}</TableCell>
                    <TableCell>
                      {survey.publicToken ? (
                        <Link className="text-sm underline-offset-4 hover:underline" href={`/r/${survey.publicToken}`}>
                          /r/{survey.publicToken}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not published</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" render={<Link href={`/surveys/${survey.id}`} />}>
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {db.surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No surveys yet.
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
