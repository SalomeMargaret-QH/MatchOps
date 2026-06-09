import { NextRequest, NextResponse } from "next/server";
import { OpportunityStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/matching";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  const session = token
    ? await prisma.anonymousSession.findUnique({
        where: { token },
        include: { implicitProfile: true }
      })
    : null;

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

  const profile = session?.implicitProfile
  ? {
      profile: {
        interests: session.implicitProfile.interests,
        skills: session.implicitProfile.skills,
        preferredWorkMode: session.implicitProfile.preferredWorkMode,
        location: null
      }
    }
  : null;

const payload = opportunities
  .map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description,
    tags: opportunity.tags,
    workMode: opportunity.workMode,
    location: opportunity.location,
    contractType: opportunity.contractType,
    compensation: opportunity.compensation,
    publisher: opportunity.publisher,
    createdAt: opportunity.createdAt,
    matchScore: calculateMatchScore(opportunity, profile)
  }))
  .sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json({ opportunities: payload });
}
