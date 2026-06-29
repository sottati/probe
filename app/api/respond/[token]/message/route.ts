import { NextResponse } from "next/server";
import { advanceInterview, estimateUsage, extractStructuredAnswer } from "@/lib/interview-engine";
import { polishInterviewTurn } from "@/lib/openrouter";
import {
  addStructuredAnswer,
  addTurn,
  addUsageEvent,
  createId,
  getSurveyByToken,
  readDb,
  updateResponse,
} from "@/lib/store";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const survey = await getSurveyByToken(token);
  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

  const { responseId, message } = (await request.json()) as { responseId?: string; message?: string };
  if (!responseId || !message?.trim()) {
    return NextResponse.json({ error: "responseId and message are required" }, { status: 400 });
  }

  const db = await readDb();
  const response = db.responses.find((item) => item.id === responseId && item.surveyId === survey.id);
  if (!response) return NextResponse.json({ error: "Response not found" }, { status: 404 });
  if (response.status !== "in_progress") {
    return NextResponse.json({ error: "Response already closed" }, { status: 409 });
  }

  const timestamp = new Date().toISOString();
  const respondentTurn = await addTurn({
    id: createId("turn"),
    responseId,
    role: "respondent",
    content: message.trim(),
    createdAt: timestamp,
  });

  const result = advanceInterview({ spec: survey.spec, state: response.state, respondentMessage: message.trim() });
  const providerTurn = await polishInterviewTurn({
    specTitle: survey.title,
    goal: survey.spec.goal,
    audience: survey.spec.audience,
    tone: survey.spec.tone,
    proposedMessage: result.agentMessage,
    respondentMessage: message.trim(),
  });
  const agentMessage = providerTurn?.content ?? result.agentMessage;
  const agentTurn = await addTurn({
    id: createId("turn"),
    responseId,
    role: "agent",
    content: agentMessage,
    createdAt: new Date().toISOString(),
  });

  const updatedResponse = await updateResponse({
    ...response,
    state: result.state,
    status: result.completed ? "completed" : "in_progress",
    completionReason: result.completionReason,
    completedAt: result.completed ? new Date().toISOString() : undefined,
  });

  const usage = providerTurn ?? estimateUsage(`${message}\n${agentMessage}`);
  await addUsageEvent({
    id: createId("usage"),
    workspaceId: survey.workspaceId,
    surveyId: survey.id,
    responseId,
    provider: providerTurn ? "openrouter" : "local-fallback",
    model: process.env.PROBE_INTERVIEW_MODEL ?? "deterministic-mvp",
    phase: "interview",
    rawUsage: usage,
    createdAt: new Date().toISOString(),
    ...usage,
  });

  let structuredAnswer = undefined;
  if (result.completed) {
    const latestDb = await readDb();
    const turns = latestDb.turns.filter((turn) => turn.responseId === responseId);
    const extracted = extractStructuredAnswer({ spec: survey.spec, state: result.state, turns });
    structuredAnswer = await addStructuredAnswer({
      id: createId("answer"),
      responseId,
      fields: extracted.fields,
      quotes: extracted.quotes,
      summary: extracted.summary,
      createdAt: new Date().toISOString(),
    });
    const extractionUsage = estimateUsage(JSON.stringify(extracted));
    await addUsageEvent({
      id: createId("usage"),
      workspaceId: survey.workspaceId,
      surveyId: survey.id,
      responseId,
      provider: process.env.OPENROUTER_API_KEY ? "openrouter" : "local-fallback",
      model: process.env.PROBE_EXTRACTION_MODEL ?? "deterministic-extractor",
      phase: "extraction",
      rawUsage: extractionUsage,
      createdAt: new Date().toISOString(),
      ...extractionUsage,
    });
  }

  const captured = Object.keys(result.state.capturedFields).length;
  const total = survey.spec.mustCapture.length || 1;
  return NextResponse.json({
    response: updatedResponse,
    turns: [respondentTurn, agentTurn],
    structuredAnswer,
    progress: Math.min(100, Math.round((captured / total) * 100)),
  });
}
