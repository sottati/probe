import "server-only";

import { desc, eq } from "drizzle-orm";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDrizzleDb } from "@/db/client";
import * as schema from "@/db/schema";
import type {
  AiUsageEvent,
  ConversationTurn,
  CreditLedgerEntry,
  ExportRecord,
  ProbeDb,
  Respondent,
  Response,
  StructuredAnswer,
  Survey,
  Workspace,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".probe-data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const DEFAULT_WORKSPACE_ID = "workspace_demo";

function now() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
}

function emptyDb(): ProbeDb {
  const workspace: Workspace = {
    id: DEFAULT_WORKSPACE_ID,
    name: "Demo workspace",
    creditBalanceUsd: 25,
    monthlyBudgetUsd: 25,
    createdAt: now(),
  };

  return {
    workspaces: [workspace],
    surveys: [],
    respondents: [],
    responses: [],
    turns: [],
    structuredAnswers: [],
    aiUsageEvents: [],
    exports: [],
    creditLedger: [
      {
        id: createId("ledger"),
        workspaceId: workspace.id,
        type: "grant",
        amountUsd: 25,
        reason: "pilot starting balance",
        createdAt: now(),
      },
    ],
  };
}

function normalizeDb(db: ProbeDb): ProbeDb {
  db.exports ??= [];
  db.creditLedger ??= [];
  db.aiUsageEvents ??= [];
  db.structuredAnswers ??= [];
  db.turns ??= [];
  db.responses ??= [];
  db.respondents ??= [];
  db.surveys ??= [];
  db.workspaces ??= [];
  return db;
}

function usePostgresStore() {
  return process.env.PROBE_STORE === "postgres";
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

function mapWorkspace(row: typeof schema.workspaces.$inferSelect): Workspace {
  return {
    id: row.id,
    name: row.name,
    creditBalanceUsd: toNumber(row.creditBalanceUsd),
    monthlyBudgetUsd: toNumber(row.monthlyBudgetUsd),
    createdAt: toIso(row.createdAt) ?? now(),
  };
}

function mapSurvey(row: typeof schema.surveys.$inferSelect): Survey {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    title: row.title,
    status: row.status as Survey["status"],
    spec: row.spec as Survey["spec"],
    publicToken: row.publicToken ?? undefined,
    createdAt: toIso(row.createdAt) ?? now(),
    updatedAt: toIso(row.updatedAt) ?? now(),
  };
}

function mapRespondent(row: typeof schema.respondents.$inferSelect): Respondent {
  return {
    id: row.id,
    surveyId: row.surveyId,
    anonKey: row.anonKey,
    createdAt: toIso(row.createdAt) ?? now(),
  };
}

function mapResponse(row: typeof schema.responses.$inferSelect): Response {
  return {
    id: row.id,
    surveyId: row.surveyId,
    respondentId: row.respondentId,
    status: row.status,
    completionReason: row.completionReason ?? undefined,
    state: row.state as Response["state"],
    startedAt: toIso(row.startedAt) ?? now(),
    completedAt: toIso(row.completedAt),
  };
}

function mapTurn(row: typeof schema.conversationTurns.$inferSelect): ConversationTurn {
  return {
    id: row.id,
    responseId: row.responseId,
    role: row.role,
    content: row.content,
    createdAt: toIso(row.createdAt) ?? now(),
  };
}

function mapStructuredAnswer(row: typeof schema.structuredAnswers.$inferSelect): StructuredAnswer {
  return {
    id: row.id,
    responseId: row.responseId,
    fields: row.fields as Record<string, string>,
    quotes: row.quotes as string[],
    summary: row.summary,
    createdAt: toIso(row.createdAt) ?? now(),
  };
}

function mapUsageEvent(row: typeof schema.aiUsageEvents.$inferSelect): AiUsageEvent {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    surveyId: row.surveyId,
    responseId: row.responseId ?? undefined,
    provider: row.provider,
    model: row.model,
    phase: row.phase as AiUsageEvent["phase"],
    promptTokens: row.promptTokens,
    completionTokens: row.completionTokens,
    providerCostUsd: toNumber(row.providerCostUsd),
    creditDebitUsd: toNumber(row.creditDebitUsd),
    rawUsage: row.rawUsage as Record<string, unknown>,
    createdAt: toIso(row.createdAt) ?? now(),
  };
}

function mapCreditLedger(row: typeof schema.creditLedger.$inferSelect): CreditLedgerEntry {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    type: row.type,
    amountUsd: toNumber(row.amountUsd),
    reason: row.reason,
    createdAt: toIso(row.createdAt) ?? now(),
  };
}

function mapExport(row: typeof schema.exports.$inferSelect): ExportRecord {
  return {
    id: row.id,
    surveyId: row.surveyId,
    format: row.format === "csv" ? "csv" : "json",
    createdAt: toIso(row.createdAt) ?? now(),
  };
}

async function ensurePgWorkspace() {
  const db = getDrizzleDb();
  const existing = await db.select().from(schema.workspaces).limit(1);
  if (existing[0]) return mapWorkspace(existing[0]);

  const createdAt = new Date();
  const workspace: Workspace = {
    id: DEFAULT_WORKSPACE_ID,
    name: "Demo workspace",
    creditBalanceUsd: 25,
    monthlyBudgetUsd: 25,
    createdAt: createdAt.toISOString(),
  };
  await db.insert(schema.workspaces).values({
    id: workspace.id,
    name: workspace.name,
    creditBalanceUsd: String(workspace.creditBalanceUsd),
    monthlyBudgetUsd: String(workspace.monthlyBudgetUsd),
    createdAt,
  });
  await db.insert(schema.creditLedger).values({
    id: createId("ledger"),
    workspaceId: workspace.id,
    type: "grant",
    amountUsd: "25",
    reason: "pilot starting balance",
    createdAt,
  });
  return workspace;
}

async function readPgDb(): Promise<ProbeDb> {
  await ensurePgWorkspace();
  const db = getDrizzleDb();
  const [workspaces, surveys, respondents, responses, turns, structuredAnswers, aiUsageEvents, creditLedger, exportsRows] =
    await Promise.all([
      db.select().from(schema.workspaces).orderBy(desc(schema.workspaces.createdAt)),
      db.select().from(schema.surveys).orderBy(desc(schema.surveys.createdAt)),
      db.select().from(schema.respondents).orderBy(desc(schema.respondents.createdAt)),
      db.select().from(schema.responses).orderBy(desc(schema.responses.startedAt)),
      db.select().from(schema.conversationTurns).orderBy(schema.conversationTurns.createdAt),
      db.select().from(schema.structuredAnswers).orderBy(desc(schema.structuredAnswers.createdAt)),
      db.select().from(schema.aiUsageEvents).orderBy(desc(schema.aiUsageEvents.createdAt)),
      db.select().from(schema.creditLedger).orderBy(desc(schema.creditLedger.createdAt)),
      db.select().from(schema.exports).orderBy(desc(schema.exports.createdAt)),
    ]);

  return {
    workspaces: workspaces.map(mapWorkspace),
    surveys: surveys.map(mapSurvey),
    respondents: respondents.map(mapRespondent),
    responses: responses.map(mapResponse),
    turns: turns.map(mapTurn),
    structuredAnswers: structuredAnswers.map(mapStructuredAnswer),
    aiUsageEvents: aiUsageEvents.map(mapUsageEvent),
    creditLedger: creditLedger.map(mapCreditLedger),
    exports: exportsRows.map(mapExport),
  };
}

export async function readDb(): Promise<ProbeDb> {
  if (usePostgresStore()) return readPgDb();

  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return normalizeDb(JSON.parse(raw) as ProbeDb);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
    const db = emptyDb();
    await writeDb(db);
    return db;
  }
}

export async function writeDb(db: ProbeDb) {
  if (usePostgresStore()) {
    throw new Error("writeDb is not supported when PROBE_STORE=postgres; use repository mutation helpers.");
  }

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(db, null, 2)}\n`);
}

export async function mutateDb<T>(mutator: (db: ProbeDb) => T | Promise<T>): Promise<T> {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

export async function getWorkspace() {
  if (usePostgresStore()) return ensurePgWorkspace();

  const db = await readDb();
  return db.workspaces[0];
}

export async function addSurvey(survey: Survey) {
  if (usePostgresStore()) {
    const db = getDrizzleDb();
    await db.insert(schema.surveys).values({
      id: survey.id,
      workspaceId: survey.workspaceId,
      title: survey.title,
      status: survey.status,
      spec: survey.spec,
      publicToken: survey.publicToken,
      createdAt: new Date(survey.createdAt),
      updatedAt: new Date(survey.updatedAt),
    });
    await db.insert(schema.surveySpecs).values({
      id: createId("spec"),
      surveyId: survey.id,
      version: 1,
      spec: survey.spec,
      createdAt: new Date(survey.createdAt),
    });
    return survey;
  }

  return mutateDb((db) => {
    db.surveys.unshift(survey);
    const workspace = db.workspaces.find((item) => item.id === survey.workspaceId);
    if (workspace) workspace.monthlyBudgetUsd = Math.max(workspace.monthlyBudgetUsd, 1);
    return survey;
  });
}

export async function updateSurvey(survey: Survey) {
  if (usePostgresStore()) {
    const db = getDrizzleDb();
    await db
      .update(schema.surveys)
      .set({
        title: survey.title,
        status: survey.status,
        spec: survey.spec,
        publicToken: survey.publicToken,
        updatedAt: new Date(survey.updatedAt),
      })
      .where(eq(schema.surveys.id, survey.id));
    if (survey.publicToken) {
      const existing = await db
        .select()
        .from(schema.surveyLinks)
        .where(eq(schema.surveyLinks.token, survey.publicToken))
        .limit(1);
      if (!existing[0]) {
        await db.insert(schema.surveyLinks).values({
          id: createId("survey_link"),
          surveyId: survey.id,
          token: survey.publicToken,
          createdAt: new Date(survey.updatedAt),
        });
      }
    }
    return survey;
  }

  return mutateDb((db) => {
    const index = db.surveys.findIndex((item) => item.id === survey.id);
    if (index >= 0) db.surveys[index] = survey;
    return survey;
  });
}

export async function addRespondent(respondent: Respondent) {
  if (usePostgresStore()) {
    await getDrizzleDb().insert(schema.respondents).values({
      id: respondent.id,
      surveyId: respondent.surveyId,
      anonKey: respondent.anonKey,
      createdAt: new Date(respondent.createdAt),
    });
    return respondent;
  }

  return mutateDb((db) => {
    db.respondents.push(respondent);
    return respondent;
  });
}

export async function addResponse(response: Response) {
  if (usePostgresStore()) {
    await getDrizzleDb().insert(schema.responses).values({
      id: response.id,
      surveyId: response.surveyId,
      respondentId: response.respondentId,
      status: response.status,
      completionReason: response.completionReason,
      state: response.state,
      startedAt: new Date(response.startedAt),
      completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
    });
    return response;
  }

  return mutateDb((db) => {
    db.responses.push(response);
    return response;
  });
}

export async function updateResponse(response: Response) {
  if (usePostgresStore()) {
    const db = getDrizzleDb();
    await db
      .update(schema.responses)
      .set({
        status: response.status,
        completionReason: response.completionReason,
        state: response.state,
        completedAt: response.completedAt ? new Date(response.completedAt) : null,
      })
      .where(eq(schema.responses.id, response.id));
    await db.insert(schema.surveyStateSnapshots).values({
      id: createId("state"),
      responseId: response.id,
      state: response.state,
      createdAt: new Date(),
    });
    return response;
  }

  return mutateDb((db) => {
    const index = db.responses.findIndex((item) => item.id === response.id);
    if (index >= 0) db.responses[index] = response;
    return response;
  });
}

export async function addTurn(turn: ConversationTurn) {
  if (usePostgresStore()) {
    await getDrizzleDb().insert(schema.conversationTurns).values({
      id: turn.id,
      responseId: turn.responseId,
      role: turn.role,
      content: turn.content,
      createdAt: new Date(turn.createdAt),
    });
    return turn;
  }

  return mutateDb((db) => {
    db.turns.push(turn);
    return turn;
  });
}

export async function addStructuredAnswer(answer: StructuredAnswer) {
  if (usePostgresStore()) {
    await getDrizzleDb().insert(schema.structuredAnswers).values({
      id: answer.id,
      responseId: answer.responseId,
      fields: answer.fields,
      quotes: answer.quotes,
      summary: answer.summary,
      createdAt: new Date(answer.createdAt),
    });
    return answer;
  }

  return mutateDb((db) => {
    db.structuredAnswers.push(answer);
    return answer;
  });
}

export async function addUsageEvent(event: AiUsageEvent) {
  if (usePostgresStore()) {
    const db = getDrizzleDb();
    await db.insert(schema.aiUsageEvents).values({
      id: event.id,
      workspaceId: event.workspaceId,
      surveyId: event.surveyId,
      responseId: event.responseId,
      provider: event.provider,
      model: event.model,
      phase: event.phase,
      promptTokens: event.promptTokens,
      completionTokens: event.completionTokens,
      providerCostUsd: String(event.providerCostUsd),
      creditDebitUsd: String(event.creditDebitUsd),
      rawUsage: event.rawUsage,
      createdAt: new Date(event.createdAt),
    });
    const workspace = await ensurePgWorkspace();
    const nextBalance = Number((workspace.creditBalanceUsd - event.creditDebitUsd).toFixed(4));
    await db
      .update(schema.workspaces)
      .set({ creditBalanceUsd: String(nextBalance) })
      .where(eq(schema.workspaces.id, event.workspaceId));
    await db.insert(schema.creditLedger).values({
      id: createId("ledger"),
      workspaceId: event.workspaceId,
      type: "debit",
      amountUsd: String(-event.creditDebitUsd),
      reason: `${event.phase} ${event.model}`,
      createdAt: new Date(event.createdAt),
    });
    return event;
  }

  return mutateDb((db) => {
    db.aiUsageEvents.push(event);
    const workspace = db.workspaces.find((item) => item.id === event.workspaceId);
    if (workspace) workspace.creditBalanceUsd = Number((workspace.creditBalanceUsd - event.creditDebitUsd).toFixed(4));
    db.creditLedger.push({
      id: createId("ledger"),
      workspaceId: event.workspaceId,
      type: "debit",
      amountUsd: -event.creditDebitUsd,
      reason: `${event.phase} ${event.model}`,
      createdAt: event.createdAt,
    });
    return event;
  });
}

export async function addCredit(entry: CreditLedgerEntry) {
  if (usePostgresStore()) {
    const db = getDrizzleDb();
    await db.insert(schema.creditLedger).values({
      id: entry.id,
      workspaceId: entry.workspaceId,
      type: entry.type,
      amountUsd: String(entry.amountUsd),
      reason: entry.reason,
      createdAt: new Date(entry.createdAt),
    });
    const workspace = await ensurePgWorkspace();
    const nextBalance = Number((workspace.creditBalanceUsd + entry.amountUsd).toFixed(4));
    await db
      .update(schema.workspaces)
      .set({ creditBalanceUsd: String(nextBalance) })
      .where(eq(schema.workspaces.id, entry.workspaceId));
    return entry;
  }

  return mutateDb((db) => {
    db.creditLedger.push(entry);
    const workspace = db.workspaces.find((item) => item.id === entry.workspaceId);
    if (workspace) workspace.creditBalanceUsd = Number((workspace.creditBalanceUsd + entry.amountUsd).toFixed(4));
    return entry;
  });
}

export async function addExportRecord(entry: ExportRecord) {
  if (usePostgresStore()) {
    await getDrizzleDb().insert(schema.exports).values({
      id: entry.id,
      surveyId: entry.surveyId,
      format: entry.format,
      createdAt: new Date(entry.createdAt),
    });
    return entry;
  }

  return mutateDb((db) => {
    db.exports ??= [];
    db.exports.push(entry);
    return entry;
  });
}

export async function getSurveyById(id: string) {
  if (usePostgresStore()) {
    const survey = await getDrizzleDb().select().from(schema.surveys).where(eq(schema.surveys.id, id)).limit(1);
    return survey[0] ? mapSurvey(survey[0]) : undefined;
  }

  const db = await readDb();
  return db.surveys.find((survey) => survey.id === id);
}

export async function getSurveyByToken(token: string) {
  if (usePostgresStore()) {
    const survey = await getDrizzleDb().select().from(schema.surveys).where(eq(schema.surveys.publicToken, token)).limit(1);
    const mapped = survey[0] ? mapSurvey(survey[0]) : undefined;
    return mapped?.status === "published" ? mapped : undefined;
  }

  const db = await readDb();
  return db.surveys.find((survey) => survey.publicToken === token && survey.status === "published");
}
