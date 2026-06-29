import "server-only";

type OpenRouterUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: number;
};

type OpenRouterChoice = {
  message?: {
    content?: string;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  usage?: OpenRouterUsage;
};

export type ProviderResult = {
  content: string;
  promptTokens: number;
  completionTokens: number;
  providerCostUsd: number;
  creditDebitUsd: number;
  rawUsage: Record<string, unknown>;
};

export async function polishInterviewTurn(params: {
  specTitle: string;
  goal: string;
  audience: string;
  tone: string;
  proposedMessage: string;
  respondentMessage: string;
}): Promise<ProviderResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:3000",
      "X-OpenRouter-Title": process.env.OPENROUTER_APP_TITLE ?? "probe",
    },
    body: JSON.stringify({
      model: process.env.PROBE_INTERVIEW_MODEL ?? "deepseek/deepseek-v4-flash",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You rewrite a conversational survey agent's next message. Keep exactly one question unless the proposed message is a closing. Be brief, neutral, and never add new requirements. Return JSON: {\"message\":\"...\"}.",
        },
        {
          role: "user",
          content: JSON.stringify(params),
        },
      ],
    }),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as OpenRouterResponse;
  const rawContent = payload.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  let content = params.proposedMessage;
  try {
    const parsed = JSON.parse(rawContent) as { message?: string };
    if (parsed.message?.trim()) content = parsed.message.trim();
  } catch {
    content = rawContent.trim();
  }

  const usage = payload.usage ?? {};
  const providerCostUsd = Number(usage.cost ?? 0);
  const creditDebitUsd = Number(Math.max(providerCostUsd * 2, 0.0001).toFixed(6));

  return {
    content,
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    providerCostUsd,
    creditDebitUsd,
    rawUsage: usage as Record<string, unknown>,
  };
}
