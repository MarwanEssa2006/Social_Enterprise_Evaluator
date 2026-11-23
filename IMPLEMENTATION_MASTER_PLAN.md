# Implementation Master Plan

Source of truth: `PRODUCT_DEFINITION.md` v0.4, `EVALUATION_FRAMEWORK.md` v1.3 (approved), `SCORING_SPECIFICATION.md` v1.0 (approved, M1.0), `PROJECT_DECISIONS.md` (D-01 to D-40), `TECHNICAL_DECISIONS.md`.

## 1. Audit Summary (2026-11-20)

| Item | State |
|---|---|
| Code | None. Repository contains documentation only. |
| Phases 1–3 | Documented; Phase 2 approved (D-33), Phase 3 approved (D-37). Phase 1 document never formally approved, but superseded in practice by later approvals. |
| Excel template | `../Alan's List of Success.xlsx` — one sheet, 8 criterion blocks, 8 notes, no formulas. Unchanged. |
| Inconsistencies found | (1) Recommendation statuses: `PRODUCT_DEFINITION.md` §7.3 proposed 6 states; owner Phase 4 brief specifies Not Started / In Progress / Completed → TD-18. (2) OPEN-27 (Excel mapping) still open → decided under D-40 as TD-22. (3) OPEN-05 language → Arabic default with English (TD-07). (4) Gemini free-tier data terms conflict with any real-data use → mock default, paid project required (TD-16). (5) Phase 4 documentation request was superseded by the implementation instruction; Phase 4 design is recorded in `TECHNICAL_DECISIONS.md` and code. |
| Missing | Gemini API key (not provided) → mock mode; production hosting decision (OPEN-19 regulations) → documented only. |

## 2. Milestones, Dependencies, Acceptance Criteria

| # | Milestone | Depends on | Acceptance criteria |
|---|---|---|---|
| M1 | Scaffold: Next.js app, Tailwind, SQLite migrations, env handling, `.gitignore` | — | `npm run build` passes; `.env` ignored; `.env.example` has placeholders only. |
| M2 | Question bank data with IDs | M1 | Bank text identical to approved bank (automated test). 32 questions + C1-EF. |
| M3 | Scoring Engine M1.0 | M2 | Implements framework readings for all 8 criteria; spec §2–7; tests TC1–TC12 pass with expected results; deterministic. |
| M4 | Auth + authorisation | M1 | Register/login/logout; hashed passwords and sessions; other users' projects return 404 (test). |
| M5 | Projects, draft answers, evidence, submission (D-24 all answered) | M2, M4 | Draft save/resume; submission blocked until all 33 answered; evidence upload with limits. |
| M6 | Assessment versions (immutable), reassessment, comparison with cause attribution | M3, M5 | New version per submission; old versions unchanged (test); comparison lists criterion changes with cause. |
| M7 | AI layer: library, selection, priority, fact sheet, Gemini + mock providers, validator, fallback | M3 | Every criterion analysed; validator rejects invented numbers, unknown IDs, score talk, unselected recommendations; API failure → fallback; tests. |
| M8 | Recommendation tracking + implementation evidence | M6, M7 | Status changes saved; never alter scores (test). |
| M9 | UI journey (15 screens), Arabic/English, responsive, accessible basics | M4–M8 | All screens reachable and functional; RTL correct; mobile layout checked. |
| M10 | PDF report + Excel export | M6, M7 | PDF opens with all required sections; Excel = template with only 8 response cells filled (test). |
| M11 | Seed data, tests, production build, E2E, browser verification | all | All unit/integration/E2E tests pass; build passes; app running and verified in browser. |
| M12 | Documentation: architecture, setup guide, progress | all | `ARCHITECTURE.md`, `platform/README.md`, `IMPLEMENTATION_PROGRESS.md` current. |

## 3. Out of Scope for This Build (documented, not silently skipped)
- Production deployment and hosting account setup (needs owner authorisation and OPEN-19).
- Live Gemini calls with real data (needs API key + paid project + D-39 approval).
- Email verification / password reset by email (needs an email provider).
