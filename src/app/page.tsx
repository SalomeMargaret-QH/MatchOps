import { OpportunityStatus } from "@prisma/client";
import { OpportunityFeed } from "@/components/OpportunityFeed";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/matching";

export default async function Home() {
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
