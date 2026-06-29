import { NextResponse } from "next/server";
import { z } from "zod";
import { addCredit, createId, getWorkspace } from "@/lib/store";

const creditSchema = z.object({
  amountUsd: z.coerce.number().min(1).max(10000),
  reason: z.string().trim().min(2).max(160).default("manual pilot top-up"),
});

export async function POST(request: Request) {
  const input = creditSchema.parse(await request.json());
  const workspace = await getWorkspace();
  const entry = await addCredit({
    id: createId("ledger"),
    workspaceId: workspace.id,
    type: "grant",
    amountUsd: input.amountUsd,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ entry });
}
