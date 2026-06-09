import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { createAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

// ACTUALIZACIÓN DEL ESQUEMA DE VALIDACIÓN ZOD
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["CANDIDATE", "PUBLISHER"]).default("CANDIDATE"),
  anonymousToken: z.string().optional(),
  // Nuevos campos opcionales validados
  isCurrentlyWorking: z.boolean().optional(),
  currentCompany: z.string().optional()
});

export async function POST(request: NextRequest) {
  const body = schema.parse(await request.json());
  const email = body.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con este correo." },
      { status: 409 }
    );
  }

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: body.name,
        email,
        passwordHash: await hashPassword(body.password),
        role: body.role as UserRole,
        reputationPoints: body.role === "PUBLISHER" ? 25 : 0,
        // GUARDANDO LOS NUEVOS CAMPOS EN LA BASE DE DATOS
        isCurrentlyWorking: body.isCurrentlyWorking ?? false,
        currentCompany: body.isCurrentlyWorking ? body.currentCompany : null
      }
    });

    if (body.anonymousToken) {
      const anonymousSession = await tx.anonymousSession.findUnique({
        where: { token: body.anonymousToken },
        include: { implicitProfile: true }
      });

      if (anonymousSession && !anonymousSession.convertedAt) {
        await tx.anonymousSession.update({
          where: { id: anonymousSession.id },
          data: {
            userId: createdUser.id,
            convertedAt: new Date()
          }
        });

        await tx.interaction.updateMany({
          where: { anonymousSessionId: anonymousSession.id },
          data: { userId: createdUser.id }
        });

        if (anonymousSession.implicitProfile) {
          await tx.implicitProfile.update({
            where: { id: anonymousSession.implicitProfile.id },
            data: { userId: createdUser.id }
          });
        }
      }
    }

    return createdUser;
  });

  await createAuthSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}