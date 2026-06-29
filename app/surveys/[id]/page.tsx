import Link from "next/link";
import { notFound } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { PublishButton } from "@/components/PublishButton";
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
      <section className="section" style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1>{survey.title}</h1>
          <p className="muted">{survey.spec.goal}</p>
        </div>
        <div className="nav">
          {survey.status === "draft" ? <PublishButton surveyId={survey.id} /> : null}
          {survey.publicToken ? (
            <Link className="button primary" href={`/r/${survey.publicToken}`}>
              Open public link
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid grid-3 section">
        <div className="panel metric">
          <span>Responses started</span>
          <strong>{responses.length}</strong>
        </div>
        <div className="panel metric">
          <span>Responses completed</span>
          <strong>{completed.length}</strong>
        </div>
        <div className="panel metric">
          <span>Credits used</span>
          <strong>${cost.toFixed(4)}</strong>
        </div>
      </section>

      <section className="grid grid-2 section">
        <div className="panel panel-pad">
          <h2>SurveySpec</h2>
          <p>
            <strong>Audience:</strong> {survey.spec.audience}
          </p>
          <p>
            <strong>Duration:</strong> {survey.spec.estimatedMinutes} minutes, {survey.spec.maxTurns} turns max
          </p>
          <p>
            <strong>Tone:</strong> {survey.spec.tone}
          </p>
          <h3>Required capture</h3>
          <ul>
            {survey.spec.mustCapture.map((field) => (
              <li key={field.id}>{field.label}</li>
            ))}
          </ul>
        </div>
        <div className="panel panel-pad">
          <h2>Conversation preview</h2>
          {previewQuestions(survey.spec).map((question) => (
            <p className="bubble" key={question}>
              {question}
            </p>
          ))}
        </div>
      </section>

      <section className="section nav">
        <a className="button" href={`/api/surveys/${survey.id}/export?format=json`}>
          Export JSON
        </a>
        <a className="button" href={`/api/surveys/${survey.id}/export?format=csv`}>
          Export CSV
        </a>
      </section>

      <section className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Response</th>
              <th>Status</th>
              <th>Summary</th>
              <th>Quotes</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => {
              const answer = answers.find((item) => item.responseId === response.id);
              return (
                <tr key={response.id}>
                  <td>{response.id}</td>
                  <td>
                    {response.status}
                    {response.completionReason ? <div className="muted">{response.completionReason}</div> : null}
                  </td>
                  <td>{answer?.summary ?? <span className="muted">No extraction yet</span>}</td>
                  <td>{answer?.quotes.join(" / ") ?? ""}</td>
                </tr>
              );
            })}
            {responses.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <span className="muted">No responses yet.</span>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </AppChrome>
  );
}
