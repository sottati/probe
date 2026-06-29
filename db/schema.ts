import {
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const responseStatus = pgEnum("response_status", ["in_progress", "completed", "abandoned"]);
export const turnRole = pgEnum("turn_role", ["agent", "respondent", "system"]);
export const ledgerType = pgEnum("ledger_type", ["grant", "debit", "adjustment"]);

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  clerkOrgId: text("clerk_org_id"),
  creditBalanceUsd: numeric("credit_balance_usd", { precision: 12, scale: 4 }).notNull().default("0"),
  monthlyBudgetUsd: numeric("monthly_budget_usd", { precision: 12, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id).notNull(),
  clerkUserId: text("clerk_user_id"),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const surveys = pgTable("surveys", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id).notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  spec: jsonb("spec").notNull(),
  publicToken: text("public_token").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const surveySpecs = pgTable("survey_specs", {
  id: text("id").primaryKey(),
  surveyId: text("survey_id").references(() => surveys.id).notNull(),
  version: integer("version").notNull(),
  spec: jsonb("spec").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const surveyLinks = pgTable("survey_links", {
  id: text("id").primaryKey(),
  surveyId: text("survey_id").references(() => surveys.id).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const respondents = pgTable("respondents", {
  id: text("id").primaryKey(),
  surveyId: text("survey_id").references(() => surveys.id).notNull(),
  anonKey: text("anon_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const responses = pgTable("responses", {
  id: text("id").primaryKey(),
  surveyId: text("survey_id").references(() => surveys.id).notNull(),
  respondentId: text("respondent_id").references(() => respondents.id).notNull(),
  status: responseStatus("status").notNull().default("in_progress"),
  completionReason: text("completion_reason"),
  state: jsonb("state").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const conversationTurns = pgTable("conversation_turns", {
  id: text("id").primaryKey(),
  responseId: text("response_id").references(() => responses.id).notNull(),
  role: turnRole("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const surveyStateSnapshots = pgTable("survey_state_snapshots", {
  id: text("id").primaryKey(),
  responseId: text("response_id").references(() => responses.id).notNull(),
  state: jsonb("state").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const structuredAnswers = pgTable("structured_answers", {
  id: text("id").primaryKey(),
  responseId: text("response_id").references(() => responses.id).notNull(),
  fields: jsonb("fields").notNull(),
  quotes: jsonb("quotes").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiUsageEvents = pgTable("ai_usage_events", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id).notNull(),
  surveyId: text("survey_id").references(() => surveys.id).notNull(),
  responseId: text("response_id").references(() => responses.id),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  phase: text("phase").notNull(),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  providerCostUsd: numeric("provider_cost_usd", { precision: 12, scale: 6 }).notNull(),
  creditDebitUsd: numeric("credit_debit_usd", { precision: 12, scale: 6 }).notNull(),
  rawUsage: jsonb("raw_usage").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditLedger = pgTable("credit_ledger", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id).notNull(),
  type: ledgerType("type").notNull(),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 4 }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exports = pgTable("exports", {
  id: text("id").primaryKey(),
  surveyId: text("survey_id").references(() => surveys.id).notNull(),
  format: text("format").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
