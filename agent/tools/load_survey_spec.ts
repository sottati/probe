import { readFile } from "node:fs/promises";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

async function readLocalDb() {
  const file = path.join(process.cwd(), ".probe-data", "db.json");
  const raw = await readFile(file, "utf8");
  return JSON.parse(raw) as { surveys: Array<{ id: string; publicToken?: string; spec: unknown }> };
}

export default defineTool({
  description: "Load a probe SurveySpec by survey id or public link token.",
  inputSchema: z.object({
    surveyId: z.string().optional(),
    token: z.string().optional(),
  }),
  outputSchema: z.object({
    survey: z.any(),
  }),
  async execute(input) {
    const db = await readLocalDb();
    const survey = db.surveys.find((item) => item.id === input.surveyId || item.publicToken === input.token);
    if (!survey) throw new Error("SurveySpec not found");
    return { survey: survey.spec };
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: output.survey,
    };
  },
});
