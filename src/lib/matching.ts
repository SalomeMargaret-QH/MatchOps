import type { Opportunity, WorkMode } from "@prisma/client";

type ProfileInput = {
  interests: string[];
  skills: string[];
  preferredWorkMode?: WorkMode | null;
};

type MatchableOpportunity = Pick<Opportunity, "tags" | "workMode">;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function calculateMatchScore(
  opportunity: MatchableOpportunity,
  profile?: ProfileInput | null
) {
  if (!profile || (profile.interests.length === 0 && profile.skills.length === 0)) {
    return 55;
  }

  const profileTags = new Set([
    ...profile.interests.map(normalize),
    ...profile.skills.map(normalize)
  ]);
  const opportunityTags = opportunity.tags.map(normalize);
  const tagHits = opportunityTags.filter((tag) => profileTags.has(tag)).length;
  const tagScore = opportunityTags.length
    ? Math.round((tagHits / opportunityTags.length) * 60)
    : 0;
  const workModeScore =
    profile.preferredWorkMode && profile.preferredWorkMode === opportunity.workMode
      ? 25
      : 10;

  return Math.min(100, Math.max(0, tagScore + workModeScore + 15));
}

export function updateProfileSignals(
  current: { interests: string[]; skills: string[] },
  opportunityTags: string[],
  action: "VIEW" | "ACCEPT" | "IGNORE" | "SAVE" | "SHARE"
) {
  if (action === "IGNORE") {
    return current;
  }

  const weight = action === "ACCEPT" || action === "SAVE" ? 2 : 1;
  const merged = [...current.interests];

  for (const tag of opportunityTags) {
    for (let i = 0; i < weight; i += 1) {
      merged.push(tag);
    }
  }

  const ranked = [...new Set(merged)].slice(0, 12);

  return {
    interests: ranked,
    skills: [...new Set([...current.skills, ...opportunityTags])].slice(0, 12)
  };
}
