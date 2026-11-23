// Methodology M1.0 — SCORING_SPECIFICATION.md v1.0 (approved D-37). Change only through a new version (D-32).
import type { Reading } from "./types";

export interface Methodology {
  version: string;
  /** Large Market calibration, spec §7.2. Index 0..4 = bands B1..B5. */
  lmCommercialIndividuals: readonly Reading[];
  lmCommercialOrganisations: readonly Reading[];
  lmSocial: readonly Reading[];
  /** Spec §3.2: minimum scored criteria. */
  commercialMinimum: number;
  socialMinimumShare: number;
  socialMinimumAbsolute: number;
  /** Spec §3.4. */
  highMean: number;
  lowMean: number;
}

export const M1_0: Methodology = {
  version: "M1.0",
  lmCommercialIndividuals: ["Weak", "Limited", "Limited", "Adequate", "Strong"],
  lmCommercialOrganisations: ["Limited", "Adequate", "Strong", "Strong", "Strong"],
  lmSocial: ["Weak", "Limited", "Limited", "Adequate", "Strong"],
  commercialMinimum: 6,
  socialMinimumShare: 0.75,
  socialMinimumAbsolute: 2,
  highMean: 4.0,
  lowMean: 3.0,
};

export const CURRENT_METHODOLOGY = M1_0;

const REGISTRY: Record<string, Methodology> = { [M1_0.version]: M1_0 };

export function registerMethodology(m: Methodology) {
  REGISTRY[m.version] = m;
}

export function methodologyByVersion(v: string): Methodology {
  const m = REGISTRY[v];
  if (!m) throw new Error(`Unknown methodology version ${v}`);
  return m;
}

/** D-34 */
export const READING_SCORE: Partial<Record<Reading, number>> = {
  Strong: 5,
  Adequate: 4,
  Limited: 3,
  Weak: 2,
  Absent: 1,
};

/** Gatekeeper criteria, spec §3.4. */
export const COMMERCIAL_GATEKEEPERS = ["C2"] as const;
export const SOCIAL_GATEKEEPERS = ["C1", "C7"] as const;

/** Social dimensions that are Not Applicable under the Service users model (framework §4.0.2). */
export const SERVICE_USER_NA = ["C2", "C3", "C4", "C5", "C6", "C8"] as const;
