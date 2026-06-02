import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await prisma.anonymousSession.create({
    data: {
      token: randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      implicitProfile: {
        create: {
          interests: [],
          skills: [],
          confidence: 0
        }
      }
    }
  });

  return NextResponse.json({
    token: session.token,
    expiresAt: session.expiresAt
  });
}
