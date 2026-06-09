import type { Opportunity, WorkMode } from "@prisma/client";

// Tipado adaptado a la base de datos y esquema de Prisma
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

type MatchableOpportunity = Pick<Opportunity, "tags" | "workMode" | "location"> & {
  publisher?: { companyName?: string } | null;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

/**
 * Algoritmo Oficial de Matching - MatchOps
 * Implementa la fórmula ponderada del artículo científico:
 * S = 0.4 * H + 0.2 * M + 0.2 * U + 0.2 * C
 */
export function calculateMatchScore(
  opportunity: MatchableOpportunity,
  user?: UserInput | null
) {
  const profile = user?.profile;

  // Si no hay perfil o no tiene datos base, asignamos un score neutral inicial
  if (!profile || (profile.interests.length === 0 && profile.skills.length === 0)) {
    return 50;
  }

  // --- 1. FACTOR HILOS / SKILLS (H) - Peso: 40% ---
  const profileTags = new Set([
    ...profile.interests.map(normalize),
    ...profile.skills.map(normalize)
  ]);
  const opportunityTags = opportunity.tags.map(normalize);
  
  const tagHits = opportunityTags.filter((tag) => profileTags.has(tag)).length;
  // Calculamos H sobre base 100
  const factorH = opportunityTags.length ? (tagHits / opportunityTags.length) * 100 : 0;

  // --- 2. FACTOR MODALIDAD (M) - Peso: 20% ---
  const factorM = profile.preferredWorkMode && profile.preferredWorkMode === opportunity.workMode ? 100 : 0;

  // --- 3. FACTOR UBICACIÓN (U) - Peso: 20% ---
  const factorU = profile.location && opportunity.location && normalize(profile.location) === normalize(opportunity.location) ? 100 : 0;

  // --- 4. FACTOR COMPORTAMIENTO / SITUACIÓN LABORAL (C) - Peso: 20% ---
  let factorC = 50; // Base por defecto

  if (user?.isCurrentlyWorking) {
    // Si ya trabaja, ajustamos el factor según conveniencia (ej: evitar su misma empresa)
    const opportunityCompany = opportunity.publisher?.companyName;
    const currentCompany = user.currentCompany;
    
    if (opportunityCompany && currentCompany && normalize(opportunityCompany) === normalize(currentCompany)) {
      factorC = 20; // Penaliza si es la misma empresa actual para fomentar rotación externa
    } else {
      factorC = 90; // Prioriza ofertas que representen un cambio laboral legítimo
    }
  }

  // --- APLICACIÓN ESTRICTA DE LA FÓRMULA DE TU ARTÍCULO ---
  const finalScore = (0.4 * factorH) + (0.2 * factorM) + (0.2 * factorU) + (0.2 * factorC);

  // Garantizar límites entre 0 y 100 y redondear
  return Math.min(100, Math.max(0, Math.round(finalScore)));
}

/**
 * Actualiza el perfil implícito recolectando las señales de comportamiento
 */
export function updateProfileSignals(
  current: { interests: string[]; skills: string[] },
  opportunityTags: string[],
  action: "VIEW" | "ACCEPT" | "IGNORE" | "SAVE" | "SHARE"
) {
  // Si ignora la tarjeta, el perfil no absorbe intereses de esta oferta
  if (action === "IGNORE") {
    return current;
  }

  // Multiplicador de peso de acuerdo a la acción (Accept/Save valen doble)
  const weight = action === "ACCEPT" || action === "SAVE" ? 2 : 1;
  const merged = [...current.interests];

  for (const tag of opportunityTags) {
    for (let i = 0; i < weight; i += 1) {
      merged.push(tag);
    }
  }

  // Mantenemos el límite máximo de 12 tags históricos según tu arquitectura original
  const ranked = [...new Set(merged)].slice(0, 12);

  return {
    interests: ranked,
    skills: [...new Set([...current.skills, ...opportunityTags])].slice(0, 12)
  };
}