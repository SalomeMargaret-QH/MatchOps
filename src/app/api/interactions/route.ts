import { NextRequest, NextResponse } from "next/server";
import { InteractionType } from "@prisma/client";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProfileSignals } from "@/lib/matching";

const schema = z.object({
  token: z.string().min(1).optional(),
  opportunityId: z.string().min(1),
  type: z.nativeEnum(InteractionType),
  dwellTimeSeconds: z.number().int().nonnegative().optional()
});

export async function POST(request: NextRequest) {
  const body = schema.parse(await request.json());
  const user = await getCurrentUser();

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: body.opportunityId }
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Oportunidad no encontrada" }, { status: 404 });
  }

  if (user) {
    // Usuario con sesión real: la interacción se guarda ligada a su cuenta,
    // no a una sesión anónima (antes se perdía porque el token no coincidía con nada).
    await prisma.interaction.create({
      data: {
        type: body.type,
        dwellTimeSeconds: body.dwellTimeSeconds,
        opportunityId: body.opportunityId,
        userId: user.id
      }
    });

    const existingProfile = await prisma.implicitProfile.findUnique({
      where: { userId: user.id }
    });
    const current = existingProfile ?? { interests: [], skills: [] };
    const nextSignals = updateProfileSignals(current, opportunity.tags, body.type);

    await prisma.implicitProfile.upsert({
      where: { userId: user.id },
      update: {
        interests: nextSignals.interests,
        skills: nextSignals.skills,
        confidence: Math.min(100, (existingProfile?.confidence ?? 0) + 8)
      },
      create: {
        userId: user.id,
        interests: nextSignals.interests,
        skills: nextSignals.skills,
        confidence: 8
      }
    });

    return NextResponse.json({ ok: true });
  }

  // Visitante sin cuenta: se mantiene el flujo original de sesión anónima
  if (!body.token) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  const session = await prisma.anonymousSession.findUnique({
    where: { token: body.token },
    include: { implicitProfile: true }
  });

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
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
