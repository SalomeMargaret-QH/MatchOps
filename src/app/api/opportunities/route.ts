import { NextRequest, NextResponse } from "next/server";
import { OpportunityStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/matching";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const cursor = request.nextUrl.searchParams.get("cursor");
  const workMode = request.nextUrl.searchParams.get("workMode");
  const location = request.nextUrl.searchParams.get("location");
  const contractType = request.nextUrl.searchParams.get("contractType");

  const currentUser = await getCurrentUser();

  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: OpportunityStatus.ACTIVE,
      ...(workMode ? { workMode: workMode as never } : {}),
      ...(location ? { location } : {}),
      ...(contractType ? { contractType } : {})
    },
    include: {
      publisher: {
        select: {
          name: true,
          reputationPoints: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });

  const hasMore = opportunities.length > PAGE_SIZE;
  const page = hasMore ? opportunities.slice(0, PAGE_SIZE) : opportunities;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  let matchInput: {
    isCurrentlyWorking?: boolean | null;
    currentCompany?: string | null;
    profile?: {
      interests: string[];
      skills: string[];
      preferredWorkMode: import("@prisma/client").WorkMode | null;
      location: string | null;
    } | null;
  } | null = null;

  if (currentUser) {
    const [fullUser, implicitProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { isCurrentlyWorking: true, currentCompany: true }
      }),
      prisma.implicitProfile.findUnique({ where: { userId: currentUser.id } })
    ]);

    matchInput = {
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
  } else if (token) {
    const session = await prisma.anonymousSession.findUnique({
      where: { token },
      include: { implicitProfile: true }
    });

    matchInput = session?.implicitProfile
      ? {
          profile: {
            interests: session.implicitProfile.interests,
            skills: session.implicitProfile.skills,
            preferredWorkMode: session.implicitProfile.preferredWorkMode,
            location: null
          }
        }
      : null;
  }

const payload = page
  .map((opportunity) => ({
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
    createdAt: opportunity.createdAt,
    matchScore: calculateMatchScore(opportunity, matchInput)
  }))
  .sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json({ opportunities: payload, nextCursor });
}
