# Social Enterprise Evaluation Platform

Evaluates social enterprises against the eight criteria of Alan's List of Success, with separate commercial and social results, evidence confidence, recommendations, versioned reassessment, and PDF / Excel exports.

Architecture: `../ARCHITECTURE.md` · Decisions: `../TECHNICAL_DECISIONS.md`, `../PROJECT_DECISIONS.md` · Status: `../IMPLEMENTATION_PROGRESS.md`

## Requirements
- Node.js 22.13+ (developed on Node 26; uses the built-in `node:sqlite`)
- Chromium for PDF export and E2E tests: `npx playwright install chromium`

## Setup
```powershell
cd platform
npm install
npx playwright install chromium
copy .env.example .env.local
npm run seed
npm run dev
```
Open http://localhost:3000. `npm run seed` creates dummy demo projects; the demo login is defined in `scripts/seed.ts` (test data only).

## Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Development server (port 3000) |
| `npm run build` / `npm start` | Production build / server (set `INSECURE_COOKIES=1` only when testing production over plain HTTP locally) |
| `npm test` | Unit and integration tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; builds must exist — run `npm run build` first; uses an isolated database on port 3100) |
| `npm run seed` | Dummy data |
| `npm run gen:bank` | Regenerate question bank data from the approved bank text |

## Environment variables
See `.env.example`. Nothing is required for mock mode.

| Variable | Default | Notes |
|---|---|---|
| `AI_MODE` | `mock` when no key | `mock` or `gemini` |
| `GEMINI_API_KEY` | — | Server-side only. Never commit. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Confirm current model IDs at https://ai.google.dev/gemini-api/docs/models |
| `DATABASE_PATH` | `data/app.db` | SQLite file |
| `UPLOAD_DIR` | `data/uploads` | Evidence files |
| `EXCEL_TEMPLATE_PATH` | `assets/alan-template.xlsx` | Copy of the original template |

## Enabling Gemini (when authorised)
1. Owners approve data handling (OPEN-19, OPEN-20). Until then use dummy data only (D-39).
2. Use a Google Cloud project **with billing enabled** — content sent to unpaid quota may be used by Google to improve products and reviewed by humans (Gemini API Additional Terms).
3. Create an API key in Google AI Studio, put it in `.env.local` as `GEMINI_API_KEY`, set `AI_MODE=gemini`, restart.
4. The submit page shows the active AI mode. Token usage is logged in the `ai_runs` table.

## Vercel
- **Root Directory:** `platform`. Framework preset: Next.js. Node.js 22 or newer (needed for `node:sqlite`).
- **Demo mode** turns on automatically on Vercel (`VERCEL` env var). Each server instance creates a temporary database in the OS temp folder and seeds the same demo account and projects (fixed IDs); sessions are signed cookies, so sign-in works on every instance. The login page shows the demo credentials.
- **Environment variables:** none required. Recommended: `SESSION_SECRET` = a long random string (signs session cookies).
- **Limits of demo mode:** new accounts, projects, and changes live only in one temporary instance and can disappear; use the demo account for a stable try-out. For real use, move to a hosted database (e.g., PostgreSQL) — see `../ARCHITECTURE.md` §10.
- **PDF:** Vercel functions have no Chromium, so the PDF link opens the same report as a printable page (save as PDF with Ctrl+P). Excel export works.
- For a persistent deployment, use a host with a disk (any Node server/VPS) or adapt storage and PDF rendering for serverless.

## Guarantees enforced in code and tests
- Approved questions are identical to `EVALUATION_FRAMEWORK.md` (test).
- Scores come only from the deterministic Scoring Engine; AI output cannot change them (test).
- Assessment versions cannot be updated or deleted (database triggers, test).
- Completing a recommendation never changes a score (test).
- Other users' projects return 404 (E2E test).
