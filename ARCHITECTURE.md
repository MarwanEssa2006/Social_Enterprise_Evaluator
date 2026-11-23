# Technical Architecture (Phase 8 — as built)

Social Enterprise Evaluation Platform · implementation in `platform/` · decisions in `TECHNICAL_DECISIONS.md` · 2026-11-20

This document also consolidates the Phase 4 AI design (AI analysis, Recommendation Library, Gemini integration, AI testing). The owners' later instruction to implement replaced the separate Phase 4 design documents; the design is recorded here and in code.

## 1. System Overview

```
 Browser (Arabic RTL default / English)
     │  HTTPS, HttpOnly session cookie
     ▼
 Next.js 16 server (one Node process)
   ├─ Pages (server components)          src/app/**/page.tsx
   ├─ Server actions (all mutations)     src/app/actions/*.ts   ← Zod validation, auth, ownership checks
   ├─ Route handlers (downloads)         report.pdf, export.xlsx, evidence files
   ├─ Proxy                              src/proxy.ts (passes current path only; no auth logic)
   └─ Domain modules (pure, testable)
        ├─ questions/   approved bank + codes (generated, verified against EVALUATION_FRAMEWORK.md)
        ├─ scoring/     Scoring Engine M1.0 (deterministic, no I/O)  ← sole authority for scores
        ├─ recommendations/  Library + deterministic selection & priority
        ├─ ai/          fact sheet → provider (Gemini | Mock) → validator → fallback
        ├─ exports/     PDF (Chromium) · Excel (original template)
        └─ server/      SQLite repository, auth, files, submission service
     │
     ▼
 SQLite file (node:sqlite)      Upload folder (outside public/)      Gemini API (only if configured)
```

No microservices: one deployable fits pilot scale. The repository layer isolates SQL so PostgreSQL can replace SQLite later (TD-02, TD-26).

## 2. Assessment Data Flow

```
 Draft answers + evidence + project context
   │ submit (server action) — rejected unless all 33 answered (D-24)
   ▼
 1 Input Processing        buildInput(): snapshot of answers, evidence metadata, context
 2 Scoring Engine          runAssessment(): readings → 1–5 / Not Scored / N/A → overall, levels, classification,
                           confidence, completeness, coverage            (deterministic, AI-free)
 3 Gap Identification      flags + Not Scored/Conflicting dimensions + low confidence
 4 Recommendation Library  selectRecommendations(): entries whose triggers match; deterministic priority
 5 Personalisation (AI)    per criterion: fact sheet with IDs → provider → JSON
 6 Output Validation       schema, cited IDs exist, no new numbers, no score talk, no "verified" claims without
                           EV-1/EV-2 evidence, only selected recommendations, project-specific citations;
                           1 corrective retry → deterministic template fallback
 7 Final Results           insertAssessment(): one transaction, insert-only row + recommendation rows
```

Scores are computed in step 2 and stored before AI text is attached; the AI pipeline receives a copy and is tested to leave results byte-identical.

## 3. Database Schema (`platform/src/lib/server/db.ts`)

| Table | Purpose | Key rules |
|---|---|---|
| `users` | email, name, scrypt hash, locale | unique email |
| `sessions` | SHA-256 of session token, user, expiry | raw token never stored |
| `projects` | owner, name, description, country, area, beneficiary model, grants flag, archived | every query filtered by owner |
| `draft_answers` | working draft (project, question, option index) | editable |
| `evidence_items` | criterion, dimension, kind, title, description, number, file metadata | removing affects only the draft |
| `assessments` | version, methodology, input snapshot, results, analysis, AI meta, locale | **UPDATE/DELETE blocked by triggers** (D-12, D-32) |
| `recommendations` | assessment, key, criterion, dimension, priority, content JSON, status | **content columns immutable (trigger)**; only status changes (D-14) |
| `recommendation_evidence` | implementation notes and files | — |
| `ai_runs` | provider, model, prompt version, status, attempts, tokens, latency, error | cost/token monitoring; no prompt content |
| `schema_migrations` | applied migration versions | append-only migrations |

## 4. Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | page | Landing |
| `/register`, `/login` | page + action | Account creation, sign-in (throttled: 5 failures / 15 min / email) |
| `/dashboard` | page | Projects, latest classification and scores |
| `/projects/new`, `/projects/[id]/edit` | page + action | Project information (country, area, beneficiary model, grants flag); archive |
| `/projects/[id]` | page | Steps, progress bar, latest assessment, history |
| `/projects/[id]/questions?c=C1..C8` | page + actions | Approved questions (Arabic, exact), save/next, evidence add/remove/download |
| `/projects/[id]/submit` | page + action | Completeness check; run assessment; pending state |
| `/projects/[id]/assessments/[v]` | page | Results dashboard |
| `/projects/[id]/assessments/[v]/criteria/[c]` | page | Criterion analysis, answers, flags, recommendations |
| `/projects/[id]/assessments/[v]/report.pdf` | GET | PDF report |
| `/projects/[id]/assessments/[v]/export.xlsx` | GET | Alan's template, populated |
| `/projects/[id]/recommendations` | page + actions | Status (Not Started / In Progress / Completed), implementation records |
| `/projects/[id]/progress?from=&to=` | page | Initial vs latest, chart, criterion changes with cause, previous recommendations |
| `/projects/[id]/files/...` | GET | Authorised file downloads (`attachment`, `nosniff`) |
| `/settings` | page + actions | Name, language, password change (ends other sessions) |

## 5. Authentication and Authorisation
- scrypt (N=16384, r=8, p=1) password hashes; 30-day sessions in DB, token hashed; cookie `HttpOnly`, `SameSite=Lax`, `Secure` in production.
- Every page/action calls `requireUser()` / `requireProject()`; route handlers use `projectForRoute()`. Another user's project returns **404** (no existence leak) — E2E tested.
- Server actions carry Next.js origin checks; all inputs validated with Zod; question/option indices checked against the approved bank.

## 6. AI Integration (Phase 4 design, implemented)

| Aspect | Design |
|---|---|
| Provider abstraction | `AiProvider.generateStructured()`; `GeminiProvider` (`@google/genai`) and `MockProvider`. Add a provider by implementing one method. |
| Mode selection | `AI_MODE=mock` or no `GEMINI_API_KEY` → mock (default). Key present → Gemini. Shown on the submit page. |
| Request | System instruction (prompt **AI-P1.0**, 11 rules) + fact sheet JSON; `responseMimeType: application/json`, `responseJsonSchema` from Zod; temperature 0.2; max 4,096 output tokens; 30 s timeout. |
| Calls | One per criterion (8), concurrency 2 → each criterion analysed independently; failures are isolated per criterion. |
| Retries | Only 408/429/5xx/network; max 3 attempts; exponential backoff + jitter; SDK retries disabled so policy is testable. 400/401/403 not retried. |
| Malformed output | Zod schema; on failure one corrective retry with the validator's errors; then deterministic fallback text (status recorded). |
| Anti-hallucination | Fact-sheet IDs required on every claim; numbers not present in the fact sheet rejected (Arabic digits normalised); score-like text rejected; "verified/proven" wording requires EV-1/EV-2 evidence; recommendations limited to library-selected keys and must cite a project fact. |
| Data minimisation | Sent: answer text, codes, context (country, area, model), evidence titles/descriptions/classes, scoring readings. Not sent: names, emails, project name, uploaded files. |
| Cost control | Per-call token caps; token usage logged in `ai_runs` and in assessment AI meta; mock mode costs nothing. |
| Data terms | Live use only with a paid, billing-linked project and owner-approved data handling (TD-16, D-39). |

**Recommendation Library** (`src/lib/recommendations/library.ts`): 60+ bilingual entries keyed `C{n}-{COM|SOC}-{NAME}` with triggers on readings, answer options, flags, and confidence, plus parameterised information-gap and conflict templates. Each entry has: title, weakness, why it matters, action, practical steps, expected evidence, related questions/flags. Priority is deterministic (gatekeeper weak/unscored → high; weak/unscored → medium; else low). AI never adds, removes, or re-prioritises entries.

## 7. Exports
- **PDF:** HTML report (`exports/report-html.ts`) rendered by headless Chromium with JavaScript disabled and network blocked; A4; correct Arabic shaping. Contents: project overview, overall classification and qualifiers, commercial and social overall results, Evidence Confidence, Information Completeness, Social Coverage, criterion table, next actions, per-criterion assessment, answers, recommendations.
- **Excel:** the original `Alan's List of Success.xlsx` (copied to `platform/assets/`); only the 8 response cells (C5, F5, I5, L5, C14, F14, I14, L14) are written as inline strings; all other package parts are byte-identical (tested). Template cells have no text wrapping, so each response is one line separated by " | " — the template's formatting is deliberately not changed.

## 8. Error Handling
- Server action failures return user-facing messages (validation, missing answers, file rejected, generic error) — never stack traces.
- AI failures never block an assessment: scores are deterministic and the analysis falls back to template text with a visible status.
- Database writes for a submission run in one transaction.

## 9. Security Controls
Security headers (nosniff, frame DENY, referrer policy, permissions policy); no secrets in client code; `.env*` and `data/` git-ignored; uploads allow-listed by extension **and** magic number, 5 MB limit, random names, stored outside `public/`, served only after ownership check; stored file names validated against path traversal; PDF renderer has no network and no JavaScript; login throttling; password change revokes sessions.

## 10. Deployment Architecture (target, not deployed)
Single Node 22+ server running `next start` behind an HTTPS reverse proxy; SQLite on persistent disk with daily backups; Chromium installed on the host for PDF; environment variables from `.env.example`. Before multi-instance scaling: move to PostgreSQL and object storage for uploads. Production deployment requires owner authorisation (cost, hosting, OPEN-19 regulations).
