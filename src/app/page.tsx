import { OpportunityStatus } from "@prisma/client";
import { OpportunityFeed } from "@/components/OpportunityFeed";
import { Landing } from "@/components/Landing";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/matching";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    const preview = await prisma.opportunity.findMany({
      where: { status: OpportunityStatus.ACTIVE },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { publisher: { select: { name: true } } }
    });

    return (
      <Landing
        preview={preview.map((opportunity) => ({
          id: opportunity.id,
          title: opportunity.title,
          description: opportunity.description,
          workMode: opportunity.workMode,
          location: opportunity.location,
          contractType: opportunity.contractType,
          publisherName: opportunity.publisher.name
        }))}
      />
    );
  }

  const [opportunities, fullUser, implicitProfile] = await Promise.all([
    prisma.opportunity.findMany({
      where: { status: OpportunityStatus.ACTIVE },
      take: 20,
      include: {
        publisher: {
          select: {
            name: true,
            reputationPoints: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { isCurrentlyWorking: true, currentCompany: true }
    }),
    prisma.implicitProfile.findUnique({ where: { userId: user.id } })
  ]);

  const matchInput = {
    isCurrentlyWorking: fullUser?.isCurrentlyWorking,
    currentCompany: fullUser?.currentCompany,
    profile: implicitProfile
      ? {
          interests: implicitProfile.interests,
          skills: implicitProfile.skills,
          preferredWorkMode: implicitProfile.preferredWorkMode,
          location: null
        }
      : null
  };

  const payload = opportunities.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description,
    tags: opportunity.tags,
    workMode: opportunity.workMode,
    location: opportunity.location,
    contractType: opportunity.contractType,
    compensation: opportunity.compensation,
    applicationUrl: opportunity.applicationUrl,
    publisher: opportunity.publisher,
    createdAt: opportunity.createdAt.toISOString(),
    matchScore: calculateMatchScore(opportunity, matchInput)
  }));

  return <OpportunityFeed initialOpportunities={payload} />;
}