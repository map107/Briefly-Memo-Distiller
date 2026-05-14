# BriefCast

A legal memo simplifier that helps law firms transform dense legal advice into clear, action-oriented summaries for business clients.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/memo-simplifier run dev` — run the frontend (port 25603)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit OpenAI integration

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui (wouter routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: OpenAI `gpt-5.4` via Replit AI Integrations proxy
- File parsing: `pdf-parse` (PDF), `mammoth` (DOCX)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/memos.ts` — Drizzle schema for memos and summaries tables
- `artifacts/api-server/src/routes/memos.ts` — All memo/summary API routes + AI summarisation
- `artifacts/memo-simplifier/src/pages/` — Frontend pages (home, memo-detail, history)
- `artifacts/memo-simplifier/src/components/layout.tsx` — App shell with sidebar

## Architecture decisions

- File upload (`/api/memos/upload`) is handled outside the OpenAPI spec to avoid browser `File`/`Blob` types leaking into the server typecheck. The route uses multer directly.
- AI summarisation uses `gpt-5.4` with a carefully crafted prompt that enforces: no legalese, action orientation, audience-aware framing, and format-specific structure (email / one-pager / Slack bullets).
- Summary content is stored in the DB so users can revisit and copy past outputs without re-generating.
- The `summaryCount` field is computed at query time via a join, not stored.

## Product

- Upload a legal memo (PDF, DOCX, or paste text)
- Configure: who the recipient is, what they need from the advice
- Choose output format: short email, one-pager, or Slack bullets
- AI generates a plain-English, action-oriented TLDR summary
- View and copy all previous summaries per memo
- History view shows all memos with summary counts and stats

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after every OpenAPI spec change before using updated types
- File upload endpoint (`POST /api/memos/upload`) is NOT in the OpenAPI spec — it's a raw multer route to avoid browser type issues
- The `ExtractedText` schema is in the OpenAPI spec for documentation but the endpoint is handled manually

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
