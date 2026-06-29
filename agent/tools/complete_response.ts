import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Mark a respondent response complete with the reason for closure.",
  inputSchema: z.object({
    responseId: z.string().min(1),
    completionReason: z.enum(["required_fields_captured", "max_turns", "respondent_stopped"]),
  }),
  outputSchema: z.object({
    completed: z.boolean(),
    completedAt: z.string(),
  }),
  async execute(input) {
    const dir = path.join(process.cwd(), ".probe-data");
    await mkdir(dir, { recursive: true });
    const completedAt = new Date().toISOString();
    await appendFile(path.join(dir, "eve-events.jsonl"), `${JSON.stringify({ type: "complete", completedAt, ...input })}\n`);
    return { completed: true, completedAt };
  },
});
