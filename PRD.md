# probe - PRD

Fecha: 2026-06-24
Estado: exploracion

## Que es

probe es un SaaS para crear encuestas conversacionales guiadas por agentes de AI. En vez de enviar formularios largos, el cliente configura un objetivo de investigacion y recibe un link publico donde cada respondent conversa con un agente que sabe que informacion debe recabar, cuando repreguntar y cuando cerrar.

La tesis central: un agente conversacional puede obtener respuestas mas utiles que un formulario cuando la calidad, claridad y profundidad de la informacion importan mas que la velocidad bruta de completar campos.

## Por que importa

Los formularios recolectan respuestas. probe busca recolectar entendimiento.

El valor aparece cuando la respuesta inicial suele ser incompleta, ambigua o demasiado superficial. Un buen agente puede pedir ejemplos, detectar contradicciones, pedir contexto y traducir una conversacion libre en datos estructurados comparables.

Casos fuertes:

- User research B2B.
- Entrevistas de churn.
- Product-market fit surveys.
- Customer onboarding.
- Employee feedback.
- Lead qualification compleja.
- Feedback post-demo o post-sales.
- Encuestas donde la opcion "otro" suele esconder lo mas valioso.

Casos debiles:

- NPS simple.
- Formularios regulatorios.
- Captura de datos objetivos.
- Surveys masivos donde el costo por respuesta debe ser minimo.

## Objetivos

- Permitir que un cliente cree una encuesta conversacional en menos de 10 minutos.
- Generar un link publico compartible sin setup tecnico.
- Lograr que el respondent complete una experiencia corta, clara y no invasiva.
- Convertir cada conversacion en datos estructurados, citas utiles y resumen.
- Medir costo de AI por encuesta, cliente y respondent.
- Validar si el formato conversacional produce mas insights accionables que un formulario equivalente.

## No objetivos iniciales

- Reemplazar formularios simples tipo Typeform o Google Forms.
- Crear un builder visual complejo de branching.
- Soportar todos los canales desde el dia uno.
- Hacer analisis estadistico avanzado.
- Permitir prompts libres sin guardrails.
- Deployar un agente separado por cada encuesta.

## Usuarios

### Cliente SaaS

Persona que crea encuestas. Puede ser founder, PM, researcher, marketer B2B, customer success o sales.

Necesita:

- Definir que quiere aprender.
- Compartir un link rapido.
- Ver resultados utiles sin leer todos los transcripts.
- Exportar datos.
- Controlar costos.

### Respondent

Persona que responde la encuesta conversacional.

Necesita:

- Entender cuanto tiempo le va a tomar.
- Responder sin friccion.
- No sentir que esta atrapada en un chat infinito.
- Poder saltar, decir "no se" o terminar.

## Hipotesis

1. Una experiencia conversacional obtiene respuestas mas profundas que un formulario tradicional en investigaciones cualitativas.
2. El agente mejora la calidad de datos si hace follow-ups solo cuando la respuesta es ambigua o incompleta.
3. La completion rate se mantiene aceptable si la conversacion tiene limite visible de duracion, turnos y progreso.
4. Los clientes aceptan pagar por creditos de AI si el costo se conecta con respuestas utiles y no con tokens crudos.
5. El cliente no quiere escribir prompts; quiere configurar una investigacion.

## Experiencia del cliente

Flujo MVP:

1. Crear survey.
2. Definir objetivo: "que queres aprender".
3. Definir audiencia.
4. Listar campos obligatorios a capturar.
5. Elegir duracion: 3, 5 o 10 minutos.
6. Elegir tono: profesional, casual, directo o calido.
7. Revisar preview de la conversacion.
8. Publicar.
9. Compartir link.
10. Ver respuestas, resumenes, citas e insights.

El cliente no deberia configurar directamente el prompt. La UI debe producir una especificacion estructurada.

## Experiencia del respondent

Principios:

- Una pregunta por turno.
- Duracion estimada visible.
- Progreso discreto.
- Respuestas cortas aceptadas.
- Botones rapidos: "No se", "Saltar", "Terminar".
- Cierre automatico cuando se obtiene informacion suficiente.
- Nada de inputs eternos ni formularios disfrazados de chat.

Pantalla MVP:

- Header con nombre del survey o marca.
- Mensaje inicial corto.
- Chat central.
- Input grande.
- Acciones rapidas.
- Indicador de progreso estimado.
- Cierre con agradecimiento.

## Objeto central: SurveySpec

La unidad principal del producto es una especificacion estructurada de la encuesta.

```json
{
  "goal": "Entender por que usuarios trial no activan la funcion X",
  "audience": "Usuarios SaaS B2B en trial",
  "mustCapture": [
    "rol del usuario",
    "caso de uso esperado",
    "momento donde se trabo",
    "alternativa que usa hoy",
    "probabilidad de volver a probar"
  ],
  "optionalProbes": [
    "presupuesto",
    "stakeholders",
    "urgencia"
  ],
  "maxTurns": 12,
  "estimatedMinutes": 5,
  "tone": "claro, profesional, humano",
  "disallowed": [
    "hacer dos preguntas en un mismo turno",
    "presionar al usuario",
    "inventar opciones"
  ],
  "completionCriteria": [
    "todos los mustCapture tienen respuesta suficiente",
    "o el usuario pide terminar",
    "o se alcanza maxTurns"
  ],
  "outputSchema": {}
}
```

Este objeto debe alimentar:

- Instrucciones dinamicas del agente.
- Validacion de completitud.
- Extraccion estructurada.
- Cost tracking.
- Evals.
- Analytics.

## Comportamiento del agente

El agente debe operar como entrevistador breve, no como asistente general.

Reglas:

- Mantener el objetivo de investigacion.
- Hacer una sola pregunta por turno.
- Evitar preguntas sesgadas.
- Pedir aclaracion cuando una respuesta es vaga.
- Pedir ejemplo cuando ayuda a entender.
- No sobreexplicar.
- No seguir conversando si ya obtuvo lo necesario.
- Respetar saltos y negativas.
- Cerrar con un resumen breve y agradecimiento.

Estado conversacional minimo:

```txt
known_facts
missing_required_fields
field_confidence
turn_count
fatigue_signal
next_best_question
completion_decision
```

Tools esperadas:

- `load_survey_spec(surveyId)`
- `save_turn_event(...)`
- `update_survey_state(...)`
- `save_structured_answer(...)`
- `complete_response(...)`
- `meter_ai_usage(...)`

## Stack tecnologico propuesto

### Runtime de agentes

Fijo recomendado: Eve.

Motivos:

- Framework pensado para agentes durables.
- Instrucciones en Markdown y tools en TypeScript.
- Sesiones, streaming, channels, tools, subagents, schedules y hooks.
- Encaja bien con Vercel y con una app Next.js.
- La guia oficial de Next.js expone `withEve()` desde `eve/next`, monta agente y web app en un mismo proyecto, evita CORS y permite que `useEveAgent` encuentre las rutas same-origin.
- El experimento local existente esta en `/data/experiments/eve/eve-framework-lab`.

Uso recomendado:

- Un runtime Eve parametrizado por `surveyId`, no un deploy por survey.
- Instrucciones base estables + SurveySpec dinamico.
- Tools para persistencia, billing y completitud.
- Evals para probar no-regresion del comportamiento del entrevistador.
- Mantener la integracion aislada detras de una capa propia (`runSurveyInterview`, `extractSurveyResponse`) para que Eve no contamine el dominio del producto si el framework cambia.

Tecnologias a comparar contra Eve:

- Mastra: buen framework TypeScript para agentes/workflows; evaluar madurez de sesiones y deploy.
- LangGraph.js: fuerte para grafos/estado, mas flexible pero mas boilerplate.
- Vercel AI SDK directo: simple para chat, pero habria que construir durability, state machine y tooling.
- Temporal + AI SDK: robusto para workflows, probablemente demasiado pesado para el MVP.

Criterio de decision:

- Control de estado conversacional.
- Facilidad de integrar con Next.js.
- Observabilidad de runs.
- Costo de mantener agentes dinamicos.
- Evals y testability.
- Lock-in aceptable.

### Web app

Recomendado: Next.js + React + TypeScript.

Motivos:

- Encaja naturalmente con Vercel.
- Facil integracion con Eve.
- Buen soporte para dashboard, public links y API routes.
- Ecosistema maduro para auth, billing, analytics y UI.

UI:

- Tailwind CSS.
- shadcn/ui o componentes propios livianos.
- TanStack Table para dashboards.
- React Hook Form + Zod para builder y validaciones.

Integracion Eve/Next:

- Usar `withEve(nextConfig)` en `next.config.ts`.
- Mantener carpeta `agent/` dentro del proyecto Next para el MVP.
- Usar `useEveAgent` en la experiencia del respondent.
- Autenticacion del dashboard por cookies; links publicos de respondents con tokens de survey.
- En produccion Vercel, desplegar web app y runtime Eve como un solo proyecto.

### AI provider

Recomendado: OpenRouter como gateway inicial.

Motivos:

- Permite comparar modelos sin reescribir integraciones.
- Facil fallback entre modelos.
- Util para optimizar costo/calidad por tipo de survey.

Requisitos:

- Usar una API key propia del SaaS al inicio para controlar experiencia.
- Registrar costo estimado por request, survey, workspace y respondent.
- Registrar el `usage` devuelto por OpenRouter, incluyendo tokens y `usage.cost`.
- Separar `provider_usage` interno del ledger comercial de creditos.
- Evaluar crear una API key OpenRouter por workspace usando Management API Keys.
- Evaluar luego BYOK para clientes grandes.

Riesgos:

- Tracking real por usuario requiere correlacion interna, no confiar solo en OpenRouter.
- Una API key por cliente mejora separacion de costos, pero agrega superficie de seguridad, rotacion, limites y manejo de fallos.
- BYOK complica soporte, seguridad y UX.
- Costos por token son dificiles de explicar al cliente final.

Decision recomendada para MVP:

- Ledger propio como fuente de verdad del producto.
- OpenRouter como fuente de usage/cost por llamada.
- Una sola key de OpenRouter al inicio si se busca maxima velocidad.
- Pasar a key por workspace cuando se active cobro real o pilotos pagos.

API keys por cliente:

- OpenRouter soporta Management API Keys para crear, listar, actualizar y borrar API keys programaticamente.
- Las keys pueden tener `limit` en USD, `limit_reset` diario/semanal/mensual y usage por key.
- Es factible usar una key por workspace para aislar gasto y auditar uso.
- No conviene delegar el billing del producto solo a OpenRouter: probe debe guardar cada AI call, costo, survey, response y ledger debitado.

Modelos:

- Modelo rapido/barato para turnos conversacionales.
- Modelo mas fuerte para extraccion y resumen agregado.
- Evaluar usar modelos distintos por fase:
  - Interview loop: bajo costo, baja latencia.
  - Extraction: estructurado y confiable.
  - Insights agregados: mas capacidad, batch.

### Base de datos

Recomendado: Postgres.

Opciones:

- Supabase Postgres para velocidad inicial.
- Neon Postgres si se prioriza serverless/Vercel.

ORM y migraciones:

- Drizzle ORM.
- Drizzle Kit para schema y migraciones.
- Zod para validar inputs del builder y outputs estructurados del agente.
- Guardar `SurveySpec` como JSONB versionado, no como prompt plano.

Tablas iniciales:

- `workspaces`
- `users`
- `surveys`
- `survey_specs`
- `survey_links`
- `respondents`
- `responses`
- `conversation_turns`
- `survey_state_snapshots`
- `structured_answers`
- `ai_usage_events`
- `credit_ledger`
- `exports`

### Auth

Recomendado para MVP:

- Clerk si se prioriza velocidad y equipos.
- Auth.js si se quiere mas control y menor dependencia.

Decisiones:

- Login para clientes SaaS.
- Links publicos sin login para respondents.
- Token unico por survey link.
- Opcional: links de un solo uso para paneles cerrados.

### Billing y pagos

Recomendado: Stripe.

Modelos:

- Suscripcion mensual por workspace.
- Paquetes de creditos.
- Auto top-up opcional.
- Plan Enterprise con contrato.

Para MVP:

- Sin Stripe al inicio si la validacion es privada.
- Ledger interno en USD-credit desde el dia uno.
- Carga manual de saldo para pilotos.
- Bloqueo o pausa de nuevas respuestas cuando el saldo llega a cero.

### Observabilidad

Recomendado:

- OpenTelemetry para traces.
- Sentry para errores.
- PostHog para producto.
- Braintrust o LangSmith para evals/traces de AI si aporta velocidad.
- Logs internos por `response_id` y `survey_id`.

### Hosting

Recomendado:

- Vercel para web app y Eve si el soporte es estable.
- Postgres gestionado separado.
- Storage S3-compatible para exports.

## Costos y pricing

El cliente no deberia pagar "token por token" como unidad principal porque es dificil de entender y puede generar ansiedad. Pero internamente si hay que trackear tokens/costos con precision.

Propuesta: sistema de creditos denominados en USD.

### Unidad comercial

Credito de AI:

- 1 credito equivale a USD 1 de saldo comercial dentro de probe.
- Cada llamada de AI debita el costo reportado por el proveedor mas un markup configurable o fee de plataforma.
- Se descuenta tanto por respuestas de respondents como por tareas del cliente dentro del dashboard, por ejemplo generar survey, simular preview o crear resumenes.
- El cliente ve saldo en USD-credit, no tokens.

Ejemplo conceptual:

- Saldo inicial: USD 10 en creditos.
- Turno conversacional: debita `usage.cost * markup`.
- Extraccion final: debita `usage.cost * markup`.
- Resumen agregado: debita `usage.cost * markup`.
- Modelos premium cuestan mas porque el proveedor reporta mayor costo; no hace falta explicar tokens.

No mostrar esta tabla demasiado tecnica en el MVP. Mostrar:

- Creditos restantes.
- Creditos usados por survey.
- Costo promedio en USD-credit por respuesta completada.
- Alertas de gasto.
- Limite mensual configurable.

### Por que creditos y no tokens visibles

Ventajas:

- Mas facil de vender.
- Permite absorber variaciones de provider.
- Permite cambiar modelos sin romper pricing publico.
- Permite cobrar tambien acciones no conversacionales.
- Evita que el cliente optimice prompts pensando en tokens.
- Mantiene relacion transparente con dinero real sin exponer complejidad de token pricing.

Riesgos:

- Si el credito esta mal calibrado, se pierde margen.
- Puede percibirse opaco si no hay desglose suficiente.
- Hay que evitar que conversaciones largas destruyan margen.

Mitigaciones:

- Limite de turns por survey.
- Limite de minutos estimado.
- Max tokens por respuesta del agente.
- Presupuesto maximo por survey.
- Corte automatico al alcanzar presupuesto.
- Alertas antes de consumir creditos altos.
- Reconciliacion periodica entre ledger interno y usage de OpenRouter por key/modelo.

### Planes iniciales

Free:

- 20 respuestas completadas o creditos equivalentes.
- Branding de probe.
- Export basico.

Starter:

- Creditos mensuales incluidos.
- Surveys activos limitados.
- Export CSV.
- Branding basico.

Pro:

- Mas creditos.
- Templates.
- Insights agregados.
- Webhooks.
- Equipos.
- Custom branding.

Enterprise:

- SSO.
- DPA.
- Data retention configurable.
- BYOK opcional.
- SLA.
- Model routing custom.

### Metricas financieras internas

- Costo AI por respuesta iniciada.
- Costo AI por respuesta completada.
- Costo AI por insight util.
- USD-credit debitado por respuesta.
- Diferencia entre costo proveedor y debito comercial.
- Margen por workspace.
- Creditos emitidos vs creditos consumidos.
- Conversaciones abortadas despues de alto gasto.
- Ratio de tareas dashboard vs tareas respondent.

## Analytics del producto

Dashboard MVP:

- Respuestas iniciadas.
- Respuestas completadas.
- Completion rate.
- Tiempo promedio.
- Turns promedio.
- Costo promedio por respuesta.
- Campos capturados por respuesta.
- Resumen individual.
- Citas destacadas.
- Export CSV/JSON.

Dashboard posterior:

- Temas recurrentes.
- Segmentacion.
- Sentiment.
- Comparacion entre cohorts.
- Alertas de insight.
- Preguntas donde respondents abandonan.
- Calidad por survey spec.

## Validacion

Experimento inicial:

1. Crear un formulario tradicional y un survey conversacional con el mismo objetivo.
2. Enviar a audiencias equivalentes.
3. Medir completion rate, tiempo, profundidad y costo.
4. Evaluar respuestas con blind review.
5. Comparar cantidad de insights accionables por 100 respondents.

Metrica principal:

```txt
insights accionables por 100 respondents
```

Metricas secundarias:

- Completion rate.
- Costo por insight util.
- Tiempo promedio.
- Satisfaccion del respondent.
- Porcentaje de campos obligatorios capturados.
- Porcentaje de respuestas que requieren revision manual.

## MVP

### Stack MVP

- Next.js + React + TypeScript.
- Eve integrado con Next mediante `withEve()`.
- `agent/` dentro del proyecto Next.
- OpenRouter como provider de modelos.
- Postgres gestionado.
- Drizzle ORM + Drizzle Kit.
- Clerk para auth del dashboard.
- Links publicos tokenizados para respondents.
- Tailwind CSS + componentes livianos.
- Vercel para deploy.
- Ledger interno en USD-credit.

Incluye:

- Auth cliente.
- Workspace simple.
- Builder de survey.
- Generacion de SurveySpec.
- Link publico.
- Chat respondent.
- Runtime Eve con SurveySpec dinamico.
- Persistencia de conversacion.
- Extraccion estructurada final.
- Dashboard simple.
- Export CSV/JSON.
- Ledger interno de creditos.
- Cost tracking por AI call.
- Debito de USD-credit basado en `usage.cost` del proveedor.
- Admin manual para cargar saldo en pilotos.

No incluye:

- WhatsApp/Slack.
- Branching visual avanzado.
- BYOK publico.
- Stripe billing.
- Key OpenRouter por workspace obligatoria.
- SSO.
- Multi-idioma avanzado.
- Panel management.
- Analisis estadistico complejo.

## Riesgos tecnicos

- El agente puede alargar demasiado la conversacion.
- La extraccion puede ser inconsistente entre respondents.
- Las respuestas libres pueden ser dificiles de comparar.
- OpenRouter aporta usage por llamada y por key, pero el ledger interno debe seguir siendo la fuente contable del producto.
- Los clientes pueden configurar objetivos demasiado vagos.
- Eve puede estar en etapa temprana y cambiar APIs.
- La latencia puede afectar completion rate.
- El costo por respuesta puede subir si el agente repregunta demasiado.

## Mitigaciones

- SurveySpec estricto.
- Evals por tipo de encuesta.
- Limite de turns.
- Presupuesto por survey.
- Estado explicito de campos capturados.
- Separar entrevista, extraccion y analytics en pasos distintos.
- Guardar usage events propios en cada AI call.
- Model routing por tarea.
- Preview obligatorio antes de publicar.

## Preguntas abiertas

- Cual es el primer vertical: SaaS research, churn, employee feedback o lead qualification?
- Que nivel de personalizacion necesita el cliente para confiar en el agente?
- Conviene vender por respuestas completadas, creditos o ambos?
- El respondent debe saber explicitamente que habla con AI?
- Cuanto abandono genera una experiencia conversacional vs formulario?
- Que output compra realmente el cliente: transcripts, data estructurada o insights?
- BYOK deberia estar en Pro o solo Enterprise?

## Relacionado

- Eve: https://vercel.com/eve
- Eve docs: https://eve.dev/docs/introduction
- Experimento local Eve: `/data/experiments/eve/eve-framework-lab`
- Nota en vault: `03 Resources/Investigación/probe - surveys conversacionales con agentes AI.md`
