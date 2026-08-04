import { describe, expect, it } from "vitest";
import { calculateMatchScore, updateProfileSignals } from "./matching";

// Nota: WorkMode es un enum de Prisma, pero como matching.ts solo lo usa
// como tipo (import type), no hace falta correr `prisma generate` para
// que estos tests compilen: basta con los strings literales.
const REMOTE = "REMOTE" as never;
const ONSITE = "ONSITE" as never;

describe("calculateMatchScore", () => {
  it("devuelve 50 (neutral) si el usuario no tiene perfil implícito", () => {
    const opportunity = {
      tags: ["react", "node"],
      workMode: REMOTE,
      location: "Puno"
    };

    expect(calculateMatchScore(opportunity, null)).toBe(50);
    expect(calculateMatchScore(opportunity, { profile: null })).toBe(50);
  });

  it("devuelve 50 si el perfil existe pero no tiene intereses ni skills", () => {
    const opportunity = {
      tags: ["react"],
      workMode: REMOTE,
      location: null
    };

    expect(
      calculateMatchScore(opportunity, {
        profile: { interests: [], skills: [] }
      })
    ).toBe(50);
  });

  it("da 100 cuando coinciden todos los tags, la modalidad y la ubicación", () => {
    const opportunity = {
      tags: ["react", "node"],
      workMode: REMOTE,
      location: "Puno",
      publisher: { name: "Acme" }
    };

    const score = calculateMatchScore(opportunity, {
      isCurrentlyWorking: false,
      profile: {
        interests: ["react", "node"],
        skills: [],
        preferredWorkMode: REMOTE,
        location: "Puno"
      }
    });

    // H=100 (0.4) + M=100 (0.2) + U=100 (0.2) + C=50 base, no trabaja (0.2*50=10)
    // = 40 + 20 + 20 + 10 = 90
    expect(score).toBe(90);
  });

  it("penaliza (factorC=20) si ya trabaja en la misma empresa que publica", () => {
    const opportunity = {
      tags: [],
      workMode: REMOTE,
      location: null,
      publisher: { name: "Acme Corp" }
    };

    const score = calculateMatchScore(opportunity, {
      isCurrentlyWorking: true,
      currentCompany: "Acme Corp",
      profile: { interests: [], skills: ["react"] }
    });

    // factorH: opportunityTags.length === 0 → 0
    // factorM: no coincide preferredWorkMode (undefined) → 0
    // factorU: no location → 0
    // factorC: misma empresa → 20 → 0.2*20 = 4
    expect(score).toBe(4);
  });

  it("premia (factorC=90) si trabaja pero en una empresa distinta", () => {
    const opportunity = {
      tags: [],
      workMode: REMOTE,
      location: null,
      publisher: { name: "Otra Empresa" }
    };

    const score = calculateMatchScore(opportunity, {
      isCurrentlyWorking: true,
      currentCompany: "Acme Corp",
      profile: { interests: [], skills: ["react"] }
    });

    // factorC = 90 → 0.2 * 90 = 18
    expect(score).toBe(18);
  });

  it("hace match de tags sin distinguir mayúsculas/espacios", () => {
    const opportunity = {
      tags: [" React ", "NODE"],
      workMode: ONSITE,
      location: null
    };

    const score = calculateMatchScore(opportunity, {
      profile: { interests: ["react", "node"], skills: [] }
    });

    // factorH = 100% de coincidencia → 0.4*100 = 40
    // resto en 0 (sin workMode preferido, sin location, factorC base 50*0.2=10)
    expect(score).toBe(50);
  });

  it("nunca devuelve un score fuera del rango [0, 100]", () => {
    const opportunity = {
      tags: ["a", "b", "c"],
      workMode: REMOTE,
      location: "X",
      publisher: { name: "Y" }
    };

    const score = calculateMatchScore(opportunity, {
      isCurrentlyWorking: true,
      currentCompany: "Z",
      profile: {
        interests: ["a", "b", "c"],
        skills: [],
        preferredWorkMode: REMOTE,
        location: "X"
      }
    });

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("updateProfileSignals", () => {
  it("no cambia el perfil cuando la acción es IGNORE", () => {
    const current = { interests: ["react"], skills: ["node"] };
    const result = updateProfileSignals(current, ["python"], "IGNORE");

    expect(result).toEqual(current);
  });

  it("agrega tags nuevos a intereses y skills en VIEW (peso 1)", () => {
    const current = { interests: [], skills: [] };
    const result = updateProfileSignals(current, ["react"], "VIEW");

    expect(result.interests).toContain("react");
    expect(result.skills).toContain("react");
  });

  it("no duplica intereses ya presentes", () => {
    const current = { interests: ["react"], skills: [] };
    const result = updateProfileSignals(current, ["react"], "VIEW");

    expect(result.interests.filter((tag) => tag === "react")).toHaveLength(1);
  });

  it("limita intereses y skills a un máximo de 12 elementos", () => {
    const manyTags = Array.from({ length: 20 }, (_, i) => `tag-${i}`);
    const current = { interests: [], skills: [] };

    const result = updateProfileSignals(current, manyTags, "ACCEPT");

    expect(result.interests.length).toBeLessThanOrEqual(12);
    expect(result.skills.length).toBeLessThanOrEqual(12);
  });
});
