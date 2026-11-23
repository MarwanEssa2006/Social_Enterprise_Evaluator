# Implementation Progress

Last updated: 2026-11-20 · Code: `platform/` · Architecture: `ARCHITECTURE.md` · Decisions: `TECHNICAL_DECISIONS.md`

## 1. Status by Milestone

| Milestone | Status | Evidence |
|---|---|---|
| M1 Scaffold | **Done** | Next.js 16.4.6, React 19.3, Tailwind 4.3, TypeScript (ES2022). Build clean (0 warnings). |
| M2 Question bank | **Done** | `src/lib/questions/bank.ts` generated; test asserts byte equality with `EVALUATION_FRAMEWORK.md`. |
| M3 Scoring Engine M1.0 | **Done** | `src/lib/scoring/`; spec TC1–TC12 + rule tests pass. |
| M4 Auth + authorisation | **Done** | scrypt, hashed DB sessions, throttling; cross-user access returns 404 (E2E). |
| M5 Projects / answers / evidence | **Done** | Create/edit/archive, draft save & resume, evidence with secure uploads; submission requires all 33 answers. |
| M6 Versions / reassessment / comparison | **Done** | Insert-only versions (DB triggers), reassessment, comparison with cause (project vs methodology). |
| M7 AI layer (Phase 4) | **Done** | Library, selection/priority, fact sheet, prompt AI-P1.0, Gemini + mock providers, validator, retries, fallback, token log. |
| M8 Recommendation tracking | **Done** | Not Started / In Progress / Completed, implementation records with files; status never changes scores (test). |
| M9 UI (Phase 7) | **Done** | 15 journey screens, Arabic RTL default + English, responsive (375 / 768 / desktop checked), accessible basics (labels, skip link, focus ring, ARIA progress). |
| M10 PDF / Excel (Phase 6) | **Done** | Chromium PDF (AR/EN); Excel = original template with only 8 response cells filled (test). |
| M11 Tests / build / E2E | **Done** | See §2. |
| M12 Documentation (Phase 8) | **Done** | `ARCHITECTURE.md`, `TECHNICAL_DECISIONS.md`, `platform/README.md`, this file. |

## 2. Latest Verification Run

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | Pass |
| ESLint | Pass (0 problems) |
| Unit + integration (Vitest) | **70 / 70 pass** — scoring spec (17), readings & rules (24), question bank (3), comparison (3), AI (15), DB/service integration (5), exports (3) |
| Production build | Pass, 0 warnings |
| End-to-end (Playwright, production build, isolated DB) | **3 / 3 pass** — full journey (register → answer 33 → assess → details → mark Completed without score change → PDF/XLSX → reassess → compare with cause → v1 unchanged → no overflow at 375 px), cross-user 404s, language switch + service-user N/A + responsive |
| Browser check (built-in browser, dev server) | Landing, login, dashboard, results (desktop and 375 px) verified; two layout bugs found and fixed (CSS layer override; RTL overflow from sr-only text in a scrolled table) |
| Arabic PDF visual check | Correct shaping and RTL (Chromium render) |

## 3. Running

```powershell
cd platform
npm run dev
```
Dev server URL: http://localhost:3000 (started from the Claude desktop app preview; restart with the command above). Demo data: `npm run seed` (login defined in `scripts/seed.ts`).

## 4. Not Done / Blockers (need owner action)

| Item | Why it is not done | What is needed |
|---|---|---|
| Live Gemini calls | No API key provided; data terms not approved (D-39, OPEN-19, OPEN-20). Integration is complete and tested with scripted responses; mock mode is active. | Paid Google Cloud project + `GEMINI_API_KEY` + owner approval of data handling. |
| Production deployment | Needs hosting choice, cost authorisation, domain/HTTPS, and OPEN-19 (regulations, residency). | Owner authorisation. |
| Password reset by email, email verification | Needs an email provider (external service, possible cost). | Owner decision. |
| Account / project deletion | OPEN-10 (retention and deletion) is still open; assessments are immutable by design. Projects can be archived. | Owner decision on retention rules. |
| Evidence guidance wording | OPEN-38 — structured evidence types implemented (TD-32); free-text guidance wording awaits review. | Owner review. |
| Language default | Arabic default chosen under D-40 (TD-07); OPEN-05 remains an owner decision. | Owner confirmation. |

## 5. Notes for the Next Developer
- Scoring rules live only in `src/lib/scoring/`; change them only through a new methodology version (register a new `Methodology`; old versions stay reproducible).
- Never edit `src/lib/questions/bank.ts` by hand; the bank test will fail.
- `assessments` rows cannot be updated or deleted (triggers). Add new data in new tables or new versions.
- E2E tests run against `npm run build` output on port 3100 with `data/e2e/` (recreated on each run).
