# Product Definition Document
## Social Enterprise Evaluation Platform (working title)

| Field | Value |
|---|---|
| Document status | **v0.4 — aligned with decisions D-17 to D-32; awaiting approval** |
| Phase | 1 of 10 — Product Definition |
| Version | 0.4 (supersedes 0.3) |
| Date | 2026-11-20 |
| Current work | Phase 3 — 11 scoring decisions recorded (D-22 to D-32); remaining decisions open. Phase 2 (`EVALUATION_FRAMEWORK.md` v1.3) approved 2026-11-20 (D-33) |
| Companion documents | `PROJECT_DECISIONS.md` (decision log and status), `EVALUATION_FRAMEWORK.md`, `PHASE_3_HANDOFF.md` |

---

## 0. How to Read This Document

Every requirement and statement is tagged so that approved product decisions are never confused with proposals.

| Tag | Meaning |
|---|---|
| **[APPROVED]** | Decided by the project owners (initiation brief or revision request v0.1). Cannot change without owner approval. |
| **[PROPOSED]** | An implementation suggestion from the architect/analyst. **Not binding** until approved. |
| **[TO BE DEFINED — Phase N]** | Approved as a requirement; its detailed content is produced in the named phase and approved by the owners then. |
| **[OPEN-xx]** | A product decision that genuinely requires the project owners. See Section 12.1. |
| **[FDD-xx]** | Future Design Decision: an implementation detail deferred to a later phase. Does not block current work. See Section 12.2. |
| **[RECEIVED]** | Material supplied by the owners and available in the project materials. |

Ground rules followed in this document:
- No scoring rules, weights, numerical thresholds, or rating scales have been invented.
- The approved evaluation questions are not modified, restated, or redesigned here.
- No technology stack has been chosen. Technical ideas appear only as **[PROPOSED]**.
- Where a product decision has not been made, it is raised as **[OPEN-xx]** rather than decided.

---

## 1. Product Vision and Objectives

### 1.1 Vision [APPROVED]
Build a platform that helps founders **evaluate, improve, and track the development** of social enterprises, using Alan's List of Success as the evaluation framework.

### 1.2 Definition of a Social Enterprise (for this product) [APPROVED]
A social enterprise evaluated by this platform must achieve **both** of these mandatory objectives:
1. **Financial profitability and a sustainable business model.**
2. **Meaningful and measurable social impact.**

Approved principles:
- **Both objectives are mandatory. Neither replaces the other.** Strong social impact does not compensate for an unsustainable business model, and strong financial performance does not compensate for weak social impact.
- **Donations and grants alone do not satisfy the profitability requirement.** They may be recognised as supplementary funding or revenue sources where appropriate, but the enterprise must still demonstrate a profitable, sustainable business model.
- The exact scoring mechanism for measuring and combining financial and social performance is **[TO BE DEFINED — Phase 3 (Scoring Engine)]**. This defines *how* the principle is applied; the principle itself is not open.

### 1.3 Objectives

| # | Objective | Tag |
|---|---|---|
| O1 | Provide an independent, criterion-by-criterion assessment against the eight approved criteria. | [APPROVED] |
| O2 | State the evidence confidence behind every assessment. | [APPROVED] |
| O3 | Give specific, actionable recommendations for each criterion. | [APPROVED] |
| O4 | Produce overall results using the approved methodology: a Commercial Overall Score and a Social Overall Score reported separately, plus an Overall Classification across both (D-31). | [APPROVED] — aggregation and classification rules [TO BE DEFINED — Phase 3] |
| O5 | Let founders save projects, reassess them, and see progress over time without ever losing historical assessments. | [APPROVED] |
| O6 | Produce PDF reports and an Excel export based on Alan's original template. | [APPROVED] — template [RECEIVED] |
| O7 | Make the evaluation transparent and repeatable: same inputs + same rules → same score. | [APPROVED] (Scoring Engine must be deterministic) |

### 1.4 The Eight Evaluation Criteria [APPROVED]

The eight criteria **and their evaluation questions** are approved by the project owners. The questions must remain unchanged unless the owners explicitly request modifications.

| # | Criterion (English) | Name in Alan's template (`نموذج الآن للنجاح`) | Criteria status | Questions status | Evaluation logic status |
|---|---|---|---|---|---|
| C1 | Large Market | سوق كبير | [APPROVED] | [APPROVED] | Drafted — `EVALUATION_FRAMEWORK.md` §6 |
| C2 | High Gross Margins | هوامش ربح كبيرة | [APPROVED] | [APPROVED] | Drafted — §7 |
| C3 | Recurring Revenue | إيرادات متكررة قوية | [APPROVED] | [APPROVED] | Drafted — §8 |
| C4 | Leverage Our Capabilities | الأستفادة من قدراتنا | [APPROVED] | [APPROVED] | Drafted — §9 |
| C5 | Supply Chain Capabilities | قدرات سلسله التوريد | [APPROVED] | [APPROVED] | Drafted — §10 |
| C6 | Direct Customer Access | الوصول المباشر الى العميل | [APPROVED] | [APPROVED] | Drafted — §11 |
| C7 | PR & Communications | البعد الأعلامي و التواصلي | [APPROVED] | [APPROVED] | Drafted — §12 |
| C8 | Exit Strategy | استراتيجية الخروج/ الاستتثمار | [APPROVED] | [APPROVED] | Drafted — §13 |

*(Arabic names are quoted exactly as they appear in the template, including original spelling. The approved question bank uses slightly different spellings and names C8 "استراتيجية الخروج والاستمرار"; see `EVALUATION_FRAMEWORK.md` ISSUE-01 and ISSUE-05.)*

**Approved question bank [APPROVED — D-19]:** 32 core questions (four per criterion: two commercial, two social) plus one evidence follow-up under Large Market. The exact wording and options are recorded in `EVALUATION_FRAMEWORK.md` and are fixed; new user-facing questions may only be proposed, never added silently.

**Social-enterprise interpretation [APPROVED principle]:** each criterion is adapted to the social-enterprise context while preserving its original business meaning. The interpretation of every criterion must preserve **both business viability and social value**.

### 1.5 Evaluation Framework — Current Status

#### 1.5.1 Formalization Scope [APPROVED]
The current evaluation work formalizes, for each of the eight criteria:

| # | Element | Description |
|---|---|---|
| E1 | Answer interpretation | How answers to the approved questions are read and understood. |
| E2 | Evaluation rules | How interpreted answers lead to a criterion assessment. |
| E3 | Evidence strength and confidence | How relevance, quality, and strength of evidence are judged, separately from the assessment itself. |
| E4 | Missing and conflicting information handling | How unknown or contradictory information is treated (never automatically zero). |
| E5 | Assessment outcomes | The possible outcomes of a criterion assessment. |
| E6 | Criterion-specific improvement recommendations | What to improve and what evidence is needed. |

Other criteria follow the same evaluation-design approach as Large Market. Final numerical thresholds, weights, and scoring rules are **not** defined in this document **[TO BE DEFINED — Phase 2/3]**.

#### 1.5.2 Large Market (C1) — Approved Principles [APPROVED]
Large Market is currently being formalized. The following principles are approved:

1. Assess the **size of the actual social need**, not the number of beneficiaries the project can currently serve.
2. **Separate need assessment from evidence confidence.**
3. Distinguish:
   - **Absolute affected population**,
   - **Prevalence** within the relevant population, and
   - **Severity** of the problem.
4. Consider the **target population and geographical scope together**.
5. **Do not treat weak evidence as proof that the need is small.**
6. **Unknown information must not automatically receive zero.**
7. Recommendations must explain **how to improve the criterion and what evidence is needed**.

The qualitative evaluation logic for C1 and the other seven criteria is drafted in `EVALUATION_FRAMEWORK.md` (pending approval). Numerical thresholds remain **[TO BE DEFINED — Phase 3]**.

### 1.5.3 Project Context Used in Evaluation [APPROVED — D-17, D-18, D-21]
- **Target geography (D-17):** target country and geographic area are basic project information — not evaluation questions — and are used as context when interpreting Large Market.
- **Beneficiary model (D-18, D-21):** each project records whether beneficiaries are *Workers / producers / earners*, *Service users*, *Both*, or *Not yet determined*. Social dimensions that are genuinely inapplicable to the model are marked **Not Applicable** — never weak performance, never zero — with safeguards so this cannot hide missing or negative social impact (`EVALUATION_FRAMEWORK.md` §4.0.2). All 32 questions are always presented.

### 1.6 Out of Scope (for this document)
- Detailed evaluation logic, scoring rules, weights, and thresholds (Phases 2–3).
- Visual design (Phase 7).
- Technology choices (Phase 8).

---

## 2. Target Users

The brief names **founders** explicitly. Other user types are **proposed**; whether they are supported is deferred and does not affect the evaluation methodology.

| User type | Description | Primary needs | Tag |
|---|---|---|---|
| Founder / co-founder | Runs or is building a social enterprise. | Honest assessment, clear next steps, proof of progress. | [APPROVED] |
| Founder's team member | Contributes information and evidence to the founder's project. | Shared access to a project. | [PROPOSED] — **[FDD-01]** |
| Advisor / mentor / incubator staff | Supports multiple founders; reviews their assessments. | View several projects, compare progress, add comments. | [PROPOSED] — **[FDD-01]** |
| Investor / funder / evaluator | Reviews an enterprise for funding or support. | Read-only reports, evidence trail. | [PROPOSED] — **[FDD-01]** |
| Platform administrator | Manages users, framework configuration, and methodology versions. | Configure framework, audit activity. | [PROPOSED] — **[FDD-02]** |

User context still to confirm **[OPEN-05]**: platform/report language(s) and target enterprise stage(s). (Note: Alan's template is in Arabic with a right-to-left layout, and its guidance notes reference Egypt; this is an observation, not a decision.)

---

## 3. Core Problems Being Solved

| # | Problem | How the platform addresses it | Tag |
|---|---|---|---|
| P1 | Social enterprises are often evaluated only on impact *or* only on business viability, not both. | Mandatory dual-objective definition; eight business-rooted criteria interpreted to preserve both business viability and social value. | [APPROVED] |
| P2 | Founders lack a structured, repeatable way to judge whether their enterprise is set up for success. | Approved questions per criterion and an approved, deterministic scoring methodology. | [APPROVED] |
| P3 | Assessments are often opinion-based with no indication of how well-supported they are. | Evidence confidence per criterion, separate from the assessment; distinguishes supported, assumed, missing, and conflicting information. | [APPROVED] |
| P4 | Feedback is generic and not actionable. | Criterion-specific recommendations: what is weak, why it matters, what to do, what evidence would prove improvement. | [APPROVED] |
| P5 | Progress over time is invisible; earlier assessments are lost or overwritten. | Immutable assessment versions; comparison and progress tracking. | [APPROVED] |
| P6 | AI tools can produce confident-sounding but unsupported conclusions. | AI explains and recommends only; it may not invent evidence or override the Scoring Engine. | [APPROVED] |
| P7 | Results must be shareable with stakeholders in familiar formats. | PDF report and Excel export in Alan's original template. | [APPROVED] |

---

## 4. Complete User Journey

### 4.1 Journey Overview

```
 ┌────────────┐   ┌────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────────┐
 │ 1. Sign up │──▶│ 2. Create  │──▶│ 3. Answer    │──▶│ 4. Attach /  │──▶│ 5. Submit for  │
 │  / Sign in │   │   project  │   │  approved    │   │   describe   │   │   assessment   │
 └────────────┘   └────────────┘   │  questions   │   │   evidence   │   └───────┬────────┘
                                   └──────────────┘   └──────────────┘           │
                                                                                 ▼
 ┌────────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────────────────────┐
 │ 9. Reassess &  │◀──│ 8. Apply     │◀──│ 7. Export    │◀──│ 6. Review results:         │
 │    compare     │   │ recommend-   │   │  PDF / Excel │   │ per-criterion assessment,  │
 │  (loop to 3)   │   │ ations, add  │   └──────────────┘   │ confidence, recommendations│
 └───────┬────────┘   │ evidence     │                      │ and overall score          │
         │            └──────────────┘                      └────────────────────────────┘
         ▼
 ┌──────────────────┐
 │ 10. Track        │
 │ progress over    │
 │ time             │
 └──────────────────┘
```

### 4.2 Journey Steps in Detail

| Step | User action | System behaviour | Tag |
|---|---|---|---|
| 1. Access | Registers / signs in. | Authenticates user. | [PROPOSED] — method **[FDD-03]** |
| 2. Create project | Enters basic project information, including target country, target area, and beneficiary model. | Creates a project with an editable working draft. | [APPROVED] (D-17, D-18); other fields and formats **[FDD-04]** |
| 3. Answer questions | Answers the approved questions for each of the eight criteria. May save partial progress. | Stores answers in the working draft. | [APPROVED] (answering); partial save [PROPOSED] |
| 4. Provide evidence | Adds supporting evidence and may mark items as fact, estimate, or assumption. | Stores evidence linked to criteria/answers. | [APPROVED] (evidence is evaluated); formats **[FDD-05]** |
| 5. Submit | Requests an assessment. | Freezes a snapshot of inputs; runs Evidence Evaluator → Scoring Engine → AI Analyst; saves a new immutable assessment version. | [APPROVED] (versioning, module boundaries); snapshot mechanism [PROPOSED] |
| 6. Review | Reads criterion assessments, evidence confidence, information gaps, recommendations, and overall score. | Displays the assessment version. | [APPROVED] |
| 7. Export | Downloads PDF report and/or Excel file. | Generates files from a saved assessment version without recalculating. | [APPROVED] |
| 8. Improve | Applies recommendations and records their status; updates project information and evidence. | Records status; edits the working draft only (never past versions). Status changes never change scores. | [APPROVED] |
| 9. Reassess | Runs a new assessment of the same project. | Creates a new version; compares with previous versions. | [APPROVED] |
| 10. Track | Views progress. | Shows initial vs. latest score, trends, criterion changes, recommendation history. | [APPROVED] |

---

## 5. Core Features and Their Relationships

### 5.1 Feature List [APPROVED]

| ID | Feature | Summary |
|---|---|---|
| F-A | Project Creation | Create a project and submit basic information. |
| F-B | Initial Assessment (Questionnaire) | Answer the approved questions for the eight criteria and provide evidence. |
| F-C | Evaluation | Evidence Evaluator and Scoring Engine apply the approved framework; AI Analyst explains the results. AI must not invent evidence or override the Scoring Engine. |
| F-D | Recommendations | Per-criterion, actionable recommendations (weakness, why it matters, action, evidence of improvement). |
| F-E | Project Saving & Reassessment | Save, return, view history, update, reassess, compare; every assessment is a separate, never-overwritten version. |
| F-F | Progress Tracking | Initial vs. latest score, change over time, criterion-level change, recommendation status, new recommendations. |
| F-G | Reports & Exports | PDF report, overall summary, Excel in Alan's original template. |

### 5.2 Feature Relationships

```
            F-A Project Creation
                    │
                    ▼
        F-B Questionnaire + Evidence  ◀───────────────┐
                    │                                  │ (update info / evidence)
                    ▼                                  │
     ┌────────── F-C Evaluation ──────────┐            │
     │  Evidence Evaluator → Scoring      │            │
     │  Engine → AI Analyst               │            │
     └───────────────┬────────────────────┘            │
                     ▼                                 │
         Assessment Version (immutable) ──▶ F-D Recommendations
                     │                                 │
          ┌──────────┼──────────────┐                  │
          ▼          ▼              ▼                  │
   F-G Reports   F-F Progress   F-E Reassessment ──────┘
   & Exports     Tracking       (compare versions)
```

Key dependencies:
- F-C requires the evaluation logic (Phase 2) and scoring methodology (Phase 3).
- F-D depends on F-C output and on the criterion-specific recommendation rules (Phase 2, element E6).
- F-F depends on F-E (at least two versions are needed to show change).
- F-G depends on a saved assessment version and on Alan's template **[RECEIVED]**.

---

## 6. Project Saving and Assessment Versioning Workflow

### 6.1 Approved Rules [APPROVED]
1. Users can save a project.
2. Users can return to an existing project.
3. Users can view all previous assessments.
4. Users can update project information and evidence.
5. **Every assessment is stored as a separate version.**
6. **Historical assessments are never overwritten.**

### 6.2 Proposed Data Concepts [PROPOSED]

| Concept | Description | Mutable? |
|---|---|---|
| **Project** | The enterprise being evaluated (identity, owner, basic info). | Yes (basic info) |
| **Working Draft** | The current, editable set of answers and evidence. One per project. | Yes |
| **Assessment Version** | A frozen record created at submission time. | **No — immutable** |
| ↳ Input Snapshot | Exact copy of answers + evidence used for that assessment. | No |
| ↳ Methodology Version | Identifier of the evaluation logic and scoring rules applied. | No |
| ↳ Results | Criterion assessments, evidence confidence, information-state flags, overall score. | No |
| ↳ Recommendations | Recommendations generated for that version. | Content: no. Status: see 7.3 |
| ↳ Metadata | Version number, timestamp, who submitted, optional change note. | No |

Snapshotting inputs (not only results) is proposed so that any past score can be explained and reproduced exactly.

### 6.3 Workflow [PROPOSED]

```
 Create project ─▶ Working Draft (editable)
                        │
                        │  user edits answers / evidence, saves any time
                        ▼
                  [Submit for assessment]
                        │
                        ├─▶ 1. Check every question is answered        [D-24]
                        ├─▶ 2. Freeze Input Snapshot
                        ├─▶ 3. Run evaluation (Evidence Evaluator → Scoring Engine → AI Analyst)
                        ├─▶ 4. Store Assessment Version N (immutable)
                        └─▶ 5. Working Draft remains editable for the next round
```

Related decisions: every question must be answered before submission, "لسه مش عارفين" accepted **[APPROVED — D-24]**; deletion/retention **[OPEN-10]**; reassessment frequency **[FDD-06]**; project duplication **[FDD-07]**.

---

## 7. Reassessment and Progress Tracking Workflow

### 7.1 Reassessment Workflow [APPROVED core; mechanics PROPOSED]

```
 Review Version N ─▶ Apply recommendations ─▶ Update draft (info + evidence)
        ▲                                                │
        │                                                ▼
 Compare N+1 vs N  ◀── Store Version N+1 ◀── Submit for reassessment
 (and vs. Version 1)
```

1. User opens the latest assessment and its recommendations. [APPROVED]
2. User applies recommendations and tracks their status. [APPROVED]
3. User updates project information and evidence. [APPROVED]
4. User reassesses the same project → new version. [APPROVED]
5. User compares criterion-level and overall scores between versions. [APPROVED]
6. System explains *why* each criterion score changed, linking the change to specific new or changed inputs. [PROPOSED]

### 7.2 Score Change Integrity [APPROVED]
- Score changes must be justified by **new information, new evidence, or actual project changes under the same methodology**.
- **A recommendation marked completed by the user must not automatically increase the score.** Only new information or evidence, evaluated under the approved rules, can change a score.
- The Scoring Engine is deterministic: identical inputs and identical methodology version → identical scores.

Proposed implications [PROPOSED]:
- AI output is never a source of score variation between runs.
- **[APPROVED — D-32]** Every historical assessment keeps its original methodology version and is never overwritten. Optional reassessment under a newer methodology version is allowed. Methodology-driven score changes are clearly distinguished from actual project progress. Presentation details: **[OPEN-37]**.

### 7.3 Recommendation Status [APPROVED: users track status; status values PROPOSED]

| Status | Meaning | Effect on score |
|---|---|---|
| Open | Generated, not yet acted on. | None |
| In progress | Founder is working on it. | None |
| Completed (user-marked) | Founder says it is done. | **None** [APPROVED] |
| Reflected in assessment | A later assessment shows improvement based on new evidence. | Score change comes from the evidence, not the status |
| Dismissed | Founder chose not to act (optional reason). | None |
| Superseded | Replaced by a newer recommendation in a later version. | None |

How "Reflected in assessment" is determined is **[FDD-08]**.

### 7.4 Progress Tracking Display [APPROVED]
- Initial overall score.
- Latest overall score.
- Score changes over time.
- Criterion-level score changes.
- Previous recommendations and their status.
- Newly generated recommendations.

Proposed additions [PROPOSED]:
- Evidence confidence trend per criterion (score and confidence can move independently).
- Count of missing / conflicting information items per version.
- Side-by-side comparison of any two selected versions.

---

## 8. System Modules

### 8.1 Approved Module Responsibilities [APPROVED]

| Module | Responsibilities | Boundaries |
|---|---|---|
| **Evidence Evaluator** | Evaluates the relevance, quality, and strength of evidence. Distinguishes supported information, assumptions, missing information, and conflicting information. | Does **not** independently assign the project score. |
| **Scoring Engine** | Applies the approved evaluation rules. Produces independent criterion-level assessments and scores. Calculates the overall score using the approved methodology. | **Must be deterministic.** |
| **AI Analyst** | Explains the results. Generates actionable recommendations for each criterion. Explains missing information and weaknesses. May extract and structure free-text information, linked to the original input (D-20). | **Must not invent evidence or override the Scoring Engine.** Extraction alone never makes a statement verified evidence. |
| **Project & Assessment Version Management** | Saves projects. Maintains editable project information. Saves every assessment as a separate immutable version. Supports reassessment and comparison over time. | Never modifies stored versions. |
| **Reports & Exports** | Generates PDF reports. Generates Excel files using Alan's original template. | Uses saved assessment results; **does not recalculate scores.** |

### 8.2 Additional Supporting Components [PROPOSED]

| Component | Purpose | Note |
|---|---|---|
| Framework & Methodology Registry | Holds the approved criteria, questions, evaluation logic, and methodology versions as configuration. | Supports determinism and versioning. Placement **[FDD-09]**. |
| Recommendation status tracking | Tracks status of recommendations across versions. | Proposed as part of Version Management. |
| Progress comparison | Computes deltas and trends between versions. | Proposed as part of Version Management. |
| Identity & Access | Users, roles, sharing. | Scope depends on **[FDD-01]**. |

### 8.3 Evaluation Flow [APPROVED order of responsibilities; mechanics PROPOSED]

```
 Input Snapshot (answers + evidence)
      │
      ▼
 Evidence Evaluator ─── relevance / quality / strength;
      │                 Supported | Assumption | Missing | Conflicting
      ▼
 Scoring Engine ─── deterministic criterion assessments + overall score
      │              (approved evaluation rules and methodology)
      ▼
 AI Analyst ─── explanations, weaknesses, missing information,
      │          criterion-specific recommendations (cannot alter scores)
      ▼
 Assessment Version stored (immutable)
      │
      ▼
 Reports & Exports (render saved results only)
```

**AI extraction [APPROVED — D-20]:** the AI Analyst may extract and structure free-text information. Extracted statements stay linked to the original user input, go through the Evidence Evaluator, and never become verified evidence by extraction alone. AI never assigns, changes, or overrides scores.

---

## 9. Functional Requirements

Priority: **M** = Must, **S** = Should, **C** = Could. Tags show whether a requirement is approved or proposed.

### 9.1 Project Management
| ID | Requirement | Priority | Tag |
|---|---|---|---|
| FR-01 | Users can create a project with basic information. | M | [APPROVED] |
| FR-01a | Basic project information includes target country and target geographic area (context, not evaluation questions). | M | [APPROVED] — D-17 |
| FR-01b | Basic project information includes the beneficiary model: Workers / producers / earners, Service users, Both, or Not yet determined. | M | [APPROVED] — D-18, D-21 |
| FR-01c | Inapplicable social dimensions are shown as Not Applicable, never as weak or zero; all 32 questions are always presented. | M | [APPROVED] — D-18 |
| FR-02 | Users can save a project and return to it later. | M | [APPROVED] |
| FR-03 | Users can view a list of their projects. | M | [PROPOSED] (implied by FR-02) |
| FR-04 | Users can update project information and evidence. | M | [APPROVED] |
| FR-05 | Users can save partial questionnaire progress. | S | [PROPOSED] |
| FR-06 | Users can archive a project. | C | [PROPOSED] — see [OPEN-10] |

### 9.2 Questionnaire and Evidence
| ID | Requirement | Priority | Tag |
|---|---|---|---|
| FR-10 | The system presents the approved questions for each of the eight criteria, unchanged. | M | [APPROVED] |
| FR-11 | Users can provide evidence for answers. | M | [APPROVED] |
| FR-12 | Users can mark an input as fact/supported, estimate, or assumption. | S | [PROPOSED] |
| FR-13 | Users can state that information is unknown; it is recorded as Missing, not zero. | M | [APPROVED] principle; UI [PROPOSED] |
| FR-14 | Supported evidence formats. | M | [FDD-05] |

### 9.3 Evaluation
| ID | Requirement | Priority | Tag |
|---|---|---|---|
| FR-20 | The system produces an independent assessment for each criterion. | M | [APPROVED] |
| FR-21 | The system shows evidence confidence for each criterion assessment, separately from the assessment. | M | [APPROVED] |
| FR-22 | The system calculates separate Commercial and Social scores per criterion (side by side, no compensation), a Commercial Overall Score, a Social Overall Score, and an Overall Classification; Unknown dimensions are Not Scored; N/A dimensions are excluded with reasons shown; Evidence Confidence is shown per criterion and overall, separate from scores. | M | [APPROVED] — D-22, D-23, D-25, D-26, D-31; numerical rules [TO BE DEFINED — Phase 3] |
| FR-23 | The system distinguishes supported information, assumptions/estimates, missing information, and conflicting information. | M | [APPROVED] |
| FR-24 | Unknown information does not automatically receive zero. | M | [APPROVED] — treatment [TO BE DEFINED — Phase 2/3] |
| FR-25 | Weak evidence is not treated as proof of a weak result (e.g., weak evidence of need ≠ small need). | M | [APPROVED] (Large Market principle; same approach for other criteria) |
| FR-26 | Both business viability and social value are assessed; neither compensates for the absence of the other. | M | [APPROVED] — mechanism [TO BE DEFINED — Phase 3] |
| FR-27 | AI must not invent evidence. | M | [APPROVED] |
| FR-28 | AI must not override the Scoring Engine. | M | [APPROVED] |
| FR-29 | The Scoring Engine is deterministic. | M | [APPROVED] |
| FR-30a | Conflicting information is shown to the user with the conflicting items identified. | S | [PROPOSED] |
| FR-30b | Every score is explainable: the user can see which inputs and rules produced it. | S | [PROPOSED] |

### 9.4 Recommendations
| ID | Requirement | Priority | Tag |
|---|---|---|---|
| FR-31 | Each criterion has its own recommendations. | M | [APPROVED] |
| FR-32 | Each recommendation states what is weak/missing, why it matters, what the founder should do, and what evidence would demonstrate improvement. | M | [APPROVED] |
| FR-33 | Users can apply recommendations and track their status. | M | [APPROVED] |
| FR-34 | A recommendation marked completed by the user does not automatically increase the score. | M | [APPROVED] |
| FR-35 | Recommendations carry over between versions with history preserved. | S | [PROPOSED] |
| FR-36 | Recommendations are prioritised. | C | [PROPOSED] — [FDD-10] |

### 9.5 Versioning, Reassessment, and Progress
| ID | Requirement | Priority | Tag |
|---|---|---|---|
| FR-40 | Every assessment is stored as a separate version. | M | [APPROVED] |
| FR-41 | Historical assessments are never overwritten. | M | [APPROVED] |
| FR-42 | Users can view any previous assessment. | M | [APPROVED] |
| FR-43 | Users can reassess the same project. | M | [APPROVED] |
| FR-44 | Users can compare criterion-level and overall scores between versions. | M | [APPROVED] |
| FR-45 | Display initial overall score, latest overall score, and change over time (for both the Commercial and Social Overall Scores — D-31). | M | [APPROVED] |
| FR-46 | Display criterion-level score changes. | M | [APPROVED] |
| FR-47 | Display previous recommendations with status and newly generated recommendations. | M | [APPROVED] |
| FR-48 | Score changes are justified only by new information, evidence, or actual project changes under the same methodology. | M | [APPROVED] |
| FR-49 | Each version records the methodology version used. | M | [PROPOSED] (needed to enforce FR-48) |
| FR-50 | Each score change is explained by reference to changed inputs. | S | [PROPOSED] |

### 9.6 Reports and Exports
| ID | Requirement | Priority | Tag |
|---|---|---|---|
| FR-60 | Generate a PDF with criterion-level assessments and recommendations. | M | [APPROVED] |
| FR-61 | Generate an overall evaluation summary. | M | [APPROVED] — placement [FDD-11] |
| FR-62 | Generate an Excel file using Alan's original template, preserving its structure. | M | [APPROVED] — template [RECEIVED]; mapping [OPEN-27] |
| FR-63 | Exports use saved assessment results and never recalculate scores. | M | [APPROVED] |
| FR-64 | Exports can be generated for any historical version. | S | [PROPOSED] |
| FR-65 | A progress report comparing versions. | C | [PROPOSED] |

### 9.7 Access and Administration
| ID | Requirement | Priority | Tag |
|---|---|---|---|
| FR-70 | Users only see their own projects unless shared. | M | [PROPOSED] |
| FR-71 | Project sharing with other roles. | — | [FDD-01] |
| FR-72 | Admin management of methodology versions. | — | [FDD-02] |

---

## 10. Non-Functional Requirements

| ID | Category | Requirement | Tag |
|---|---|---|---|
| NFR-01 | Determinism / Reproducibility | Same inputs + same methodology version → identical scores. | [APPROVED] |
| NFR-02 | Immutability / Auditability | Stored assessment versions are never modified; each stores inputs, methodology version, outputs, timestamp, and actor. | [APPROVED] immutability; audit fields [PROPOSED] |
| NFR-03 | Transparency | Users can trace each score to rules and inputs; AI-generated text is labelled. | [PROPOSED] |
| NFR-04 | AI Grounding | AI outputs reference only provided inputs and Scoring Engine results; untraceable statements are flagged or rejected. | [APPROVED] intent (no invented evidence); mechanism [PROPOSED] |
| NFR-05 | Data Privacy & Security | Project data is private by default, encrypted in transit and at rest; role-based access. Regulations **[OPEN-19]**. | [PROPOSED] |
| NFR-06 | Data Retention | Retention and deletion rules **[OPEN-10]**. | — |
| NFR-07 | Third-party AI data handling | Whether project data may be processed by an external AI provider **[OPEN-20]**. | — |
| NFR-08 | Availability / Performance / Scale | Targets **[FDD-12]**. | — |
| NFR-09 | Usability | Founders without financial training can complete the questionnaire; plain-language explanations. | [PROPOSED] |
| NFR-10 | Accessibility | Conformance target **[FDD-13]**. | — |
| NFR-11 | Localisation | Languages and right-to-left support **[OPEN-05]**. | — |
| NFR-12 | Configurability | Questions, evaluation logic, scoring rules, and templates are configuration, not hard-coded, so methodology updates do not require redevelopment. | [PROPOSED] |
| NFR-13 | Export Fidelity | Excel output preserves the original template structure (single worksheet `نموذج الآن للنجاح`, eight criterion blocks, right-to-left layout, existing guidance notes). The template is not redesigned or replaced. | [APPROVED] |
| NFR-14 | Testability | Scoring Engine is testable in isolation with owner-approved test cases. | [PROPOSED] |

---

## 11. Development Phases and Dependencies

### 11.1 Phases [APPROVED sequence]

| # | Phase | Current status | Key outputs | Depends on |
|---|---|---|---|---|
| 1 | Product Definition | **In review (v0.3)** | This document and `PROJECT_DECISIONS.md`, approved. | — |
| 2 | Evaluation Framework and Evaluation Logic | **Approved — `EVALUATION_FRAMEWORK.md` v1.3 (D-33)** | For each of the eight criteria: answer interpretation, evaluation rules, evidence strength and confidence, missing/conflicting information handling, assessment outcomes, criterion-specific recommendations (E1–E6). Social-enterprise interpretation preserving business viability and social value. **Does not redesign the approved questions.** | 1 |
| 3 | Scoring Engine | Not started | Scoring methodology: criterion scoring, combination of financial and social performance, overall score, treatment of missing/conflicting data, owner-approved test cases. | 2 |
| 4 | AI Analysis and Recommendations | Not started | AI Analyst scope within approved boundaries; recommendation structure; grounding rules. | 2, 3 |
| 5 | Project Saving, Versioning and Reassessment | Requirements approved | Data model for projects, drafts, and immutable versions; comparison and progress logic. | 1, 3 (score structure) |
| 6 | Reports and Exports | Template **received** | PDF specification; mapping of saved results into Alan's original template without altering its structure. | 3, 4, 5 |
| 7 | UX/UI Design | Not started | User flows, wireframes, visual design. | 2, 4, 5 |
| 8 | Technical Architecture | Not started | Stack, hosting, AI provider, security design. | 1–7 |
| 9 | Development | **Not permitted yet** | Working platform. | **3 (methodology) and 8 (architecture) approved** |
| 10 | Testing and Validation | Not started | Functional, scoring-accuracy, AI-grounding, and acceptance tests. | 9; test cases from 3 |

**Approved constraint:** no coding begins before the methodology and the architecture are approved.

### 11.2 Dependency View

```
 1 Product Definition
        │
        ▼
 2 Evaluation Framework & Evaluation Logic   (all eight criteria drafted; awaiting approval)
        │
        ▼
 3 Scoring Engine (methodology) ─────┐
        │                            │
        ▼                            ▼
 4 AI Analysis & Recs     5 Project Saving, Versioning & Reassessment
        │                            │
        └────────────┬───────────────┘
                     ▼
            6 Reports & Exports
                     │
                     ▼
            7 UX/UI Design
                     │
                     ▼
            8 Technical Architecture
                     │
                     ▼   (gate: methodology + architecture approved)
            9 Development
                     │
                     ▼
            10 Testing & Validation
```

Possible overlaps (e.g., Phases 4 and 5 in parallel) are an owner choice **[OPEN-23]**; they never relax the gate before Phase 9.

---

## 12. Decisions

### 12.0 Review of the 26 Decisions Raised in v0.1

| v0.1 ID | Topic | Disposition in v0.2 | Reason |
|---|---|---|---|
| OPEN-01 | Dual objective enforcement | **Removed — approved** | Both objectives are mandatory (§1.2). Mechanism is Phase 3 work, not an open decision. |
| OPEN-02 | Social-enterprise adaptation of criteria | **Removed — approved principle; Phase 2 work** | Criteria and questions approved; interpretation is the Phase 2 deliverable. |
| OPEN-03 | Other user types / sharing | → **FDD-01** | Does not affect methodology. Needed before Phase 5/7. |
| OPEN-04 | Admin role | → **FDD-02** | Implementation detail. Needed before Phase 8. |
| OPEN-05 | Stages, geography, language | **Kept open (narrowed)** — language and enterprise stage | Owner decision; affects recommendations wording and UI. Geography is captured per project (Large Market principle 4). Not blocking Phase 2. |
| OPEN-06 | Authentication | → **FDD-03** | Phase 8. |
| OPEN-07 | Basic project fields | → **FDD-04** (later narrowed: geography and beneficiary model decided by D-17/D-18) | Phase 5. |
| OPEN-08 | Evidence formats | → **FDD-05** | Evidence strength rules (Phase 2) are format-independent. Needed before Phase 5/8. |
| OPEN-09 | Submission with unanswered questions | **Kept open** → later **resolved by D-24** | Every question answered; "لسه مش عارفين" accepted. |
| OPEN-10 | Deletion and retention | **Kept open** | Owner/legal decision; must not contradict "never overwrite". Needed by Phase 5. |
| OPEN-11 | Reassessment frequency | → **FDD-06** | Phase 5. |
| OPEN-12 | Project duplication | → **FDD-07** | Phase 5. |
| OPEN-13 | Methodology changes across versions | **Kept open** → later **resolved by D-32** | Presentation details → OPEN-37. |
| OPEN-14 | Recommendation verification | **Partly resolved** — user-marked completion never raises the score [APPROVED]; remaining mechanics → **FDD-08** | Phase 4/5. |
| OPEN-15 | Recommendation Manager module | **Removed — resolved by approved boundaries** | AI Analyst generates recommendations; status tracking proposed in Version Management. |
| OPEN-16 | AI scope | **Resolved (v0.3) — D-20** | AI may extract and structure free text, linked to the original input and subject to evidence assessment; never scores. |
| OPEN-17 | Recommendation prioritisation | → **FDD-10** | Phase 4. |
| OPEN-18 | Summary placement | → **FDD-11** | Phase 6. |
| OPEN-19 | Data protection regulations | **Kept open** | Owner/legal decision. Needed by Phase 8. |
| OPEN-20 | External AI provider | **Kept open** | Owner decision on data handling. Needed by Phase 4/8. |
| OPEN-21 | Scale / availability / performance | → **FDD-12** | Phase 8. |
| OPEN-22 | Accessibility target | → **FDD-13** | Phase 7. |
| OPEN-23 | Phase overlaps | **Kept open (non-blocking)** | Owner scheduling choice; gate before Phase 9 is approved. |
| OPEN-24 | Form factor | → **FDD-14** | Phase 7/8. |
| OPEN-25 | Platform business model | → **FDD-15** | Does not affect evaluation. |
| OPEN-26 | Naming / attribution | → **FDD-16** | Phase 6/7. |
| — | *New:* Excel export mapping | **New OPEN-27** | Template has criterion blocks but no score cells; what is written where must be decided without altering structure. Needed by Phase 6. |

### 12.1 Open Decisions Requiring Project Owners

| ID | Decision | Needed by | Blocks Phase 2? |
|---|---|---|---|
| OPEN-05 | Platform/report language(s) and target enterprise stage(s). | Phase 4 | No |
| OPEN-10 | Deletion and retention of projects and assessment versions (consistent with "never overwrite"). | Phase 5 | No |
| OPEN-28 – OPEN-38 | Remaining Phase 3 scoring decisions (scale, conflicts, aggregation, classification, completeness, confidence derivation, Social Coverage, Large Market reference points, methodology-change presentation, evidence guidance wording). Listed in `PROJECT_DECISIONS.md` §3.1 and `PHASE_3_HANDOFF.md` §5. | Phase 3 | No (Phase 2) |
| OPEN-19 | Applicable data protection regulations and data residency. | Phase 8 | No |
| OPEN-20 | May project data be processed by an external AI provider, and under what terms? | Phase 4/8 | No |
| OPEN-23 | Are phase overlaps (e.g., 4 and 5) allowed? | Scheduling | No |
| OPEN-27 | Excel export mapping: which saved results go into the template's existing cells, and whether scores/recommendations appear in the Excel file at all, without changing the template structure. | Phase 6 | No |

### 12.2 Future Design Decisions (deferred, non-blocking)

| ID | Topic | Decide in |
|---|---|---|
| FDD-01 | Additional user types and project sharing | Phase 5/7 |
| FDD-02 | Administrator role and in-platform methodology management | Phase 8 |
| FDD-03 | Authentication method | Phase 8 |
| FDD-04 | Remaining basic project information fields and field formats (target country, target area, and beneficiary model are already decided — FR-01a/b) | Phase 5 |
| FDD-05 | Accepted evidence formats (text, numbers, files, links) and file analysis | Phase 5/8 |
| FDD-06 | Reassessment frequency limits | Phase 5 |
| FDD-07 | Project duplication / scenario modelling | Phase 5 |
| FDD-08 | How a recommendation is shown as reflected in a later assessment | Phase 4/5 |
| FDD-09 | Placement of the Framework & Methodology Registry | Phase 8 |
| FDD-10 | Recommendation prioritisation | Phase 4 |
| FDD-11 | Placement of the overall summary (on-screen, PDF, both) | Phase 6 |
| FDD-12 | Availability, performance, and scale targets | Phase 8 |
| FDD-13 | Accessibility conformance target | Phase 7 |
| FDD-14 | Form factor (web, responsive, native) | Phase 7/8 |
| FDD-15 | Platform business model | Before launch |
| FDD-16 | Product name, branding, attribution of Alan's List of Success | Phase 6/7 |

### 12.3 Owner Materials

| Item | Status |
|---|---|
| Eight criteria | [APPROVED] |
| Evaluation questions for all eight criteria | [APPROVED] — recorded exactly in `EVALUATION_FRAMEWORK.md` (D-19) |
| Large Market evaluation principles | [APPROVED] (§1.5.2) |
| Alan's original Excel template — `Alan's List of Success.xlsx` | **[RECEIVED / AVAILABLE]** |
| Detailed evaluation logic (all criteria) | Drafted — `EVALUATION_FRAMEWORK.md` v1.2, awaiting approval |
| Scoring methodology, weights, thresholds | [TO BE DEFINED — Phase 3] |

### 12.4 Alan's Excel Template — Observed Structure [RECEIVED]

Observed from `Alan's List of Success.xlsx` (recorded so the export can preserve it; nothing here redesigns it):
- One worksheet: **`نموذج الآن للنجاح`**, right-to-left layout.
- Title row (merged A1:M1): "Alan's List of Success  نموذج الآن للنجاح".
- Eight criterion blocks arranged in two rows of four (columns C, F, I, L):
  - Row 3 titles / row 4 descriptions: سوق كبير, هوامش ربح كبيرة, إيرادات متكررة قوية, الأستفادة من قدراتنا.
  - Row 12 titles / row 13 descriptions: قدرات سلسله التوريد, الوصول المباشر الى العميل, البعد الأعلامي و التواصلي, استراتيجية الخروج/ الاستتثمار.
  - Merged empty area under each block (rows 5–10 and 14–20) — the response area of each criterion.
- Cell notes on each description cell contain guidance prompts (for example, the Large Market note refers to the social side — number of beneficiaries — and the business side — number of customers and target market size).
- No score, weight, or formula cells exist in the template.

The cell notes are template guidance. The approved question bank (D-19) is the authoritative source for questions and options.

---

## 13. Change Log

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-11-20 | Initial draft. |
| 0.2 | 2026-11-20 | Revised per owner review: dual objective confirmed as approved (incl. donations/grants rule); criteria and questions marked approved; Large Market principles added; Excel template marked received and its structure recorded; module responsibilities aligned to approved boundaries; reassessment requirements and "user-marked completion does not raise score" marked approved; roadmap aligned to actual status with no-coding gate; 26 decisions reviewed: 8 kept open, 3 removed as approved/resolved, 15 deferred as Future Design Decisions (incl. the unresolved part of OPEN-14); added OPEN-27 (Excel mapping) and FDD-09 (registry placement). |
| 0.4 | 2026-11-20 | Aligned with Phase 3 owner decisions D-22 to D-32: O4/FR-22/FR-45 updated for separate Commercial and Social Overall Scores and Overall Classification; submission rule (D-24) replaces OPEN-09; methodology versioning (D-32) replaces OPEN-13; remaining Phase 3 decisions referenced as OPEN-28 to OPEN-38. No numerical rules added. |
| 0.3 | 2026-11-20 | Aligned with Phase 2 decisions: question bank fixed and recorded (D-19); target geography as project information (D-17, FR-01a); beneficiary model with Not Applicable rule and four approved options (D-18, D-21, FR-01b/c); AI extraction scope (D-20) — OPEN-16 resolved and removed from open decisions; FDD-04 narrowed to remaining fields; phase status updated. No scoring rules added. |

---

## 14. Approval

| Role | Name | Decision (Approve / Approve with changes / Reject) | Date |
|---|---|---|---|
| Project owner | | | |
| Project owner | | | |

None of the open decisions in §12.1 block the approval of Phase 2. Phase 3 will not begin until this document and `EVALUATION_FRAMEWORK.md` are approved.
