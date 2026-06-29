import { createOpenAI } from "@ai-sdk/openai";
import { defineAgent } from "eve";

const openrouter = createOpenAI({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "missing-openrouter-api-key",
  headers: {
    "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:3000",
    "X-OpenRouter-Title": process.env.OPENROUTER_APP_TITLE ?? "probe",
  },
});

export default defineAgent({
  model: openrouter.chat(process.env.PROBE_INTERVIEW_MODEL ?? "deepseek/deepseek-v4-flash"),
  modelContextWindowTokens: 1_048_576,
});
