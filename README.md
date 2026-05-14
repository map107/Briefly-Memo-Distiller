# Briefly

**Legal advice. Translated.**

Briefly is a concept prototype of a legal communication platform that turns dense legal memos into clear, action-oriented summaries for business teams. Upload a memo, set the context, and get a plain-English brief in seconds.

> **⚠️ Prototype only.** This is a proof-of-concept and must not be used with real, confidential, or privileged legal documents. See [TERMS.md](./TERMS.md) for full details.

---

## What it does

- Upload a legal memo (PDF, DOCX, or paste text)
- Set who the recipient is and what they need to decide
- Choose an output format:
  - **Short email** — bottom line up front, under 250 words
  - **One-pager** — structured sections, decision-ready
  - **Slack bullets** — 30-second read, built for async
  - **World map** — jurisdictions visualised on an interactive map
  - **Flowchart** — decisions and processes rendered as a flow diagram
- AI generates a plain-English, action-oriented summary
- All summaries are saved and revisitable per memo

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS + shadcn/ui |
| Routing | Wouter |
| API | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| AI | OpenAI `gpt-5.4` via Replit AI Integrations |
| File parsing | pdf-parse (PDF), mammoth (DOCX) |
| Visualisation | react-simple-maps (world map), custom SVG (flowchart) |
| Monorepo | pnpm workspaces |
| API contract | OpenAPI 3.1 + Orval codegen |

---

## Project structure

```
briefly/
├── artifacts/
│   ├── api-server/        # Express API server
│   └── memo-simplifier/   # React frontend
├── lib/
│   ├── api-spec/          # OpenAPI spec + codegen config
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas
│   └── db/                # Drizzle schema + migrations
└── scripts/               # Shared utility scripts
```

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- OpenAI API key (or Replit AI Integrations)

### Environment variables

```bash
DATABASE_URL=postgresql://...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://...
AI_INTEGRATIONS_OPENAI_API_KEY=...
```

### Install

```bash
pnpm install
```

### Database setup

```bash
pnpm --filter @workspace/db run push
```

### Run

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (port 3000 or configured PORT)
pnpm --filter @workspace/memo-simplifier run dev
```

### Codegen (after editing the OpenAPI spec)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Key design decisions

- **File upload outside OpenAPI spec** — the `POST /api/memos/upload` endpoint uses multer directly to avoid browser `File`/`Blob` types leaking into the server typecheck.
- **JSON storage for visualisations** — world map and flowchart summaries store structured JSON in the same `content` column as text summaries. The format field determines how the frontend renders it.
- **Summary count computed at query time** — `summaryCount` is aggregated via a SQL join rather than stored, keeping the schema simple.
- **Contract-first API** — all endpoints (except file upload) are defined in `lib/api-spec/openapi.yaml` first, then types, hooks, and schemas are generated from it.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Disclaimer

This is a concept prototype. It must not be used with real, confidential, privileged, or sensitive legal documents. See [TERMS.md](./TERMS.md).
