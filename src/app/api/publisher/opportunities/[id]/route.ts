import { NextRequest, NextResponse } from "next/server";
import { OpportunityStatus } from "@prisma/client";
import { z } from "zod";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"])
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
      status: body.status as OpportunityStatus,
      archivedAt: body.status === "ARCHIVED" ? new Date() : null
    }
  });

  return NextResponse.json({ opportunity });
}
