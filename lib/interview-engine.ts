import type { ConversationTurn, InterviewState, SurveySpec } from "@/lib/types";

const STOP_PATTERNS = /\b(terminar|terminemos|salir|no quiero|stop|end|finish|done)\b/i;
const SKIP_PATTERNS = /\b(no se|no sé|saltar|skip|prefiero no|ni idea)\b/i;

export function initialState(responseId: string, spec: SurveySpec): InterviewState {
  return {
    responseId,
    currentFieldId: spec.mustCapture[0]?.id,
    capturedFields: {},
    missingFields: spec.mustCapture.map((field) => field.id),
    fieldConfidence: Object.fromEntries(spec.mustCapture.map((field) => [field.id, "missing"])),
    turnCount: 0,
    fatigueSignal: "none",
    completionDecision: "continue",
  };
}

export function firstQuestion(spec: SurveySpec) {
  const firstField = spec.mustCapture[0];
  if (!firstField) return "Gracias por participar. ¿Hay algo que quieras contarnos?";
  return `${spec.openingMessage} Para empezar, ¿me contas sobre ${firstField.label.toLowerCase()}?`;
}

function isVagueAnswer(answer: string) {
  const trimmed = answer.trim();
  return trimmed.length < 14 || /^(si|no|tal vez|depende|ok|claro)$/i.test(trimmed);
}

function askForField(fieldLabel: string, tone: SurveySpec["tone"]) {
  if (tone === "direct") return `¿Que deberia capturar sobre ${fieldLabel.toLowerCase()}?`;
  if (tone === "casual") return `¿Como describirias ${fieldLabel.toLowerCase()}?`;
  if (tone === "warm") return `Cuando puedas, contame un poco mas sobre ${fieldLabel.toLowerCase()}.`;
  return `¿Podrias contarme sobre ${fieldLabel.toLowerCase()}?`;
}

function followUpForField(fieldLabel: string) {
  return `Para entenderlo mejor, ¿podes darme un ejemplo concreto sobre ${fieldLabel.toLowerCase()}?`;
}

export function advanceInterview(params: {
  spec: SurveySpec;
  state: InterviewState;
  respondentMessage: string;
}): { state: InterviewState; agentMessage: string; completed: boolean; completionReason?: string } {
  const { spec, respondentMessage } = params;
  const state: InterviewState = {
    ...params.state,
    capturedFields: { ...params.state.capturedFields },
    missingFields: [...params.state.missingFields],
    fieldConfidence: { ...params.state.fieldConfidence },
    turnCount: params.state.turnCount + 1,
  };

  if (STOP_PATTERNS.test(respondentMessage)) {
    state.completionDecision = "complete";
    return {
      state,
      agentMessage: "Gracias, cierro aca. Tu respuesta ya quedo registrada.",
      completed: true,
      completionReason: "respondent_stopped",
    };
  }

  const currentField = spec.mustCapture.find((field) => field.id === state.currentFieldId);
  if (currentField) {
    if (SKIP_PATTERNS.test(respondentMessage)) {
      state.capturedFields[currentField.id] = "skipped";
      state.fieldConfidence[currentField.id] = "low";
    } else if (isVagueAnswer(respondentMessage) && state.fieldConfidence[currentField.id] !== "low") {
      state.fieldConfidence[currentField.id] = "low";
      state.nextBestQuestion = followUpForField(currentField.label);
      return {
        state,
        agentMessage: state.nextBestQuestion,
        completed: false,
      };
    } else {
      const existing = state.capturedFields[currentField.id];
      state.capturedFields[currentField.id] = existing ? `${existing} ${respondentMessage}` : respondentMessage;
      state.fieldConfidence[currentField.id] = isVagueAnswer(respondentMessage) ? "medium" : "high";
    }
  }

  state.missingFields = spec.mustCapture
    .filter((field) => !state.capturedFields[field.id])
    .map((field) => field.id);

  if (state.missingFields.length === 0) {
    state.completionDecision = "complete";
    return {
      state,
      agentMessage: "Tengo lo necesario. Gracias por compartir el contexto; esto ayuda a entender mejor las respuestas.",
      completed: true,
      completionReason: "required_fields_captured",
    };
  }

  if (state.turnCount >= spec.maxTurns) {
    state.completionDecision = "complete";
    return {
      state,
      agentMessage: "Llegamos al limite previsto. Gracias por responder; cierro la conversacion aca.",
      completed: true,
      completionReason: "max_turns",
    };
  }

  const nextField = spec.mustCapture.find((field) => field.id === state.missingFields[0]);
  state.currentFieldId = nextField?.id;
  state.nextBestQuestion = nextField ? askForField(nextField.label, spec.tone) : undefined;
  state.fatigueSignal = state.turnCount > Math.ceil(spec.maxTurns * 0.75) ? "mild" : "none";

  return {
    state,
    agentMessage: state.nextBestQuestion ?? "¿Hay algo mas que quieras agregar?",
    completed: false,
  };
}

export function extractStructuredAnswer(params: {
  spec: SurveySpec;
  state: InterviewState;
  turns: ConversationTurn[];
}) {
  const quotes = params.turns
    .filter((turn) => turn.role === "respondent")
    .map((turn) => turn.content)
    .filter((content) => content.length > 20)
    .slice(0, 3);

  const fieldSummaries = params.spec.mustCapture
    .map((field) => {
      const value = params.state.capturedFields[field.id];
      return value && value !== "skipped" ? `${field.label}: ${value}` : undefined;
    })
    .filter(Boolean);

  return {
    fields: params.state.capturedFields,
    quotes,
    summary:
      fieldSummaries.length > 0
        ? fieldSummaries.join(" | ")
        : "El respondent no aporto suficiente informacion estructurable.",
  };
}

export function estimateUsage(text: string) {
  const tokens = Math.max(20, Math.ceil(text.length / 4));
  const providerCostUsd = Number(((tokens / 1000) * 0.0008).toFixed(6));
  const creditDebitUsd = Number(Math.max(providerCostUsd * 2, 0.0001).toFixed(6));
  return {
    promptTokens: tokens,
    completionTokens: Math.ceil(tokens * 0.6),
    providerCostUsd,
    creditDebitUsd,
  };
}
