# Phase 2 Approval Checklist & Phase 3 Handoff — Scoring Engine Design

Date: 2026-11-20 · Status: **Phase 3 APPROVED (D-37) — `SCORING_SPECIFICATION.md` v1.0 is methodology M1.0. Implementation (Phases 4–10) authorised (D-40).**

## 1. Final Phase 2 Approval Checklist

| # | Item to confirm | Where | Status |
|---|---|---|---|
| 1 | All eight criteria covered with interpretation, answer interpretation, assessment logic, evidence evaluation, missing/conflicting handling, outcomes, recommendations | `EVALUATION_FRAMEWORK.md` §6–13 | Ready for approval |
| 2 | 32 core questions + Large Market evidence follow-up reproduced exactly (machine-checked against the approved bank) | §6.1–13.1 | Verified |
| 3 | Answer codes and dimension readings are qualitative; no scores, weights, thresholds, or formulas | §4.1–4.2 | Ready for approval |
| 4 | Evidence confidence kept separate from performance; evidence classes EV-1…EV-6 | §4.3 | Ready for approval |
| 5 | Unknown / not yet determined / stated absence / unanswered / conflicting handling; unknown never zero | §4.4 | Ready for approval |
| 6 | Seven qualitative criterion outcomes; no compensation between commercial and social | §4.5 | Ready for approval |
| 7 | Recommendation structure and criterion trigger tables | §4.6, §6.8–13.8 | Ready for approval |
| 8 | Target geography as basic project information (D-17) | §4.0.1 | Decided |
| 9 | Beneficiary model, four options, Not Applicable mapping and safeguards (D-18, D-21) | §4.0.2 | Decided |
| 10 | All 32 questions always presented; every question must be answered before submission (D-24) | §4.0.2 rule 5 | Decided |
| 11 | Criterion boundaries and double-counting rules | §14 | Ready for approval |
| 12 | Template inspected and unchanged; conflicts documented, not resolved arbitrarily | §3, §15 | Verified |
| 13 | Issues log: 16 issues; status updated for D-22 to D-32 | §15 | Ready for approval |
| 14 | `PRODUCT_DEFINITION.md` v0.4 and `PROJECT_DECISIONS.md` aligned with D-17 to D-32 | — | Done |
| 15 | No application code written | — | Confirmed |

**Phase 2 APPROVED by the owners on 2026-11-20 (D-33)** — items 1–7, 11 and 13 accepted. Open issues and decisions listed in §5 remain open.

## 2. What Phase 3 Receives (per criterion, per assessment version)

Defined in `EVALUATION_FRAMEWORK.md` §17:
- Project context: target country, target area, beneficiary model.
- Answer codes: S+ / S / L / W / X / ND / U / C / B1–B5.
- Commercial and social dimension readings: Strong / Adequate / Limited / Weak / Absent / Not yet determined / Undetermined / Conflicting; social may also be **Not Applicable**.
- Evidence confidence per dimension (input to criterion-level and overall confidence, D-26): High / Moderate / Low / Statement only / Not assessable / Not applicable.
- Flags (unknown, conflicts, grant-dependent, model conflict, limited social coverage, social impact not demonstrated, etc.).
- Qualitative criterion outcome and structured recommendations.

## 3. Constraints Phase 3 Must Respect

1. Deterministic scoring; the Scoring Engine is the only component that produces scores.
2. Commercial and Social scores are separate and shown side by side at criterion level and overall; neither compensates for the other (D-22, D-31).
3. Unknown dimensions are **Not Scored** — never zero, never positive; completeness reported separately (D-23).
4. Every question answered before submission; "لسه مش عارفين" is a valid answer (D-24).
5. N/A dimensions excluded from calculation, never zero or positive, shown with reason; Social Coverage beside the Social Score (D-25).
6. Evidence Confidence per criterion and overall, separate from scores; it does not raise or lower them (D-26).
7. Single-select for all questions unless a question is explicitly approved as multi-select (D-27).
8. Prevalence and severity from the existing bank and evidence only; gaps flagged, never invented (D-28).
9. Commercial market size from paying customers/organisations within the geographic scope; social reach kept separate (D-30).
10. Every assessment keeps its methodology version; methodology-driven changes are distinguished from project progress (D-32).
11. Grants/donations never count as commercial performance. AI never assigns, changes, or overrides scores.
12. Question bank wording and options unchanged. No numerical rules until owner-approved. No coding until the methodology (Phase 3) and architecture (Phase 8) are approved.

## 4. Phase 3 Owner Decisions — Status

| Handoff item | Decision ID | Topic | Status |
|---|---|---|---|
| 1 | D-22 (P3-D1) | Score structure — separate Commercial and Social scores, side by side | **Approved (A)** |
| 2 | D-23 (P3-D2) | Unknown → Not Scored; completeness reported separately | **Approved (A)** — scope confirmation → OPEN-30 |
| 3 | D-24 (P3-D3) | Every question answered before submission | **Approved (C)** — resolves OPEN-09 |
| 4 | D-25 (P3-D4) | N/A excluded, shown with reason; Social Coverage displayed | **Approved (A)** — coverage definition → OPEN-35 |
| 5 | D-26 (P3-D5) | Evidence Confidence per criterion and overall, separate from scores | **Approved (C)** — derivation → OPEN-34 |
| 6 | D-27 (P3-D6) | Single-select default | **Approved (A)** — resolves ISSUE-12 |
| 2nd wave | D-28 (P3-D7) | Prevalence & severity from bank + evidence | **Approved (A)** — resolves ISSUE-06 |
| 2nd wave | D-29 (P3-D8) | Evidence guidance for C2–C8 | **Approved (A)** — resolves ISSUE-13; wording → OPEN-38 |
| 2nd wave | D-30 (P3-D9) | Large Market calibration principles | **Approved (C)** — reference points → OPEN-36 |
| 2nd wave | D-31 (P3-D10) | Commercial and Social Overall Scores + Overall Classification | **Approved (C)** — aggregation → OPEN-31; classification → OPEN-32 |
| 2nd wave | D-32 (P3-D11) | Methodology versioning | **Approved (C)** — resolves OPEN-13; presentation → OPEN-37 |

## 5. Remaining Open Decisions Before the Scoring Specification Can Be Finalised

No option below has been chosen. Where no options were documented, none are invented here.

| ID | Title | What needs to be decided | Documented options | Why it matters | Blocks Scoring Spec? |
|---|---|---|---|---|---|
| **OPEN-28** | Score scale and reading-to-score mapping | The form of a dimension score (e.g., numeric scale or labelled levels) and how each reading (Strong / Adequate / Limited / Weak / Absent) maps onto it, for each criterion. | None documented. | Every criterion, overall score, and classification depends on it; required for determinism. | **Yes** |
| **OPEN-29** | Conflicting dimensions in scores | When a dimension is Conflicting, or a Model conflict is unresolved, is it Not Scored, scored provisionally, or scored by another rule? | None documented. Framework rule: never silently adopt the more or less favourable answer. | Conflicts are common in self-reported answers; the wrong rule rewards or penalises inconsistency. | **Yes** |
| **OPEN-30** | Scope of "Not Scored"; treatment of Absent | (a) Confirm D-23 covers **Not yet determined** (e.g., "لم نحسب ذلك بعد") as well as Unknown — the handoff option text said "Undetermined or Not yet determined", the recorded decision text says "Unknown". (b) Confirm that **Absent** (founder states the mechanism does not exist) is scored as a performance level, not Not Scored. | Option text of D-23 (A) covers both U and ND. | Decides whether frequent "not calculated yet" answers are scored or excluded; separates known gaps from unknowns. | **Yes** (confirmation) |
| **OPEN-31** | Aggregation into Commercial and Social Overall Scores | How the eight criterion-level commercial scores combine into the Commercial Overall Score, and likewise for social; whether criteria are treated equally or weighted (any weights need approval); how Not Scored and N/A-excluded criteria affect the overall; whether an overall score is shown when few criteria are scored. | None documented. | Required by D-31; determines the headline numbers. | **Yes** |
| **OPEN-32** | Overall Classification | The classification categories and the rules that assign a category from the Commercial and Social Overall Scores (plus completeness and Social Coverage) without compensation; whether confidence is shown with the classification. | None documented. | Required by D-31; the main message founders and reports will show. | **Yes** |
| **OPEN-33** | Information completeness | What completeness measures (with D-24, every question is answered, so it would distinguish known answers from "لسه مش عارفين" and Not yet determined), at criterion and overall level, and how it is displayed. | None documented. | Required by D-23; tells users how much of the result rests on known information. | **Yes** |
| **OPEN-34** | Evidence Confidence derivation | How dimension-level confidence (framework §4.3) becomes the criterion-level confidence and the overall confidence level required by D-26; how N/A and Not Scored dimensions are treated. | None documented. | Required by D-26; must remain separate from scores. | **Yes** |
| **OPEN-35** | Social Coverage definition | What Social Coverage counts (e.g., applicable social dimensions out of eight; whether Not Scored dimensions reduce it) and whether the Social Overall Score is qualified or withheld when coverage is low (e.g., service-user projects with 2 of 8 applicable). | Framework example: "social dimensions assessed: 2 of 8". | Required by D-25; prevents a small social base from looking like a full assessment. | **Yes** |
| **OPEN-36** | Large Market calibration reference points | D-30 sets the principles. Still needed: the reference points for judging whether a size band is large for a given geographic scope and payer type (individuals vs organisations), and for social reach; and who supplies them (owners or named published sources), since the platform must not invent market facts. | None documented. | Without them C1 cannot be scored consistently across countries and areas. | **Yes** (for C1) |
| **ISSUE-11** | C2/C3 overlap rule | Confirm that High Gross Margins owns adequacy of beneficiary income and Recurring Revenue owns its regularity (framework §14.2). | Rule proposed in framework §14.2. | Prevents the same answer pattern being scored twice. | **Yes** (confirmation) |
| **OPEN-37** | Presentation of methodology-driven changes | How methodology-driven changes are labelled in comparisons and progress views; who can trigger re-scoring under a newer methodology; which result is shown by default. | None documented. | Required to apply D-32 in the product. | No — needed for Phase 5 (the spec only needs to record the methodology version) |
| **OPEN-38** | Wording of C2–C8 evidence guidance | Approve the exact wording (drafts in framework §16.3) and its language. | Drafts in framework §16.3. | Needed before UX; does not change scoring. | No |

Also required before the Scoring Specification is finalised (approval rather than a design decision):
- Owner approval of the scoring test cases and their expected results (§6, item 6).

Not blocking the Scoring Specification: ISSUE-01, 02, 03, 04, 05, 09, 10, 15; OPEN-05, 10, 19, 20, 23, 27.

## 6. Phase 3 Deliverables (for owner approval)

1. Scoring specification built on D-22 to D-32 and the decisions in §5.
2. Treatment rules for Unknown / Not yet determined / Absent / N/A / Conflicting in scores and aggregation.
3. Large Market calibration approach using approved reference points (OPEN-36).
4. Commercial and Social Overall Score aggregation (OPEN-31) and Overall Classification (OPEN-32).
5. Information completeness, Social Coverage, and Evidence Confidence outputs (OPEN-33, OPEN-35, OPEN-34).
6. Owner-approved test cases: unknown-heavy project; strong-commercial/weak-social project; grant-dependent project; conflicting-answers project; service-user beneficiary model; service-user project with a model conflict; reassessment under a newer methodology version.
