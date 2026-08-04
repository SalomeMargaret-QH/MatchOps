import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OpportunityDetail } from "@/components/OpportunityDetail";

export default async function OpportunityPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: { publisher: { select: { name: true, reputationPoints: true } } }
  });

  if (!opportunity) {
    notFound();
  }

  return (
    <OpportunityDetail
      opportunity={{
        id: opportunity.id,
        title: opportunity.title,
        description: opportunity.description,
        tags: opportunity.tags,
        workMode: opportunity.workMode,
        location: opportunity.location,
        contractType: opportunity.contractType,
        compensation: opportunity.compensation,
        applicationUrl: opportunity.applicationUrl,
        status: opportunity.status,
        publisher: opportunity.publisher,
        createdAt: opportunity.createdAt.toISOString()
      }}
      isLoggedIn={Boolean(user)}
    />
  );
}
