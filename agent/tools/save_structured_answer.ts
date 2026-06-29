import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Save extracted structured answers, useful quotes, and a short respondent summary.",
  inputSchema: z.object({
    responseId: z.string().min(1),
    fields: z.record(z.string(), z.string()),
    quotes: z.array(z.string()).max(5),
    summary: z.string().min(1),
  }),
  outputSchema: z.object({
    saved: z.boolean(),
    createdAt: z.string(),
  }),
  async execute(input) {
    const dir = path.join(process.cwd(), ".probe-data");
    await mkdir(dir, { recursive: true });
    const createdAt = new Date().toISOString();
    await appendFile(path.join(dir, "eve-events.jsonl"), `${JSON.stringify({ type: "structured_answer", createdAt, ...input })}\n`);
    return { saved: true, createdAt };
  },
});
