import { NextRequest, NextResponse } from "next/server";
import { InteractionType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { updateProfileSignals } from "@/lib/matching";

const schema = z.object({
  token: z.string().min(1),
  opportunityId: z.string().min(1),
  type: z.nativeEnum(InteractionType),
  dwellTimeSeconds: z.number().int().nonnegative().optional()
});

export async function POST(request: NextRequest) {
  const body = schema.parse(await request.json());

  const session = await prisma.anonymousSession.findUnique({
    where: { token: body.token },
    include: { implicitProfile: true }
  });

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: body.opportunityId }
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Oportunidad no encontrada" }, { status: 404 });
  }

  await prisma.interaction.create({
    data: {
      type: body.type,
      dwellTimeSeconds: body.dwellTimeSeconds,
      opportunityId: body.opportunityId,
      anonymousSessionId: session.id
    }
  });

  const current = session.implicitProfile ?? { interests: [], skills: [] };
  const nextSignals = updateProfileSignals(current, opportunity.tags, body.type);

  await prisma.implicitProfile.upsert({
    where: { anonymousSessionId: session.id },
    update: {
      interests: nextSignals.interests,
      skills: nextSignals.skills,
      confidence: Math.min(100, (session.implicitProfile?.confidence ?? 0) + 8)
    },
    create: {
      anonymousSessionId: session.id,
      interests: nextSignals.interests,
      skills: nextSignals.skills,
      confidence: 8
    }
  });

  return NextResponse.json({ ok: true });
}
