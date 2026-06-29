import { NextResponse } from "next/server";
import { createId, getSurveyById, updateSurvey } from "@/lib/store";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const survey = await getSurveyById(id);
  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

  const published = await updateSurvey({
    ...survey,
    status: "published",
    publicToken: survey.publicToken ?? createId("link"),
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ survey: published });
}
