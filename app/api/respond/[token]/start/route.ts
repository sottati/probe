import { NextResponse } from "next/server";
import { firstQuestion, initialState } from "@/lib/interview-engine";
import { addRespondent, addResponse, addTurn, createId, getSurveyByToken, readDb } from "@/lib/store";

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const survey = await getSurveyByToken(token);
  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

  const db = await readDb();
  const workspace = db.workspaces.find((item) => item.id === survey.workspaceId);
  if (!workspace || workspace.creditBalanceUsd <= 0) {
    return NextResponse.json(
      { error: "This survey is paused because the workspace has no remaining AI credits." },
      { status: 402 },
    );
  }

  const timestamp = new Date().toISOString();
  const respondent = await addRespondent({
    id: createId("respondent"),
    surveyId: survey.id,
    anonKey: createId("anon"),
    createdAt: timestamp,
  });
  const responseId = createId("response");
  const state = initialState(responseId, survey.spec);
  const response = await addResponse({
    id: responseId,
    surveyId: survey.id,
    respondentId: respondent.id,
    status: "in_progress",
    state,
    startedAt: timestamp,
  });
  const opening = await addTurn({
    id: createId("turn"),
    responseId,
    role: "agent",
    content: firstQuestion(survey.spec),
    createdAt: timestamp,
  });

  return NextResponse.json({ response, turns: [opening], progress: 0 });
}
