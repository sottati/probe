import { NextResponse } from "next/server";
import { builderInputSchema } from "@/lib/types";
import { buildSurveySpec } from "@/lib/survey-spec";
import { addSurvey, createId, getWorkspace, readDb } from "@/lib/store";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ surveys: db.surveys, workspace: db.workspaces[0] });
}

export async function POST(request: Request) {
  const json = await request.json();
  const input = builderInputSchema.parse(json);
  const workspace = await getWorkspace();
  const id = createId("survey");
  const timestamp = new Date().toISOString();
  const spec = buildSurveySpec(id, input);
  const survey = await addSurvey({
    id,
    workspaceId: workspace.id,
    title: input.title,
    status: "draft",
    spec,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return NextResponse.json({ survey }, { status: 201 });
}
