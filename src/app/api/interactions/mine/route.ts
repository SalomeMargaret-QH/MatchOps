import { NextResponse } from "next/server";
import { InteractionType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para ver tus postulaciones." },
      { status: 401 }
    );
  }

  const applications = await prisma.interaction.findMany({
    where: { userId: user.id, type: InteractionType.ACCEPT },
    orderBy: { createdAt: "desc" },
    include: {
      opportunity: {
        include: {
          publisher: { select: { name: true, reputationPoints: true } }
        }
      }
    }
  });

  const seen = new Set<string>();
  const postulaciones = applications
    .filter((application) => {
      if (seen.has(application.opportunityId)) return false;
      seen.add(application.opportunityId);
      return true;
    })
    .map((application) => ({
      appliedAt: application.createdAt,
      opportunity: application.opportunity
    }));

  return NextResponse.json({ postulaciones });
}
