import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { CreditTopUp } from "@/components/CreditTopUp";
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
      <section className="section">
        <h1>Research dashboard</h1>
        <p className="muted">Create conversational surveys, share public links, and review structured responses.</p>
      </section>

      <section className="grid grid-3 section">
        <div className="panel metric">
          <span>Credits remaining</span>
          <strong>${workspace.creditBalanceUsd.toFixed(2)}</strong>
        </div>
        <div className="panel metric">
          <span>Completion rate</span>
          <strong>{total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%"}</strong>
        </div>
        <div className="panel metric">
          <span>Avg. cost per completed response</span>
          <strong>${avgCost.toFixed(4)}</strong>
        </div>
      </section>

      <section className="section">
        <CreditTopUp />
      </section>

      <section className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Survey</th>
              <th>Status</th>
              <th>Responses</th>
              <th>Public link</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {db.surveys.map((survey) => {
              const responses = db.responses.filter((response) => response.surveyId === survey.id);
              return (
                <tr key={survey.id}>
                  <td>
                    <strong>{survey.title}</strong>
                    <div className="muted">{survey.spec.goal}</div>
                  </td>
                  <td>{survey.status}</td>
                  <td>{responses.length}</td>
                  <td>
                    {survey.publicToken ? (
                      <Link href={`/r/${survey.publicToken}`}>/r/{survey.publicToken}</Link>
                    ) : (
                      <span className="muted">Not published</span>
                    )}
                  </td>
                  <td>
                    <Link className="button" href={`/surveys/${survey.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
            {db.surveys.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <span className="muted">No surveys yet.</span>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </AppChrome>
  );
}
