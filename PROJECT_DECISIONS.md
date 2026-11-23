# Project Decisions Log
Social Enterprise Evaluation Platform — companion to `PRODUCT_DEFINITION.md` (v0.4)

Last updated: 2026-11-20

---

## 1. Current Project Status

| Item | Status |
|---|---|
| Current phase | **Phases 4–10 implemented and tested** (`IMPLEMENTATION_PROGRESS.md`). Remaining owner items: live Gemini + data terms (OPEN-19/20), deployment, OPEN-05, OPEN-10, OPEN-38. |
| Phase 2 | **APPROVED** — `EVALUATION_FRAMEWORK.md` v1.3 (D-33) |
| Product Definition | `PRODUCT_DEFINITION.md` v0.4, aligned with D-17 to D-32 |
| Application code | **None written.** Coding is not permitted until the methodology and the architecture are approved. |
| Eight criteria | Approved |
| Evaluation questions (all eight criteria) | Approved; exact bank (32 core questions + Large Market evidence follow-up) recorded in `EVALUATION_FRAMEWORK.md` |
| Evaluation logic, all eight criteria | Drafted (qualitative; no scores, weights, or thresholds) |
| Phase 2 open issues | 16 logged in `EVALUATION_FRAMEWORK.md` §15 (summary in §6 below). Resolved: ISSUE-06, 07, 08, 12, 13, 14, 16 (partly). |
| Phase 3 handoff and decision status | `PHASE_3_HANDOFF.md` |
| Scoring methodology | **APPROVED** — `SCORING_SPECIFICATION.md` v1.0 = methodology M1.0 (D-34 to D-37) |
| Alan's Excel template | Received — `Alan's List of Success.xlsx` (worksheet `نموذج الآن للنجاح`); unchanged |

---

## 2. Approved Decisions

| ID | Decision | Source |
|---|---|---|
| D-01 | A social enterprise must achieve **both** financial profitability with a sustainable business model **and** meaningful, measurable social impact. Both are mandatory; neither replaces the other. | Brief; Revision v0.1 §1 |
| D-02 | Donations or grants alone do not satisfy the profitability requirement; they may be supplementary funding or revenue sources. | Revision v0.1 §1 |
| D-03 | The mechanism for measuring and combining financial and social performance is defined in the Scoring Engine phase. | Revision v0.1 §1 |
| D-04 | The eight criteria are fixed: Large Market, High Gross Margins, Recurring Revenue, Leverage Our Capabilities, Supply Chain Capabilities, Direct Customer Access, PR & Communications, Exit Strategy. | Brief; Revision v0.1 §2 |
| D-05 | The evaluation questions for all eight criteria are approved and remain unchanged unless the owners explicitly request changes. | Revision v0.1 §2 |
| D-06 | Each criterion's social-enterprise interpretation preserves both business viability and social value and its original business meaning. | Brief; Revision v0.1 §2 |
| D-07 | Current evaluation work formalizes: answer interpretation, evaluation rules, evidence strength and confidence, missing/conflicting information handling, assessment outcomes, criterion-specific recommendations. | Revision v0.1 §2 |
| D-08 | Large Market principles: assess actual social need (not current serving capacity); separate need from evidence confidence; distinguish absolute affected population, prevalence, and severity; consider target population and geography together; weak evidence ≠ small need; unknown ≠ zero; recommendations explain how to improve and what evidence is needed. Other criteria follow the same approach. | Revision v0.1 §3 |
| D-09 | No final numerical thresholds, weights, or scoring rules are set until the methodology is approved. | Brief; Revision v0.1 §3 |
| D-10 | Alan's original Excel template is received; its structure is preserved and it is not redesigned or replaced. | Revision v0.1 §4 |
| D-11 | Module boundaries: Evidence Evaluator (evidence relevance/quality/strength; information states; no scoring), Scoring Engine (approved rules; criterion and overall scores; deterministic), AI Analyst (explains; recommends; explains gaps; no invented evidence; no override), Project & Assessment Version Management (save; editable info; immutable versions; reassessment and comparison), Reports & Exports (PDF; Excel in Alan's template; uses saved results, no recalculation). | Brief; Revision v0.1 §5 |
| D-12 | Save, return, update, apply and track recommendations, reassess, and compare criterion-level and overall scores across versions. Every assessment is a separate version; history is never overwritten. | Brief; Revision v0.1 §6 |
| D-13 | Score changes must be justified by new information, evidence, or actual project changes under the same methodology. | Brief; Revision v0.1 §6 |
| D-14 | A recommendation marked completed by the user does not automatically increase the score. | Revision v0.1 §6 |
| D-15 | Phase sequence: Product Definition → Evaluation Framework & Evaluation Logic → Scoring Engine → AI Analysis & Recommendations → Project Saving, Versioning & Reassessment → Reports & Exports → UX/UI → Technical Architecture → Development → Testing & Validation. | Brief; Revision v0.1 §7 |
| D-16 | No coding before the methodology and the architecture are approved. | Revision v0.1 §7 |
| D-17 | **Target geography:** target country and geographic area are recorded as basic project information — not as evaluation questions — and used as context when interpreting Large Market. | Owner decision, 2026-11-20 |
| D-18 | **Beneficiary model:** each project records whether beneficiaries are workers/producers/earners or service users. Genuinely inapplicable social dimensions are marked `Not Applicable` — never weak performance, never zero — and this must not hide missing or negative social impact. Applied in `EVALUATION_FRAMEWORK.md` §4.0.2. | Owner decision, 2026-11-20 |
| D-19 | The approved question bank (32 core questions + Large Market evidence follow-up) is fixed; new user-facing questions may only be proposed, never added silently. | Phase 2 brief §2–3 |
| D-20 | The AI Analyst may extract and structure free-text information; extracted statements stay linked to the original input, go through evidence assessment, and are never verified evidence by extraction alone. AI never assigns, changes, or overrides scores. (Resolves OPEN-16.) | Phase 2 brief §8 |
| D-21 | Beneficiary model options "Both" and "Not yet determined" are approved alongside "Workers / producers / earners" and "Service users". The applicability mapping and safeguards in `EVALUATION_FRAMEWORK.md` §4.0.2 stay unchanged. All 32 questions are always presented. (Submission rule later decided by D-24.) | Owner decision, 2026-11-20 |

### 2.1 Phase 3 Owner Decisions (Scoring Engine) — recorded 2026-11-20

The owners labelled these Phase 3 decisions D1–D11. They are recorded here as **D-22 to D-32** to avoid colliding with D-01 to D-11. "Option" refers to `PHASE_3_HANDOFF.md` §4 (v1 of the handoff) where options were documented.

| ID | Phase 3 label | Decision | Option | Resolves |
|---|---|---|---|---|
| D-22 | P3-D1 Score Structure | Commercial and Social scores are kept **separate** and displayed **side by side**. Neither dimension can compensate for weakness in the other. | A | Handoff decision 1 |
| D-23 | P3-D2 Unknown Treatment | An Unknown dimension is reported as **Not Scored**. Information completeness is reported separately. Unknown is never converted into zero or a positive score. | A (option text: "Undetermined or Not yet determined" dimension → "Not scored", completeness reported) | Handoff decision 2 |
| D-24 | P3-D3 Submission Rule | Every question must receive an answer before submission. "لسه مش عارفين" (not yet known) is an acceptable explicit answer. Blank unanswered questions are not accepted at submission. | C | **OPEN-09**, ISSUE-14 |
| D-25 | P3-D4 N/A Treatment | Genuinely non-applicable dimensions are **excluded** from the relevant calculation. N/A never counts as zero or as a positive score. Excluded dimensions and their reasons are shown. **Social Coverage** is displayed alongside the Social Score. | A | ISSUE-16 (scoring part) |
| D-26 | P3-D5 Evidence Confidence | Evidence Confidence is calculated and displayed **separately for each criterion**, and an **overall Evidence Confidence** level is also displayed. Confidence stays separate from performance scores and does not automatically raise or lower them. | C | Handoff decision 5 |
| D-27 | P3-D6 Selection Mode | Single-select is the default for all questions. Multi-select is not allowed unless explicitly approved for a specific question. | A | ISSUE-12 |
| D-28 | P3-D7 Prevalence & Severity | Prevalence and severity are assessed using the existing approved question bank and available evidence. No new core questions. Missing information is identified as an evidence gap, never invented by AI. | A | ISSUE-06 |
| D-29 | P3-D8 Evidence Prompts C2–C8 | Supporting evidence guidance is added for C2–C8, telling users what evidence they may provide. It does not modify or replace the approved core questions. | A | ISSUE-13 |
| D-30 | P3-D9 Large Market Calibration | Calibration considers both the project's geographic target scope and its commercial market. Commercial market size is assessed using potential paying customers or paying organisations, not beneficiary numbers alone. Social beneficiary reach is kept separate from commercial market size. | C (owner label; no lettered options were documented for this item) | Handoff "calibration approach" (principle only) |
| D-31 | P3-D10 Overall Classification | A **Commercial Overall Score** and a **Social Overall Score** are reported separately, plus an **Overall Classification** that communicates the project's position across both dimensions. Neither dimension compensates for the other. | C (owner label; no lettered options were documented for this item) | Handoff "overall aggregation" (structure only) |
| D-32 | P3-D11 Methodology Versioning | Every historical assessment is preserved with its original methodology version and never overwritten. Optional reassessment using a newer methodology version is allowed. Methodology-driven score changes are clearly distinguished from actual project progress. | C (owner label; OPEN-13 listed "keep original / re-score for comparison only / mark a methodology break" — the recorded text is the owners' wording) | **OPEN-13** |
| D-33 | — | **Phase 2 approved:** `EVALUATION_FRAMEWORK.md` v1.3 is accepted as the foundation for Phase 3 (Phase 2 checklist items 1–7, 11, 13 in `PHASE_3_HANDOFF.md` §1). Approval does not resolve the open issues and decisions still listed. | Owner approval, 2026-11-20 | — |
| D-34 | OPEN-28 | **Score scale:** dimension scores use 1–5 — Strong = 5, Adequate = 4, Limited = 3, Weak = 2, Absent = 1. | Owner approval, 2026-11-20 | OPEN-28 |
| D-35 | OPEN-29 | **Conflicts:** unresolved conflicting information → Not Scored until clarification or evidence resolves the conflict. | Owner approval, 2026-11-20 | OPEN-29 |
| D-36 | OPEN-30 | **Not Scored scope:** Absent = 1 when absence is sufficiently established; Unknown and Not yet determined = Not Scored; unresolved Conflicting = Not Scored; N/A excluded from scoring with its reason displayed. | Owner approval, 2026-11-20 | OPEN-30 |
| D-37 | — | **Phase 3 approved:** owners stated "We have completed and approved Phase 3 — Scoring Engine Design." Recorded as approval of `SCORING_SPECIFICATION.md` (v0.1 → v1.0, methodology M1.0) as written, including the recommended options for OPEN-31 to OPEN-37, ISSUE-11, and OPEN-39 to OPEN-41. Note: the specification was drafted in the same working session as this approval; owners may still revise any item through a new methodology version (D-32). | Owner statement, 2026-11-20 | OPEN-31–37, 39–41, ISSUE-11 |
| D-38 | — | **AI provider:** Google Gemini API is the initial AI provider, behind a provider abstraction. | Owner decision, 2026-11-20 | OPEN-20 (provider part) |
| D-39 | — | **Prototype data rule:** development and testing use dummy or anonymised data only; no sensitive real project or beneficiary data is sent to Gemini until privacy and data-handling decisions (OPEN-19, OPEN-20 data terms) are approved. API keys only in backend environment variables. A mock AI mode must exist. | Owner decision, 2026-11-20 | — |
| D-40 | — | **Autonomous implementation:** the implementation team may make technical and reversible product implementation decisions for Phases 4–10 without per-decision approval, recording them in `TECHNICAL_DECISIONS.md`. Approved product rules, the question bank, and the scoring methodology may not be changed. No paid services, sensitive-data exposure, or irreversible external actions without authorisation. | Owner instruction, 2026-11-20 | D-16 gate satisfied for development |

---

## 3. Open Decisions (owner decision required)

| ID | Decision | Needed by |
|---|---|---|
| OPEN-05 | Platform/report language(s) and target enterprise stage(s) | Phase 4 |
| OPEN-10 | Deletion and retention of projects and versions | Phase 5 |
| OPEN-19 | Data protection regulations and data residency | Phase 8 |
| OPEN-20 | Use of an external AI provider for project data | Phase 4/8 |
| OPEN-23 | Allowed phase overlaps (gate before coding unchanged) | Scheduling |
| OPEN-27 | Excel export mapping into the template's existing cells without changing its structure | Phase 6 |

### 3.1 Open Phase 3 Decisions (Scoring Specification)

Details, documented options, and blocking status: `PHASE_3_HANDOFF.md` §5.

| ID | Decision | Blocks Scoring Specification? |
|---|---|---|
| OPEN-31 | Aggregation into Commercial and Social Overall Scores — **APPROVED (D-37):** unweighted mean of scored criteria (equal weights in M1.0), "criteria met" and distribution shown, minimum coverage 6 of 8 commercial / 75% of applicable social (min 2) (`SCORING_SPECIFICATION.md` §3.1–3.3) | Yes |
| OPEN-32 | Overall Classification — **APPROVED (D-37):** dimension levels High/Moderate/Low/Not classifiable with gatekeepers (C2 commercial; C1 and C7 social) and weakest-criterion guard; six categories; mandatory qualifiers (§3.4–3.5) | Yes |
| OPEN-33 | Information completeness — **APPROVED (D-37):** known answers (not U/ND) out of applicable questions, per criterion, dimension and overall; project-context completeness; informational only (§4) | Yes |
| OPEN-34 | Evidence Confidence roll-up — **APPROVED (D-37):** criterion = lower of its dimensions; overall = lower median of scored dimensions, capped at lowest gatekeeper confidence; distribution shown (§5) | Yes |
| OPEN-35 | Social Coverage — **APPROVED (D-37):** applicability (applicable of 8, N/A reasons) + scored (scored of applicable, Not Scored reasons); same format for commercial (§6) | Yes |
| OPEN-36 | Large Market calibration — **APPROVED (D-37):** internal band-to-reading table by payer type (individual vs organisation); geography used for interpretation, plausibility, need profile, recommendations — no numeric geography thresholds (§7) | Yes |
| ISSUE-11 | C2/C3 overlap — **APPROVED (D-37):** C2 scores adequacy, C3 regularity; "intermittent" C2 Q3 option → C2 social read from C2 Q4 (§2.5) | Yes |
| OPEN-37 | Methodology comparisons — **APPROVED (D-37):** criterion-level change list with cause; earlier inputs re-scored under the newer methodology for comparison only (§8) | No (needed for Phase 5) |
| OPEN-38 | Exact wording of C2–C8 evidence guidance | No (needed before UX) |
| OPEN-39 | **APPROVED (D-37) — recommended option adopted:** adverse-anchor rule — when an adverse anchor answer contradicts a favourable qualifier, score on the anchor and flag instead of Not Scored (refines application of D-35) (§2.4) | Yes |
| OPEN-40 | **APPROVED (D-37) — recommended option adopted (no adjustment in M1.0):** should documented high prevalence/severity raise the Large Market social reading? Recommendation: no adjustment in M1.0; show need profile (§7.3) | Yes (C1 social) |
| OPEN-41 | **APPROVED (D-37) — recommended option adopted (qualifier, no separate label):** may a positive classification rest on founder statements only, with a mandatory "based mainly on founder statements" qualifier (recommended, consistent with D-26), or should it use a separate label? (§3.5) | Yes |

**Cannot be set responsibly without additional evidence (deferred to a later methodology version, D-32):** differentiated criterion weights; recalibration of Large Market bands by country/area; review of the 75% coverage minimum. Basis: data from real assessments and official statistics.

## 4. Deferred — Future Design Decisions (non-blocking)

| ID | Topic | Decide in |
|---|---|---|
| FDD-01 | Additional user types and project sharing | Phase 5/7 |
| FDD-02 | Administrator role and methodology management | Phase 8 |
| FDD-03 | Authentication method | Phase 8 |
| FDD-04 | Basic project information fields — **partly decided:** target country, target area, and beneficiary model are required context (D-17, D-18); remaining fields and formats open | Phase 5 |
| FDD-05 | Evidence formats and file analysis | Phase 5/8 |
| FDD-06 | Reassessment frequency limits | Phase 5 |
| FDD-07 | Project duplication / scenarios | Phase 5 |
| FDD-08 | How a recommendation is shown as reflected in a later assessment | Phase 4/5 |
| FDD-09 | Framework & Methodology Registry placement | Phase 8 |
| FDD-10 | Recommendation prioritisation | Phase 4 |
| FDD-11 | Overall summary placement | Phase 6 |
| FDD-12 | Availability, performance, scale targets | Phase 8 |
| FDD-13 | Accessibility target | Phase 7 |
| FDD-14 | Form factor | Phase 7/8 |
| FDD-15 | Platform business model | Before launch |
| FDD-16 | Naming, branding, attribution | Phase 6/7 |

## 5. Removed / Resolved Decisions

| ID | Reason |
|---|---|
| OPEN-01 | Dual objective is approved (D-01). |
| OPEN-02 | Criteria, questions, and interpretation principle approved (D-04–D-06); interpretation is Phase 2 work. |
| OPEN-15 | Resolved by approved module boundaries (D-11). |
| OPEN-14 (part) | User-marked completion does not raise the score (D-14); remainder → FDD-08. |
| OPEN-16 | Resolved by D-20 (Phase 2 brief §8). |
| OPEN-09 | Resolved by D-24 (every question answered; "لسه مش عارفين" accepted; blanks not accepted). |
| OPEN-13 | Resolved by D-32 (versions preserved; optional re-scoring under newer methodology; methodology changes distinguished from progress). Presentation details → OPEN-37. |
| OPEN-28 | Resolved by D-34 (1–5 scale). |
| OPEN-29 | Resolved by D-35 (unresolved conflict → Not Scored). |
| OPEN-30 | Resolved by D-36 (Absent = 1; Unknown/ND/Conflicting = Not Scored; N/A excluded). |

## 6. Phase 2 Issues Log (detail in `EVALUATION_FRAMEWORK.md` §15)

| ID | Issue | Status |
|---|---|---|
| ISSUE-01 | Exit Strategy name differs: template "الخروج/ الاستتثمار" vs bank "الخروج والاستمرار" | Open — owners to confirm; export keeps template text |
| ISSUE-02 | Template asks for industry-average margins and market growth trend; no approved questions | Open — evidence-only? |
| ISSUE-03 | Template stresses distinctive capabilities; bank measures existence and fit | Open |
| ISSUE-04 | Strength of intermediary relationships not captured (C6) | Open — evidence-only? |
| ISSUE-05 | Spelling differences in criterion names | Record only |
| ISSUE-06 | Prevalence and severity (approved LM principle) not captured by questions | **Resolved — D-28** |
| ISSUE-07 | Target geography | **Resolved — D-17** |
| ISSUE-08 | Beneficiary model applicability | **Resolved — D-18** |
| ISSUE-09 | One LM evidence question covers both market and need estimates | Open |
| ISSUE-10 | Supply chain interpretation for service/digital enterprises | Open — confirm |
| ISSUE-11 | C2 Q3 / C3 Q4 overlap rule | **Open — confirm before Scoring Specification is finalised** |
| ISSUE-12 | Single-select assumption | **Resolved — D-27** |
| ISSUE-13 | No evidence prompts for C2–C8 | **Resolved — D-29** (wording → OPEN-38) |
| ISSUE-14 | Unanswered vs unknown (= OPEN-09) | **Resolved — D-24** |
| ISSUE-15 | No independent verification step | Open |
| ISSUE-16 | Not Applicable dimensions in scoring; service-user benefit not measured beyond C1/C7 | **Partly resolved — D-25** (scoring treatment). Coverage gap for service-user benefit remains visible; Social Coverage definition → OPEN-35 |
