import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para enviar un mensaje." },
      { status: 401 }
    );
  }

  const { body } = schema.parse(await request.json());

  const conversation = await prisma.conversation.findFirst({
    where: { id, OR: [{ candidateId: user.id }, { publisherId: user.id }] }
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
  }

  const receiverId =
    conversation.candidateId === user.id ? conversation.publisherId : conversation.candidateId;

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      receiverId,
      body
    }
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() }
  });

  return NextResponse.json({ message }, { status: 201 });
}
