import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  isCurrentlyWorking: z.boolean().optional(),
  currentCompany: z.string().nullable().optional(),
  currentRole: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para actualizar tu perfil." },
      { status: 401 }
    );
  }

  const body = schema.parse(await request.json());

  const updated = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      ...(body.isCurrentlyWorking !== undefined && {
        isCurrentlyWorking: body.isCurrentlyWorking
      }),
      ...(body.currentCompany !== undefined && { currentCompany: body.currentCompany }),
      ...(body.currentRole !== undefined && { currentRole: body.currentRole }),
      ...(body.description !== undefined && { description: body.description })
    }
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      name: updated.name,
      isCurrentlyWorking: updated.isCurrentlyWorking,
      currentCompany: updated.currentCompany,
      currentRole: updated.currentRole,
      description: updated.description
    }
  });
}
