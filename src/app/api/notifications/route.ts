import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  const unread = await prisma.message.findMany({
    where: { receiverId: user.id, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      sender: { select: { name: true } },
      conversation: {
        select: { id: true, opportunity: { select: { title: true } } }
      }
    }
  });

  const notifications = unread.map((message) => ({
    id: message.id,
    conversationId: message.conversation.id,
    title: `Mensaje de ${message.sender.name ?? "un usuario"}`,
    message: `${message.conversation.opportunity.title}: ${message.body}`,
    time: message.createdAt
  }));

  return NextResponse.json({ notifications });
}
