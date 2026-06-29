import { NextResponse } from "next/server";
import { getSurveyByToken } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const survey = await getSurveyByToken(token);
  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

  return NextResponse.json({
    survey: {
      id: survey.id,
      title: survey.title,
      brand: survey.spec.brand,
      estimatedMinutes: survey.spec.estimatedMinutes,
      maxTurns: survey.spec.maxTurns,
      openingMessage: survey.spec.openingMessage,
    },
  });
}
