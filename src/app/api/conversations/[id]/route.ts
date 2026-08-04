import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para ver esta conversación." },
      { status: 401 }
    );
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, OR: [{ candidateId: user.id }, { publisherId: user.id }] },
    include: {
      candidate: { select: { id: true, name: true } },
      publisher: { select: { id: true, name: true } },
      opportunity: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
  }

  const otherParty =
    conversation.candidateId === user.id ? conversation.publisher : conversation.candidate;

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      opportunity: conversation.opportunity,
      otherParty,
      messages: conversation.messages
    },
    currentUserId: user.id
  });
}
