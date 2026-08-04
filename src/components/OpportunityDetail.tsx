"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  Star,
  ExternalLink,
  Check,
  Bookmark,
  MessageCircle,
  Loader2,
  Radio
} from "lucide-react";

type OpportunityDetailData = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  location: string | null;
  contractType: string;
  compensation: string | null;
  applicationUrl: string | null;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  publisher: { name: string | null; reputationPoints: number };
  createdAt: string;
};

const workModeLabels = { REMOTE: "Remoto", HYBRID: "Híbrido", ONSITE: "Presencial" };

export function OpportunityDetail({
  opportunity,
  isLoggedIn
}: {
  opportunity: OpportunityDetailData;
  isLoggedIn: boolean;
}) {
  const [busy, setBusy] = useState<"ACCEPT" | "SAVE" | "MESSAGE" | null>(null);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  async function interact(type: "ACCEPT" | "SAVE") {
    setBusy(type);
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: opportunity.id, type, dwellTimeSeconds: 4 })
    });
    if (type === "ACCEPT") setApplied(true);
    if (type === "SAVE") setSaved(true);
    setBusy(null);
  }

  async function messagePublisher() {
    setBusy("MESSAGE");
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: opportunity.id })
    });
    const data = await response.json();
    if (response.ok) {
      window.location.href = `/mensajes?conversationId=${data.conversation.id}`;
    }
    setBusy(null);
  }

  return (
    <main className="min-h-screen bg-mist px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-moss"
        >
          <ArrowLeft size={15} />
          Volver al feed
        </a>

        <article className="mt-4 rounded-xl border border-line bg-white p-6 shadow-soft">
          {opportunity.status !== "ACTIVE" && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold">
              <Radio size={12} />
              Esta oportunidad ya no está activa
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-ink/70">
              <Briefcase size={12} />
              {workModeLabels[opportunity.workMode]}
            </span>
            <span className="rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-ink/70">
              {opportunity.contractType}
            </span>
            {opportunity.location && (
              <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-ink/70">
                <MapPin size={12} />
                {opportunity.location}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">{opportunity.title}</h1>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-ink/55">
            <Building2 size={14} />
            {opportunity.publisher.name ?? "Empresa Confidencial"}
            <span className="inline-flex items-center gap-0.5 text-gold">
              <Star size={12} />
              {opportunity.publisher.reputationPoints}
            </span>
          </p>

          {opportunity.compensation && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mist px-3 py-2 text-sm font-semibold text-ink">
              <DollarSign size={15} />
              {opportunity.compensation}
            </div>
          )}

          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink/75">
            {opportunity.description}
          </p>

          {opportunity.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {opportunity.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-moss/10 px-3 py-1 text-xs font-medium text-moss"
                >
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>
          )}

          {opportunity.applicationUrl && (
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-moss hover:text-ink hover:underline"
            >
              <ExternalLink size={14} />
              Ver más detalles / postular en el sitio
            </a>
          )}

          <div className="mt-6 border-t border-line pt-5">
            {!isLoggedIn ? (
              <a
                href="/auth"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-ink px-5 text-sm font-bold text-white transition hover:bg-moss"
              >
                Inicia sesión para postular
              </a>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => interact("ACCEPT")}
                  disabled={busy !== null || applied}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-ink px-5 text-sm font-bold text-white transition hover:bg-moss disabled:opacity-60"
                >
                  {busy === "ACCEPT" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {applied ? "Ya postulaste" : "Aplicar"}
                </button>
                <button
                  type="button"
                  onClick={() => interact("SAVE")}
                  disabled={busy !== null || saved}
                  className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-ink/60 transition hover:bg-mist hover:text-ink disabled:opacity-60"
                >
                  {busy === "SAVE" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={messagePublisher}
                  disabled={busy !== null}
                  className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-moss transition hover:bg-moss/5 hover:border-moss disabled:opacity-60"
                >
                  {busy === "MESSAGE" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <MessageCircle size={16} />
                  )}
                </button>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
