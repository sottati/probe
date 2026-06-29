import { z } from "zod";

export const toneSchema = z.enum(["professional", "casual", "direct", "warm"]);
export type SurveyTone = z.infer<typeof toneSchema>;

export const builderInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  brand: z.string().trim().min(2).max(80),
  goal: z.string().trim().min(12).max(600),
  audience: z.string().trim().min(5).max(300),
  mustCaptureText: z.string().trim().min(5).max(1200),
  optionalProbesText: z.string().trim().max(800).optional().default(""),
  estimatedMinutes: z.coerce.number().int().refine((value) => [3, 5, 10].includes(value)),
  tone: toneSchema,
  monthlyBudgetUsd: z.coerce.number().min(1).max(10000).default(25),
});

export type BuilderInput = z.infer<typeof builderInputSchema>;

export type SurveyField = {
  id: string;
  label: string;
  description: string;
  captureGuidance: string;
};

export type SurveySpec = {
  id: string;
  title: string;
  brand: string;
  audience: string;
  goal: string;
  estimatedMinutes: 3 | 5 | 10;
  maxTurns: number;
  tone: SurveyTone;
  mustCapture: SurveyField[];
  optionalProbes: SurveyField[];
  disallowed: string[];
  completionCriteria: string[];
  openingMessage: string;
  outputSchema: Record<string, unknown>;
};

export type SurveyStatus = "draft" | "published";
export type ResponseStatus = "in_progress" | "completed" | "abandoned";
export type TurnRole = "agent" | "respondent" | "system";
export type FieldConfidence = "missing" | "low" | "medium" | "high";

export type Workspace = {
  id: string;
  name: string;
  creditBalanceUsd: number;
  monthlyBudgetUsd: number;
  createdAt: string;
};

export type Survey = {
  id: string;
  workspaceId: string;
  title: string;
  status: SurveyStatus;
  spec: SurveySpec;
  publicToken?: string;
  createdAt: string;
  updatedAt: string;
};

export type Respondent = {
  id: string;
  surveyId: string;
  anonKey: string;
  createdAt: string;
};

export type ConversationTurn = {
  id: string;
  responseId: string;
  role: TurnRole;
  content: string;
  createdAt: string;
};

export type InterviewState = {
  responseId: string;
  currentFieldId?: string;
  capturedFields: Record<string, string>;
  missingFields: string[];
  fieldConfidence: Record<string, FieldConfidence>;
  turnCount: number;
  fatigueSignal: "none" | "mild" | "strong";
  nextBestQuestion?: string;
  completionDecision: "continue" | "complete";
};

export type Response = {
  id: string;
  surveyId: string;
  respondentId: string;
  status: ResponseStatus;
  completionReason?: string;
  state: InterviewState;
  startedAt: string;
  completedAt?: string;
};

export type StructuredAnswer = {
  id: string;
  responseId: string;
  fields: Record<string, string>;
  quotes: string[];
  summary: string;
  createdAt: string;
};

export type AiUsageEvent = {
  id: string;
  workspaceId: string;
  surveyId: string;
  responseId?: string;
  provider: string;
  model: string;
  phase: "interview" | "extraction" | "preview" | "insights";
  promptTokens: number;
  completionTokens: number;
  providerCostUsd: number;
  creditDebitUsd: number;
  rawUsage: Record<string, unknown>;
  createdAt: string;
};

export type CreditLedgerEntry = {
  id: string;
  workspaceId: string;
  type: "grant" | "debit" | "adjustment";
  amountUsd: number;
  reason: string;
  createdAt: string;
};

export type ExportRecord = {
  id: string;
  surveyId: string;
  format: "csv" | "json";
  createdAt: string;
};

export type ProbeDb = {
  workspaces: Workspace[];
  surveys: Survey[];
  respondents: Respondent[];
  responses: Response[];
  turns: ConversationTurn[];
  structuredAnswers: StructuredAnswer[];
  aiUsageEvents: AiUsageEvent[];
  creditLedger: CreditLedgerEntry[];
  exports: ExportRecord[];
};
