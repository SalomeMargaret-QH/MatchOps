import { NextRequest, NextResponse } from "next/server";
import { OpportunityStatus, WorkMode } from "@prisma/client";
import { z } from "zod";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const opportunitySchema = z.object({
  title: z.string().min(4),
  description: z.string().min(40),
  tags: z.array(z.string().min(1)).min(1),
  workMode: z.nativeEnum(WorkMode),
  location: z.string().optional(),
  contractType: z.string().min(3),
  compensation: z.string().optional()
});

export async function GET() {
  const publisher = await getCurrentUser();

  if (!publisher || !canPublish(publisher.role)) {
    return NextResponse.json(
      { error: "Necesitas una cuenta de publicador para entrar al panel." },
      { status: 401 }
    );
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { publisherId: publisher.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          interactions: true,
          savedBy: true,
          conversations: true
        }
      }
    }
  });

  return NextResponse.json({ publisher, opportunities });
}

export async function POST(request: NextRequest) {
  const body = opportunitySchema.parse(await request.json());
  const publisher = await getCurrentUser();

  if (!publisher || !canPublish(publisher.role)) {
    return NextResponse.json(
      { error: "Necesitas una cuenta de publicador para publicar." },
      { status: 401 }
    );
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      title: body.title,
      description: body.description,
      tags: body.tags,
      workMode: body.workMode,
      location: body.location || null,
      contractType: body.contractType,
      compensation: body.compensation || null,
      status: OpportunityStatus.ACTIVE,
      publisherId: publisher.id
    }
  });

  return NextResponse.json({ opportunity }, { status: 201 });
}
