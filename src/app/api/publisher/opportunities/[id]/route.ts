import { NextRequest, NextResponse } from "next/server";
import { OpportunityStatus, WorkMode } from "@prisma/client";
import { z } from "zod";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  title: z.string().min(4).optional(),
  description: z.string().min(40).optional(),
  tags: z.array(z.string().min(1)).min(1).optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  location: z.string().optional(),
  contractType: z.string().min(3).optional(),
  compensation: z.string().optional(),
  applicationUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().url().safeParse(value).success, {
      message: "El enlace debe ser una URL válida (ej. https://...)"
    })
    .optional()
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = schema.parse(await request.json());
  const user = await getCurrentUser();

  if (!user || !canPublish(user.role)) {
    return NextResponse.json(
      { error: "Necesitas una cuenta de publicador para modificar oportunidades." },
      { status: 401 }
    );
  }

  const opportunity = await prisma.opportunity.update({
    where: { id, publisherId: user.id },
    data: {
      ...(body.status && {
        status: body.status as OpportunityStatus,
        archivedAt: body.status === "ARCHIVED" ? new Date() : null
      }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.workMode !== undefined && { workMode: body.workMode }),
      ...(body.location !== undefined && { location: body.location || null }),
      ...(body.contractType !== undefined && { contractType: body.contractType }),
      ...(body.compensation !== undefined && { compensation: body.compensation || null }),
      ...(body.applicationUrl !== undefined && {
        applicationUrl: body.applicationUrl || null
      })
    }
  });

  return NextResponse.json({ opportunity });
}
