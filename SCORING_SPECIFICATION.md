# Scoring Specification
## Social Enterprise Evaluation Platform — Phase 3

| Field | Value |
|---|---|
| Document status | **APPROVED v1.0 — methodology M1.0 (D-37, 2026-11-20). Items marked RECOMMENDED or OWNER INPUT below were adopted as recommended.** |
| Phase | 3 of 10 — Scoring Engine Design |
| Date | 2026-11-20 |
| Methodology version this would become | M1.0 (on approval) |
| Builds on | `EVALUATION_FRAMEWORK.md` v1.3 (approved, D-33); decisions D-22 to D-36 in `PROJECT_DECISIONS.md` |
| Application code | None |

**Status tags:** **[APPROVED D-xx]** binding owner decision · **[RECOMMENDED — PENDING]** this document's recommendation, not approved · **[OWNER INPUT]** a value judgement only the owners can make · **[NEEDS EVIDENCE]** cannot be set responsibly without data that does not yet exist.

**Published benchmark vs internal rule.** Every number in this document is either (a) from an approved owner decision or (b) an **internal rule** proposed here and labelled as such. None of them is a market benchmark or an external standard. External sources are cited only for methods (Section 12).

---

## 1. Methodology at a Glance

```
 32 answers + evidence + project context (country, area, beneficiary model)
        │
        ▼  EVALUATION_FRAMEWORK.md (approved): answer codes → dimension readings
 Per criterion: Commercial reading | Social reading (or N/A)
        │
        ▼  §2  readings → scores 1–5 or Not Scored                        [APPROVED D-34..D-36]
 Per criterion: Commercial score | Social score | Evidence Confidence (§5) | Completeness (§4)
        │
        ▼  §3  Commercial Overall Score, Social Overall Score              [RECOMMENDED]
        │       mean of scored criteria + minimum coverage + "criteria met"
        ▼  §3.4 Dimension level: High / Moderate / Low / Not classifiable   [RECOMMENDED]
        │       gatekeeper criteria + weakest-criterion guard
        ▼  §3.5 Overall Classification (6 categories) + mandatory qualifiers [RECOMMENDED]
```

Performance, Evidence Confidence, Completeness, and Coverage are four separate outputs. None of them changes another.

---

## 2. Criterion-Level Scores

### 2.1 Reading → Score [APPROVED D-34, D-35, D-36]

| Dimension reading (framework §4.2) | Score |
|---|---|
| Strong | 5 |
| Adequate | 4 |
| Limited | 3 |
| Weak | 2 |
| Absent — absence sufficiently established | 1 |
| Undetermined (Unknown) | Not Scored |
| Not yet determined | Not Scored |
| Conflicting — unresolved | Not Scored (until clarification or evidence resolves it) |
| Not Applicable (social only) | Excluded; reason displayed |

Each criterion therefore shows: **Commercial score · Social score** side by side [APPROVED D-22].

### 2.2 When Is Absence "Sufficiently Established"? [RECOMMENDED — PENDING]

Absent = 1 when the **anchor** question of the dimension carries a stated-absence answer (code X) and **no** answer or evidence in the same dimension contradicts it. The founder's own explicit statement that a mechanism does not exist is sufficient: unlike "unknown", it is a positive statement about the current state.
- *Why:* uses an answer the founder chose deliberately; deterministic.
- *Risk:* a founder unaware of an existing channel would be scored Absent. Mitigation: the recommendation explains how to provide evidence and reassess.
- *Alternative rejected:* requiring documentary proof of absence — absence is rarely documentable, so almost no dimension could ever score 1, which would make the scale dishonest.

### 2.3 Clarifications Needed for Deterministic Scoring [RECOMMENDED — PENDING]

The approved framework uses two kinds of inconsistency. To score deterministically:
1. **"Conflicting"** (framework lists it explicitly) → dimension **Not Scored** [APPROVED D-35].
2. **"Conflicting-light" / "flag" cases** (framework says "flag", "Adequate at most") → **scored**, using the cap the framework states, with an inconsistency flag. They are not Not Scored.

### 2.4 Adverse-Anchor Rule — **[OWNER INPUT] OPEN-39**

**Problem found in testing.** Framework §7.4 says "cost higher than price → **Weak regardless** of Q2; if Q2 claims coverage/growth, flag **Conflicting**". Under D-35, "Conflicting" means Not Scored. A founder who reports a negative margin **and** claims growth would then escape a Weak score — contradicting oneself would be rewarded. The same pattern can occur wherever the anchor answer is adverse and the qualifier is favourable.

**Recommendation:** when a contradiction is between an **adverse anchor answer (W or X)** and a **favourable qualifier**, the dimension is **scored on the anchor** and flagged; it is not Not Scored. Contradictions involving a favourable anchor stay Not Scored (D-35).
- *Why best for users:* the founder's own adverse statement is not erased; the result cannot become more positive by adding a contradictory answer.
- *Risk:* if the adverse anchor answer was a mistake, the score is lower until corrected — reversible on reassessment.
- *Alternative:* keep strict Not Scored. Acceptable only together with the gatekeeper rule (§3.4), which then blocks classification (Test TC3-b) — safe, but less informative.
- Needs owner confirmation because it refines the application of D-35.

### 2.5 C2/C3 Overlap Rule — ISSUE-11 [RECOMMENDED — PENDING]

**Recommendation:** C2 (High Gross Margins) social scores **adequacy** of beneficiary income; C3 (Recurring Revenue) social scores **regularity/continuity**. Applied concretely:
- C2 Q3 option "دخل متقطع حسب توفر الطلبات" describes regularity, not amount. When it is selected, the C2 social reading is taken from **C2 Q4 alone** (return vs time and effort). Its irregularity is scored only in C3.
- C2 Q3 "دخل متكرر لكنه محدود" keeps its code L in C2 — "limited" describes amount.
- Cross-criterion inconsistencies (e.g., C2 Q3 "regular" vs C3 Q4 "order-dependent") are flagged once, never scored twice.

- *Why:* the same fact (irregular income) would otherwise lower two criteria — a double penalty the framework prohibits (§14).
- *Risk:* C2 Q4 must carry the adequacy judgement alone in that case. It asks exactly that question, so the information is available.
- *Alternative rejected:* scoring both — double counting; dropping C2 Q3 entirely — discards valid adequacy information in its other options.

---

## 3. Overall Scores and Classification — OPEN-31, OPEN-32

### 3.1 Aggregation Method [RECOMMENDED — PENDING]

**Commercial Overall Score** = arithmetic mean of the **scored** commercial criterion scores, displayed to one decimal.
**Social Overall Score** = arithmetic mean of the **scored, applicable** social criterion scores, displayed to one decimal.

Rounding: half up to one decimal for display (e.g., 3.875 → 3.9). Levels (§3.4) use the unrounded mean.

Displayed with each overall score:
- **Criteria met:** number of scored criteria at 4 or 5 (e.g., "Commercial: 5 of 8 criteria met"). This preserves the "list" nature of Alan's List of Success.
- **Distribution:** count of 5s, 4s, 3s, 2s, 1s, Not Scored, N/A.
- **Coverage** (§3.2, §6).

Not Scored and N/A criteria are **excluded** from the mean — never counted as zero or as any value [APPROVED D-23, D-25].

### 3.2 Minimum Coverage for an Overall Score [RECOMMENDED — PENDING; internal rule]

An overall score is shown only when enough criteria are scored:
- **Commercial:** at least **6 of 8** commercial criteria scored.
- **Social:** at least **75% of applicable** social criteria scored, rounded up, and never fewer than 2. Workers/Both/Not-yet-determined models (8 applicable) → 6; service-user model (2 applicable: C1, C7) → both.

Below the minimum the overall score is **"Not Scored — insufficient information"**. Criterion scores remain visible.
- *Why:* without a minimum, three positive answers out of eight would produce a confident-looking average (TC4 shows a mean of 4.3 becoming "High" without this rule).
- *Limitation:* 75% is an internal rule, not an external standard. It means at most two of eight criteria can be missing. It should be reviewed with real assessment data (**[NEEDS EVIDENCE]** for any recalibration).

### 3.3 Weights [RECOMMENDED — PENDING: equal weights in M1.0]

All criteria count equally **within** each dimension. This is a deliberate choice, not a default:
- Alan's List presents the eight criteria as peers; the template gives no weights.
- No published, traceable evidence was found that would justify specific weights for social enterprises in this context. Invented weights would add false precision.
- **The criteria that matter most are protected by gatekeeper rules instead of weights (§3.4).** This is more transparent than weights: a weight hides importance inside an average; a gatekeeper states it.
- Weights can be introduced later as a new methodology version (D-32) once assessment data and owner judgement support them — **[NEEDS EVIDENCE]**.

Alternatives considered:

| Alternative | Why less suitable |
|---|---|
| Weighted mean with expert weights | No traceable basis today; weights would look precise but be arbitrary; still compensatory inside the dimension. |
| Minimum (weakest criterion) as the overall score | Too harsh and uninformative: one Limited criterion would define the whole dimension; hides progress elsewhere. |
| Median | Robust, but insensitive to improvement in one criterion — founders would see no movement after real progress. |
| Geometric mean | Less compensatory than the arithmetic mean, but harder to explain; the gatekeeper and weakest-criterion guards achieve the protective effect transparently. |
| Count of criteria met only | Faithful to a "list", but discards the difference between 3 and 2, or 5 and 4. Kept as a companion display instead. |

Known limitation: the 1–5 scale is ordinal; an arithmetic mean treats it as evenly spaced. Mitigated by showing the distribution and criteria met, and by basing classification on guards as well as the mean.

### 3.4 Dimension Level for Classification [RECOMMENDED — PENDING]

Each dimension is given a level, separately:

| Level | Rule (applied in this order) |
|---|---|
| **Not classifiable** | Overall score not shown (coverage minimum not met), **or** a gatekeeper criterion is Not Scored. |
| **Low** | Mean < 3.0, **or** any gatekeeper criterion scored 1 or 2. |
| **High** | Mean ≥ 4.0 **and** no scored criterion at 1 or 2 **and** (commercial only) no Grant-dependent flag. |
| **Moderate** | All other cases. |

**Gatekeeper criteria** (directly test the two mandatory objectives, D-01):
- **Commercial:** C2 High Gross Margins — the only criterion that directly tests profitability.
- **Social:** C1 Large Market (social — a real need) and C7 PR & Communications (social — measurable, demonstrable impact). Both are always applicable, whatever the beneficiary model.

Why these cut-offs: 4.0 corresponds to "Adequate" and 3.0 to "Limited" on the approved scale, so a dimension is High only if it is on average at least adequate with no weak criterion. The cut-offs follow the meaning of the approved scale; they are not external benchmarks.

- *Why best for users:* a project cannot be told it is commercially strong while losing money per sale, or socially strong while its need is unproven.
- *Risk:* a gatekeeper Not Scored blocks classification even when everything else is known. This is intentional — the message to the user is precise ("profitability not yet established").
- *Alternative rejected:* using the mean only — allowed a negative-margin project to be "Moderate"/"Developing" (TC3).

### 3.5 Overall Classification [RECOMMENDED — PENDING]

| Classification | Commercial level | Social level |
|---|---|---|
| **Balanced — Strong** | High | High |
| **Balanced — Developing** | High or Moderate | High or Moderate (not both High) |
| **Social Gap** | High or Moderate | Low |
| **Commercial Gap** | Low | High or Moderate |
| **Weak on Both** | Low | Low |
| **Not Classified — critical information missing** | Not classifiable (either dimension) | |

No category lets one dimension offset the other [APPROVED D-22, D-31]. A gap category always names the weaker dimension.

**Mandatory qualifiers** (shown with the classification, never hidden):
- Evidence Confidence (overall level, §5).
- "Based mainly on founder statements" when overall confidence is Low or Statement only — see OPEN-41.
- Limited social coverage (service-user model), Grant-dependent, Social impact not demonstrated, Model conflict.
- Number of unresolved conflicts and Not Scored criteria.
- Methodology version.

**[OWNER INPUT] OPEN-41.** D-26 says confidence must not raise or lower scores. Recommendation: confidence therefore does **not** change the classification category; it appears as a mandatory qualifier. Owners should confirm they accept "Balanced — Strong · based mainly on founder statements" (TC11) rather than a separate category such as "Strong — unverified".

Alternatives considered for classification: a 3×3 matrix with nine named cells (too many labels for founders to understand); a single combined label from the two means (would reintroduce compensation).

---

## 4. Information Completeness — OPEN-33 [RECOMMENDED — PENDING]

**Definition:** among **applicable** questions (N/A dimensions excluded), the share answered with **known** information — i.e., not "لسه مش عارفين" (U) and not "not yet determined" (ND). Stated absence (X) counts as known.

**Displayed:**
- Per criterion: "Commercial 2 of 2 known · Social 1 of 2 known".
- Per dimension and overall: "Commercial 14 of 16 known (88%) · Social 10 of 16 known (63%)".
- Large Market evidence basis: "Basis stated / not stated" (the follow-up question is shown separately, not counted in the core total).
- Project context: country, area, beneficiary model ("Not yet determined" counts as incomplete) — e.g., "2 of 3".

Completeness is **informational**: it does not change scores (D-23); scores are controlled by Not Scored and coverage.
- *Why:* tells founders exactly which answers to complete; distinguishes "I don't know" from "this is weak".
- *Limitation:* question-level, not weighted by importance; a missing gatekeeper answer is visible through Not Scored and classification rules instead.
- *Alternative rejected:* a completeness grade (A/B/C) — needs arbitrary cut-offs and adds nothing to the plain fraction.

---

## 5. Evidence Confidence — OPEN-34 [RECOMMENDED — PENDING]

Order of levels: **High > Moderate > Low > Statement only** (framework §4.3.2). "Not assessable" (Not Scored dimension) and "Not applicable" are excluded from roll-ups.

### 5.1 Dimension Confidence
Determined by the Evidence Evaluator from the evidence classes supporting the dimension's anchor claims (framework §4.3.2). For Large Market, the approved follow-up maps directly: impression → Statement only; personal observations → Low; published data → Moderate (High if the source is attached and matches the target area); interviews/surveys → Moderate (High if method and sample documented); actual sales → commercial High for existence of demand, Moderate for size. Each evidence classification is stored so the roll-up is reproducible.

### 5.2 Criterion Confidence [D-26 requires per criterion]
= the **lower** of its scored dimensions' confidence levels. If only one dimension is scored, that dimension's level, with a note.
- *Why:* a criterion conclusion pairs both dimensions; it is only as well supported as its weaker half. Mirrors the GRADE approach, where overall certainty follows the lowest-rated critical outcome (Section 12).

### 5.3 Overall Confidence [D-26 requires overall]
= the **lower median** of all scored dimension confidence levels (commercial and social pooled), **capped** at the lowest confidence among the gatekeeper dimensions (C2 commercial, C1 social, C7 social). Shown with its distribution (e.g., "High 3 · Moderate 5 · Low 4 · Statement only 2"). Commercial and Social overall confidence are also shown on drill-down, computed the same way.
- *Why median:* one unsupported minor claim should not label the whole project "Statement only"; the cap makes sure the claims that matter most — profitability, need, measurable impact — are never overstated (GRADE principle).
- *Alternative rejected:* minimum of all (one weak item dominates everything); average of levels (treats labels as numbers; false precision).
- Confidence never changes a score or category [APPROVED D-26].

---

## 6. Coverage — OPEN-35 [RECOMMENDED — PENDING]

**Social Coverage** has two parts, displayed beside the Social Score [APPROVED D-25]:
1. **Applicability:** applicable social dimensions out of 8, with N/A reasons (e.g., "2 of 8 applicable — 6 N/A: service-user model").
2. **Scored:** scored out of applicable, with Not Scored reasons (e.g., "6 of 7 scored — 1 Not Scored: Unknown").

Example display: *"Social Score 3.8 · Social Coverage: 6 of 7 applicable scored (1 N/A: model conflict resolved as N/A; 1 Not Scored: unresolved conflict)."*

The same format is shown for **Commercial Coverage** ("7 of 8 scored") for symmetry; commercial applicability is always 8 of 8.

The **Limited social coverage** flag is raised whenever applicability is below 8 of 8. The service-user benefit gap (framework ISSUE-16) is shown as a note.

- *Why:* separates "doesn't apply" from "we don't know"; prevents a 2-criterion social score from looking like a full assessment.
- *Alternative rejected:* a single percentage — would hide whether a low figure comes from the model (N/A) or from missing information.

---

## 7. Large Market Calibration — OPEN-36

### 7.1 Finding
No reputable published benchmark was found that defines a "large market" or "large affected population" by a count of customers or people for a given area. Market-sizing methods exist, but they describe how to estimate size, not what size counts as large. Any count-based threshold would therefore be an internal rule. Population statistics for target areas **are** published by national statistical offices (e.g., CAPMAS in Egypt, which publishes population by governorate) and can be used as evidence for plausibility and prevalence.

### 7.2 Recommended Approach [RECOMMENDED — PENDING; internal rule]
Map the **approved size bands** (which cannot change) to readings with a small, transparent table that depends on **payer type** (D-30: commercial size is about paying customers or organisations), not on numeric geography thresholds.

| Band (approved options) | Commercial — individual payers, "more than one" group, or payer unknown | Commercial — companies, NGOs, or government | Social — people affected (Q4) |
|---|---|---|---|
| B1 (< 100) | Weak (2) | Limited (3) | Weak (2) |
| B2 (100–500) | Limited (3) | Adequate (4) | Limited (3) |
| B3 (501–2,000) | Limited (3) | Strong (5) | Limited (3) |
| B4 (2,001–10,000) | Adequate (4) | Strong (5) | Adequate (4) |
| B5 (> 10,000) | Strong (5) | Strong (5) | Strong (5) |
| Unknown | Not Scored | Not Scored | Not Scored |

Size bands never produce Absent (1): no band means "no market".

Geographic scope (D-17, D-30) is used, without numeric adjustment, to:
1. **Interpret** the bands for the stated target area (shown in the result).
2. **Check plausibility:** when the area's population is provided as evidence, a count larger than that population raises Contradictory evidence → Conflicting → Not Scored until resolved.
3. **Describe need** (D-28): prevalence (affected share of the area's population) and severity are displayed as a **need profile** when evidence supports them, or flagged as evidence gaps.
4. **Tailor recommendations** (e.g., widen scope or payer groups where consistent with the mission).

The "more than one" payer group is read with the individual-payer column, because the primary payer is not identified — the conservative choice. Commercial size uses paying customers only; beneficiary numbers never count as market size [APPROVED D-30].

- *Why best for users:* simple, explainable, and fair to organisation-facing enterprises with few but high-value customers; no fake precision about what "large" means in each governorate.
- *Limitations:* the column boundaries are judgement, not data; it does not distinguish a village from a whole country numerically. Recorded as **[NEEDS EVIDENCE]**: recalibrate in a later methodology version (D-32) using data from real assessments and official population statistics.
- *Alternatives rejected:* (a) numeric thresholds by geography level — requires benchmarks that do not exist; (b) share-of-population thresholds for commercial size — meaningless for organisational buyers; (c) one column for all payer types — penalises organisation-facing models.

### 7.3 Prevalence and Severity — **[OWNER INPUT] OPEN-40**
Should documented high prevalence or severity raise the Large Market **social** reading (for example, a small village where most residents are affected)? Recommendation for M1.0: **no score adjustment**; display the need profile next to the score. Adjusting would require a threshold for "high prevalence" that has no traceable basis yet. This is a value judgement about fairness to small local projects, so it needs owners.

---

## 8. Methodology Versioning in Comparisons — OPEN-37 [RECOMMENDED — PENDING; not blocking]
- Every version stores its methodology version (D-32). Default display: each version under its own methodology.
- When two compared versions use different methodologies, the comparison lists **criterion-level changes with their cause**: "methodology change" (detected by re-scoring the earlier version's stored inputs under the newer methodology, for comparison only, never saved over the original) or "project change" (new answers or evidence).
- Changes are explained at criterion level rather than as decimal splits of the overall mean, to avoid rounding artefacts.
- Owners/administrators publish a new methodology; the founder chooses whether to reassess under it.

---

## 9. Test Cases and Expected Results

All results computed with the rules above. Means shown unrounded where useful, then to one decimal. "Gk" = gatekeeper.

| # | Scenario | Key inputs | Commercial | Social | Classification + qualifiers | Misleading positive avoided? |
|---|---|---|---|---|---|---|
| TC1 | Strong commercial / weak social (workers model) | Com: 5,5,4,4,4,5,4,4 · Soc: 3,2,2,3,2,2,3,2 | 35/8 = 4.4, 8/8 met, Gk C2=5 → **High** | 19/8 = 2.4, 0 met → **Low** | **Social Gap** | Yes — strong commercial does not lift social |
| TC2 | Weak commercial / strong social | Com: 3,2,3,4,3,2,4,2 · Soc: 5,4,5,4,4,5,5,4 | 23/8 = 2.9, Gk C2=2 → **Low** | 36/8 = 4.5, Gk 5/5 → **High** | **Commercial Gap** | Yes |
| TC3 | Grant-dependent: cost > price, claims growth; P&L includes grant | C2 Com: anchor W + favourable Q2 → adverse-anchor rule (OPEN-39) → 2. Com: 4,2,4,4,4,4,5,4 · Soc all 4 | 31/8 = 3.9, Gk C2=2 → **Low** · Grant-dependent | 4.0 → **High** | **Commercial Gap** · Grant-dependent | Yes — mean alone (3.9) would have read "Developing" |
| TC3-b | Same, if OPEN-39 is rejected | C2 Com = Conflicting → Not Scored | Gk Not Scored → **Not classifiable** | High | **Not Classified — critical information missing** | Yes |
| TC4 | Mostly unknown | Com scored: C1 4, C4 4, C7 5 (5 Not Scored) · Soc scored: C1 4, C7 4 (6 Not Scored) | 3 of 8 < 6 → **Not Scored** (the mean of 4.3 is not shown) | 2 of 8 < 6 → **Not Scored** | **Not Classified** · Completeness e.g. Com 7/16, Soc 5/16 known | Yes — without the minimum this would read "High" |
| TC5 | Service-user model, positive | Com: 4,4,4,5,4,4,4,4 · Soc: C1 5, C7 4; 6 N/A | 33/8 = 4.1, no ≤2 → **High** | 2 of 2 scored, 4.5 → **High** | **Balanced — Strong** · Limited social coverage (2 of 8 applicable; 6 N/A service-user) · service-benefit gap note | Coverage disclosed; N/A not counted as zero or positive |
| TC5-b | Service-user, C7 social Unknown | Soc: C1 5, C7 Not Scored | High | 1 of 2 < 2 → **Not Scored** (also Gk missing) | **Not Classified** | Yes |
| TC6 | Unresolved conflicts on non-gatekeepers | C6 Com Conflicting; C4 Soc Conflicting. Com: 4,4,3,4,4,–,3,3 · Soc: 4,3,3,–,4,3,4,3 | 25/7 = 3.6, 7/8 → **Moderate** | 24/7 = 3.4, 7/8 → **Moderate** | **Balanced — Developing** · 2 unresolved conflicts | Conflicts excluded, not guessed |
| TC6-b | Conflict on gatekeeper | C2 Com: Q1 U, Q2 "covers expenses and growth" → Conflicting (favourable qualifier, unknown anchor) | Gk Not Scored → **Not classifiable** | — | **Not Classified — profitability not established** | Yes |
| TC7 | Model conflict | Service-user recorded; C2 Q3 "دخل بسيط مقابل مجهود كبير", Q4 "عائد محدود" → C2 social Applicable, Weak 2. Soc: C1 4, C2 2, C7 4 | (as TC5) High | 3 of 3 scored, 3.3, a 2 present → **Moderate** | **Balanced — Developing** · Model conflict | Yes — negative beneficiary income stays visible |
| TC8 | "Not yet determined" beneficiary model | All 8 social dimensions applicable; Soc: C2 X/X → Absent 1 (no income mechanism stated); others 4 | — | 29/8 = 3.6, a 1 present → **Moderate** | Depends on commercial; project context completeness 2 of 3 | Yes — undefined model never produces N/A |
| TC9 | Large Market, local scope (one district) | Payer individuals, Q2 B2 → Limited 3; Q3 women, Q4 B3 → Limited 3; basis = interviews (Moderate); district population attached (plausible) | C1 Com **3** | C1 Soc **3** · need profile: prevalence documented | Recommendation: add payer groups or widen scope where consistent with mission | Size not inflated; local need visible in profile (OPEN-40) |
| TC9-b | Same area, organisation payers | Payer companies, Q2 B1 → Limited 3 | C1 Com **3** | — | — | Organisation model not penalised as "tiny" |
| TC9-c | Implausible count | Q4 B5 (> 10,000) but attached district population ≈ 6,000 | — | Contradictory evidence → **Not Scored** (Gk) | Social **Not classifiable** → **Not Classified** | Yes |
| TC10 | Reassessment under newer methodology | V1 (M1.0): Com 4,4,3,4,4,3,3,4 = 3.6. M1.1 changes organisation calibration so C1 Com 4→5. V2 (M1.1), no input change: 3.8. V3 (M1.1), new evidence C3 3→4: 3.9 | V1 kept under M1.0. V1→V2: "C1 Commercial 4→5: methodology change". V2→V3: "C3 Commercial 3→4: new evidence". V1→V3 lists both, each with its cause | — | Methodology version shown on each | Yes — methodology change never shown as progress |
| TC11 | All positive, no evidence | All criteria 4–5; Evidence: none attached; LM basis "impression" | e.g. 4.5 → High | e.g. 4.4 → High | **Balanced — Strong** · Evidence Confidence: **Statement only** · "Based mainly on founder statements" | Disclosed, category unchanged per D-26 — see OPEN-41 |
| TC12 | Early idea with stated absences | Com: 4,3,3,3,3,1,3,1 (no channel; no adopters) · Soc mean 3.5 | 21/8 = 2.6 → **Low** | **Moderate** | **Commercial Gap** | Absent scored 1, not hidden |

**Checks passed:** no test produces a Balanced or Strong label when a gatekeeper is unknown, conflicting, or weak, or when coverage is below the minimum (TC3, TC3-b, TC4, TC5-b, TC6-b, TC9-c). The one residual positive-label risk — positive classification resting only on founder statements (TC11) — is disclosed and placed with the owners as OPEN-41.

---

## 10. Decision Register for This Specification

| ID | Topic | Status | Section |
|---|---|---|---|
| D-34 | 1–5 scale | **Approved** | §2.1 |
| D-35 | Unresolved conflict → Not Scored | **Approved** | §2.1 |
| D-36 | Absent = 1; Unknown/ND/Conflicting = Not Scored; N/A excluded | **Approved** | §2.1 |
| OPEN-31 | Aggregation, weights, minimum coverage | Recommended — pending | §3.1–3.3 |
| OPEN-32 | Dimension levels, gatekeepers, classification | Recommended — pending | §3.4–3.5 |
| OPEN-33 | Completeness | Recommended — pending | §4 |
| OPEN-34 | Evidence Confidence roll-up | Recommended — pending | §5 |
| OPEN-35 | Coverage | Recommended — pending | §6 |
| OPEN-36 | Large Market calibration | Recommended — pending | §7 |
| ISSUE-11 | C2/C3 overlap | Recommended — pending | §2.5 |
| OPEN-37 | Methodology comparisons | Recommended — pending (not blocking) | §8 |
| — | "Absence sufficiently established"; conflicting vs flagged cases | Recommended — pending | §2.2, §2.3 |
| OPEN-39 | Adverse-anchor rule | **Owner input** | §2.4 |
| OPEN-40 | Prevalence/severity adjustment | **Owner input** | §7.3 |
| OPEN-41 | Positive classification on statements only | **Owner input** | §3.5 |
| — | Criterion weights; Large Market recalibration; coverage minimum review | **Needs evidence** (later methodology version) | §3.2, §3.3, §7.2 |

---

## 11. Outputs per Assessment Version (for Phase 4–6)

Per criterion: Commercial score, Social score (or N/A), reasons for Not Scored/N/A, criterion confidence, dimension confidences, completeness, flags.
Overall: Commercial and Social Overall Scores (or Not Scored), criteria met, distributions, Commercial and Social Coverage, dimension levels, Overall Classification with qualifiers, overall Evidence Confidence with distribution, completeness, project context completeness, methodology version.

---

## 12. External References (methods only — no benchmarks taken from them)

| Source | Used for |
|---|---|
| GRADE approach — overall certainty is based on the lowest-rated critical outcome. CDC ACIP GRADE Handbook, Ch. 10: https://www.cdc.gov/acip-grade-handbook/hcp/chapter-10-overall-certainty-of-evidence/index.html ; Cochrane Handbook Ch. 14: https://www.cochrane.org/zh-hant/authors/handbooks-and-manuals/handbook/current/chapter-14 | Weakest-link criterion confidence and gatekeeper cap on overall confidence (§5). Four-level certainty scale as a precedent for ordinal confidence levels. |
| OECD/JRC, *Handbook on Constructing Composite Indicators: Methodology and User Guide* (2008), Step 6 "Weighting and aggregation": https://www.oecd.org/en/publications/handbook-on-constructing-composite-indicators-methodology-and-user-guide_9789264043466-en.html | Framing of weighting and aggregation as explicit methodological choices, and the trade-off (compensability) inherent in additive aggregation (§3.3). |
| Nesta, *Standards of Evidence for Impact Investing* (Puttick & Ludlow, 2012): https://www.nesta.org.uk/report/standards-of-evidence-for-impact-investing/ | Precedent for stage-appropriate evidence levels (early ventures expected at lower levels) — supports disclosing rather than penalising low confidence (§3.5, OPEN-41). |
| Impact Frontiers (formerly Impact Management Project), five dimensions of impact — "How Much" covers scale, depth, duration: https://impactfrontiers.org/norms/abc-of-enterprise-impact/abc-of-enterprise-impact-comparing-and-communicating-impact-performance/ | Keeping reach (absolute affected population) separate from depth/severity — supports the need profile and OPEN-40 (§7.3). |
| CAPMAS (Egypt), population estimates by governorate: https://www.capmas.gov.eg/Admin/Pages%20Files/20245121324361-%20pop_new.pdf | Example of an official source founders can attach for plausibility and prevalence checks (§7.2). Not used to set thresholds. |

No market sizes, industry averages, or thresholds were taken from these sources.
