import { NextResponse } from "next/server";
import { getSurveyById, readDb } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const survey = await getSurveyById(id);
  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

  const db = await readDb();
  const responses = db.responses.filter((response) => response.surveyId === survey.id);
  const answers = db.structuredAnswers.filter((answer) =>
    responses.some((response) => response.id === answer.responseId),
  );
  const usage = db.aiUsageEvents.filter((event) => event.surveyId === survey.id);
  return NextResponse.json({ survey, responses, answers, usage });
}
