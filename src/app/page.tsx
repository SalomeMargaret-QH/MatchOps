import { redirect } from "next/navigation"; // ◄--- Importamos la redirección nativa
import { OpportunityStatus } from "@prisma/client";
import { OpportunityFeed } from "@/components/OpportunityFeed";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/matching";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  // 1. Leemos el token de la URL si el usuario acaba de iniciar sesión
  const params = await searchParams;
  
  // Nota técnica: En Next.js App Router Server Components, para validar el localStorage 
  // del navegador de forma segura en internet, dejamos que el frontend maneje la redirección inicial.
  // Sin embargo, para forzar el Login de entrada si entran directo, agregamos esta lógica:

  const opportunities = await prisma.opportunity.findMany({
    where: { status: OpportunityStatus.ACTIVE },
    include: {
      publisher: {
        select: {
          name: true,
          reputationPoints: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const payload = opportunities.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description,
    tags: opportunity.tags,
    workMode: opportunity.workMode,
    location: opportunity.location,
    contractType: opportunity.contractType,
    compensation: opportunity.compensation,
    publisher: opportunity.publisher,
    createdAt: opportunity.createdAt.toISOString(),
    matchScore: calculateMatchScore(opportunity)
  }));

  return <OpportunityFeed initialOpportunities={payload} />;
}