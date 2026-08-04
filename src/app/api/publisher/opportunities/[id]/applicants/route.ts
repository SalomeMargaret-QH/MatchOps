import { NextRequest, NextResponse } from "next/server";
import { InteractionType } from "@prisma/client";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();

  if (!user || !canPublish(user.role)) {
    return NextResponse.json(
      { error: "Necesitas una cuenta de publicador para ver los postulantes." },
      { status: 401 }
    );
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id, publisherId: user.id },
    select: { id: true }
  });

  if (!opportunity) {
    return NextResponse.json(
      { error: "No se encontró la oferta o no tienes acceso a ella." },
      { status: 404 }
    );
  }

  const applications = await prisma.interaction.findMany({
    where: {
      opportunityId: id,
      type: InteractionType.ACCEPT,
      userId: { not: null }
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          reputationPoints: true,
          isCurrentlyWorking: true,
          currentCompany: true,
          currentRole: true,
          description: true
        }
      }
    }
  });

  const seen = new Set<string>();
  const applicants = applications
    .filter((application) => {
      if (!application.user || seen.has(application.user.id)) return false;
      seen.add(application.user.id);
      return true;
    })
    .map((application) => ({
      appliedAt: application.createdAt,
      candidate: application.user
    }));

  return NextResponse.json({ applicants });
}
