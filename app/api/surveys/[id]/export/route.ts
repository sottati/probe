import { NextResponse } from "next/server";
import { addExportRecord, createId, getSurveyById, readDb } from "@/lib/store";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const survey = await getSurveyById(id);
  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

  const format = new URL(request.url).searchParams.get("format") ?? "json";
  const exportFormat = format === "csv" ? "csv" : "json";
  const db = await readDb();
  const responses = db.responses.filter((response) => response.surveyId === survey.id);
  const answers = db.structuredAnswers.filter((answer) =>
    responses.some((response) => response.id === answer.responseId),
  );
  const payload = answers.map((answer) => {
    const response = responses.find((item) => item.id === answer.responseId);
    return {
      responseId: answer.responseId,
      status: response?.status,
      completionReason: response?.completionReason,
      summary: answer.summary,
      quotes: answer.quotes,
      ...answer.fields,
    };
  });

  await addExportRecord({
    id: createId("export"),
    surveyId: survey.id,
    format: exportFormat,
    createdAt: new Date().toISOString(),
  });

  if (exportFormat === "csv") {
    const headers = ["responseId", "status", "completionReason", "summary", ...survey.spec.mustCapture.map((f) => f.id)];
    const rows = payload.map((row) => headers.map((header) => csvEscape(row[header as keyof typeof row])).join(","));
    return new Response([headers.join(","), ...rows].join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${survey.id}.csv"`,
      },
    });
  }

  return NextResponse.json({ survey: survey.title, responses: payload });
}
