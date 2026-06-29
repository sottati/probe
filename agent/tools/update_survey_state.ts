import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

const confidenceSchema = z.enum(["missing", "low", "medium", "high"]);

export default defineTool({
  description: "Record known facts, missing required fields, confidence, fatigue, and next decision.",
  inputSchema: z.object({
    responseId: z.string().min(1),
    knownFacts: z.record(z.string(), z.string()),
    missingRequiredFields: z.array(z.string()),
    fieldConfidence: z.record(z.string(), confidenceSchema),
    turnCount: z.number().int().min(0),
    fatigueSignal: z.enum(["none", "mild", "strong"]),
    nextBestQuestion: z.string().optional(),
    completionDecision: z.enum(["continue", "complete"]),
  }),
  outputSchema: z.object({
    saved: z.boolean(),
    sufficientFields: z.number(),
    updatedAt: z.string(),
  }),
  async execute(input) {
    const dir = path.join(process.cwd(), ".probe-data");
    await mkdir(dir, { recursive: true });
    const updatedAt = new Date().toISOString();
    await appendFile(path.join(dir, "eve-events.jsonl"), `${JSON.stringify({ type: "state", updatedAt, ...input })}\n`);
    return {
      saved: true,
      sufficientFields: Object.values(input.fieldConfidence).filter((value) => value === "medium" || value === "high")
        .length,
      updatedAt,
    };
  },
});
