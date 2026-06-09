import type { Opportunity, WorkMode } from "@prisma/client";

type ProfileInput = {
  interests: string[];
  skills: string[];
  preferredWorkMode?: WorkMode | null;
  location?: string | null;
};

type UserInput = {
  isCurrentlyWorking?: boolean | null;
  currentCompany?: string | null;
  profile?: ProfileInput | null;
};

type MatchableOpportunity = Pick<
  Opportunity,
  "tags" | "workMode" | "location"
> & {
  publisher?: {
    name?: string | null;
    reputationPoints?: number;
  } | null;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

/**
 * Algoritmo Oficial de Matching - MatchOps
 * Implementa la fórmula ponderada:
 * S = 0.4 * H + 0.2 * M + 0.2 * U + 0.2 * C
 */
export function calculateMatchScore(
  opportunity: MatchableOpportunity,
  user?: UserInput | null
) {
  const profile = user?.profile;

  if (
    !profile ||
    (profile.interests.length === 0 && profile.skills.length === 0)
  ) {
    return 50;
  }

  // H = Skills / intereses
  const profileTags = new Set([
    ...profile.interests.map(normalize),
    ...profile.skills.map(normalize)
  ]);

  const opportunityTags = opportunity.tags.map(normalize);

  const tagHits = opportunityTags.filter((tag) =>
    profileTags.has(tag)
  ).length;

  const factorH = opportunityTags.length
    ? (tagHits / opportunityTags.length) * 100
    : 0;

  // M = Modalidad
  const factorM =
    profile.preferredWorkMode &&
    profile.preferredWorkMode === opportunity.workMode
      ? 100
      : 0;

  // U = Ubicación
  const factorU =
    profile.location &&
    opportunity.location &&
    normalize(profile.location) === normalize(opportunity.location)
      ? 100
      : 0;

  // C = Situación laboral
  let factorC = 50;

  if (user?.isCurrentlyWorking) {
    const opportunityCompany = opportunity.publisher?.name;
    const currentCompany = user.currentCompany;

    if (
      opportunityCompany &&
      currentCompany &&
      normalize(opportunityCompany) === normalize(currentCompany)
    ) {
      factorC = 20;
    } else {
      factorC = 90;
    }
  }

  const finalScore =
    0.4 * factorH +
    0.2 * factorM +
    0.2 * factorU +
    0.2 * factorC;

  return Math.min(100, Math.max(0, Math.round(finalScore)));
}

/**
 * Actualiza el perfil implícito usando señales de comportamiento.
 */
export function updateProfileSignals(
  current: { interests: string[]; skills: string[] },
  opportunityTags: string[],
  action: "VIEW" | "ACCEPT" | "IGNORE" | "SAVE" | "SHARE"
) {
  if (action === "IGNORE") {
    return current;
  }

  const weight =
    action === "ACCEPT" || action === "SAVE" ? 2 : 1;

  const merged = [...current.interests];

  for (const tag of opportunityTags) {
    for (let i = 0; i < weight; i += 1) {
      merged.push(tag);
    }
  }

  const ranked = [...new Set(merged)].slice(0, 12);

  return {
    interests: ranked,
    skills: [...new Set([...current.skills, ...opportunityTags])].slice(
      0,
      12
    )
  };
}