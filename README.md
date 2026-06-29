# probe MVP

Runnable MVP for `PRD.md`: client login, survey builder, structured `SurveySpec`, public respondent links, conversational chat, persistence, structured extraction, dashboard metrics, CSV/JSON export, credit ledger, cost tracking, and an Eve runtime mount.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, continue through the demo login, create a survey, publish it, and open the public `/r/[token]` link.

Local data is stored in `.probe-data/db.json`. Delete that file to reset the demo workspace.

Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to switch the dashboard auth gate from demo cookie auth to Clerk. Respondent links stay public.

## Deploy

`vercel.json` is configured for the Next.js app. For a real deployment, set at least:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
OPENROUTER_API_KEY
DATABASE_URL
```

After deployment, authenticated clients can check `/api/system/status` to confirm whether Clerk, OpenRouter, and the selected store are configured.

## AI and agent runtime

- `agent/` is mounted by `withEve()` in `next.config.ts`.
- The app uses a deterministic interview adapter by default so the MVP runs without credentials.
- Set `OPENROUTER_API_KEY` to let OpenRouter polish interview turns and return provider usage for metering.

## Database

The production Postgres shape is defined in `db/schema.ts` for Drizzle and the SQL migration is in `drizzle/`. Use:

```bash
npm run db:generate
npm run db:migrate
```

`db/client.ts` exposes the Drizzle client for a managed Postgres `DATABASE_URL`. The default MVP runtime still uses the local JSON store so the full product loop can be tested without provisioning infrastructure.

To run the app against Postgres instead of the local JSON store:

```bash
PROBE_STORE=postgres
DATABASE_URL=postgres://...
```
