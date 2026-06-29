import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Record provider usage and commercial credit debit for an AI call.",
  inputSchema: z.object({
    workspaceId: z.string().min(1),
    surveyId: z.string().min(1),
    responseId: z.string().optional(),
    provider: z.string().min(1),
    model: z.string().min(1),
    phase: z.enum(["interview", "extraction", "preview", "insights"]),
    promptTokens: z.number().int().min(0),
    completionTokens: z.number().int().min(0),
    providerCostUsd: z.number().min(0),
    creditDebitUsd: z.number().min(0),
  }),
  outputSchema: z.object({
    metered: z.boolean(),
    createdAt: z.string(),
  }),
  async execute(input) {
    const dir = path.join(process.cwd(), ".probe-data");
    await mkdir(dir, { recursive: true });
    const createdAt = new Date().toISOString();
    await appendFile(path.join(dir, "eve-events.jsonl"), `${JSON.stringify({ type: "usage", createdAt, ...input })}\n`);
    return { metered: true, createdAt };
  },
});
