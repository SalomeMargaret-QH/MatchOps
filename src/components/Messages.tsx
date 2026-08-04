"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Send, MessageCircle, Briefcase } from "lucide-react";

type ConversationSummary = {
  id: string;
  opportunity: { id: string; title: string };
  otherParty: { id: string; name: string | null };
  lastMessage: { body: string; createdAt: string } | null;
  updatedAt: string;
};

type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

export function Messages({ initialConversationId }: { initialConversationId?: string }) {
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherPartyName, setOtherPartyName] = useState("");
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId) loadThread(activeId);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    const response = await fetch("/api/conversations");
    const data = await response.json();
    if (response.ok) setConversations(data.conversations);
  }

  async function loadThread(id: string) {
    setLoadingThread(true);
    const response = await fetch(`/api/conversations/${id}`);
    const data = await response.json();
    if (response.ok) {
      setMessages(data.conversation.messages);
      setOtherPartyName(data.conversation.otherParty.name ?? "Usuario");
      setOpportunityTitle(data.conversation.opportunity.title);
      setCurrentUserId(data.currentUserId);
    }
    setLoadingThread(false);
  }

  async function sendMessage() {
    if (!activeId || !draft.trim()) return;
    setSending(true);
    const response = await fetch(`/api/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft.trim() })
    });
    const data = await response.json();
    if (response.ok) {
      setMessages((prev) => [...prev, data.message]);
      setDraft("");
      loadConversations();
    }
    setSending(false);
  }

  return (
    <main className="min-h-screen bg-mist px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-moss"
        >
          <ArrowLeft size={15} />
          Volver al feed
        </a>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Mensajes</h1>

        <div className="mt-6 grid gap-4 rounded-xl border border-line bg-white shadow-soft md:grid-cols-[280px_1fr] md:h-[560px] overflow-hidden">
          {/* LISTA DE CONVERSACIONES */}
          <div className="border-b border-line md:border-b-0 md:border-r overflow-y-auto">
            {conversations === null ? (
              <p className="flex items-center gap-2 p-4 text-sm text-ink/60">
                <Loader2 size={15} className="animate-spin" />
                Cargando...
              </p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-ink/50">Aún no tienes conversaciones.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`block w-full border-b border-line/60 p-3 text-left transition hover:bg-mist ${
                    activeId === conversation.id ? "bg-mist" : ""
                  }`}
                >
                  <p className="truncate text-sm font-bold text-ink">
                    {conversation.otherParty.name ?? "Usuario"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink/50">
                    <Briefcase size={11} />
                    {conversation.opportunity.title}
                  </p>
                  {conversation.lastMessage && (
                    <p className="mt-1 truncate text-xs text-ink/60">
                      {conversation.lastMessage.body}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>

          {/* HILO DE MENSAJES */}
          <div className="flex min-h-[400px] flex-col">
            {!activeId ? (
              <div className="grid flex-1 place-items-center p-8 text-center text-sm text-ink/40">
                <div>
                  <MessageCircle size={28} className="mx-auto mb-2 opacity-40" />
                  Selecciona una conversación para ver los mensajes.
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-line p-3">
                  <p className="text-sm font-bold text-ink">{otherPartyName}</p>
                  <p className="text-xs text-ink/50">{opportunityTitle}</p>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                  {loadingThread ? (
                    <p className="flex items-center gap-2 text-sm text-ink/60">
                      <Loader2 size={15} className="animate-spin" />
                      Cargando mensajes...
                    </p>
                  ) : (
                    messages.map((message) => {
                      const mine = message.senderId === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                              mine ? "bg-ink text-white" : "bg-mist text-ink"
                            }`}
                          >
                            {message.body}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="flex items-center gap-2 border-t border-line p-3">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") sendMessage();
                    }}
                    placeholder="Escribe un mensaje..."
                    className="h-10 flex-1 rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !draft.trim()}
                    className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white transition hover:bg-moss disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
