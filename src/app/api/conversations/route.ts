import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonWithSchema } from "@/lib/api-handler";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para ver tus mensajes." },
      { status: 401 }
    );
  }

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ candidateId: user.id }, { publisherId: user.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      candidate: { select: { id: true, name: true } },
      publisher: { select: { id: true, name: true } },
      opportunity: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  const payload = conversations.map((conversation) => ({
    id: conversation.id,
    opportunity: conversation.opportunity,
    otherParty:
      conversation.candidateId === user.id ? conversation.publisher : conversation.candidate,
    lastMessage: conversation.messages[0] ?? null,
    updatedAt: conversation.updatedAt
  }));

  return NextResponse.json({ conversations: payload });
}

const createSchema = z.object({
  opportunityId: z.string(),
  candidateId: z.string().optional()
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para enviar un mensaje." },
      { status: 401 }
    );
  }

  const parsed = await parseJsonWithSchema(request, createSchema);
  if ("response" in parsed) return parsed.response;
  const { opportunityId, candidateId } = parsed.data;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    select: { id: true, publisherId: true }
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Oportunidad no encontrada." }, { status: 404 });
  }

  let resolvedCandidateId: string;
  let resolvedPublisherId: string;

  if (opportunity.publisherId === user.id) {
    // El publicador está iniciando o reabriendo la conversación con un postulante puntual
    if (!candidateId) {
      return NextResponse.json(
        { error: "Falta indicar con qué candidato quieres conversar." },
        { status: 400 }
      );
    }
    resolvedCandidateId = candidateId;
    resolvedPublisherId = user.id;
  } else {
    resolvedCandidateId = user.id;
    resolvedPublisherId = opportunity.publisherId;
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      candidateId: resolvedCandidateId,
      publisherId: resolvedPublisherId,
      opportunityId: opportunity.id
    }
  });

  const conversation =
    existing ??
    (await prisma.conversation.create({
      data: {
        candidateId: resolvedCandidateId,
        publisherId: resolvedPublisherId,
        opportunityId: opportunity.id
      }
    }));

  return NextResponse.json({ conversation }, { status: 201 });
}
