import type { BuilderInput, SurveyField, SurveySpec } from "@/lib/types";

const DEFAULT_DISALLOWED = [
  "hacer dos preguntas en un mismo turno",
  "presionar al usuario",
  "inventar opciones",
  "actuar como soporte tecnico general",
];

const COMPLETION_CRITERIA = [
  "todos los mustCapture tienen respuesta suficiente",
  "o el usuario pide terminar",
  "o se alcanza maxTurns",
];

export function slugifyId(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function parseFields(text: string): SurveyField[] {
  return text
    .split(/\r?\n|,/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((label, index) => {
      const id = slugifyId(label) || `field_${index + 1}`;
      return {
        id,
        label,
        description: `Capture: ${label}`,
        captureGuidance: `Ask one neutral question that helps capture "${label}". Mark it low confidence if the answer is vague.`,
      };
    });
}

export function maxTurnsForMinutes(minutes: 3 | 5 | 10) {
  if (minutes === 3) return 7;
  if (minutes === 5) return 10;
  return 16;
}

export function buildSurveySpec(id: string, input: BuilderInput): SurveySpec {
  const estimatedMinutes = input.estimatedMinutes as 3 | 5 | 10;
  const mustCapture = parseFields(input.mustCaptureText);
  const optionalProbes = parseFields(input.optionalProbesText ?? "");

  return {
    id,
    title: input.title,
    brand: input.brand,
    audience: input.audience,
    goal: input.goal,
    estimatedMinutes,
    maxTurns: maxTurnsForMinutes(estimatedMinutes),
    tone: input.tone,
    mustCapture,
    optionalProbes,
    disallowed: DEFAULT_DISALLOWED,
    completionCriteria: COMPLETION_CRITERIA,
    openingMessage: `Gracias por participar. Te voy a hacer algunas preguntas cortas para ${input.goal.toLowerCase()}.`,
    outputSchema: Object.fromEntries(mustCapture.map((field) => [field.id, "string"])),
  };
}

export function previewQuestions(spec: SurveySpec) {
  const toneNudge = {
    professional: "Para empezar",
    casual: "Arranquemos",
    direct: "Primero",
    warm: "Gracias de nuevo. Para empezar",
  }[spec.tone];

  return spec.mustCapture.slice(0, 4).map((field, index) => {
    if (index === 0) return `${toneNudge}, ¿me contas brevemente sobre ${field.label.toLowerCase()}?`;
    return `¿Que deberia saber sobre ${field.label.toLowerCase()}?`;
  });
}
