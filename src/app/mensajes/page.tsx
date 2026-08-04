import { Messages } from "@/components/Messages";

export default async function MensajesPage({
  searchParams
}: {
  searchParams: Promise<{ conversationId?: string }>;
}) {
  const params = await searchParams;
  return <Messages initialConversationId={params.conversationId} />;
}
