"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  Filter,
  LogIn,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  X
} from "lucide-react";

type Opportunity = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  location: string | null;
  contractType: string;
  compensation: string | null;
  matchScore: number;
  publisher: {
    name: string | null;
    reputationPoints: number;
  };
};

const workModeLabels = {
  REMOTE: "Remoto",
  HYBRID: "Híbrido",
  ONSITE: "Presencial"
};

export function OpportunityFeed({
  initialOpportunities
}: {
  initialOpportunities: Opportunity[];
}) {
  const [token, setToken] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const existingToken = window.localStorage.getItem("matchops.session");

    if (existingToken) {
      setToken(existingToken);
      refresh(existingToken);
      return;
    }

    fetch("/api/sessions", { method: "POST" })
      .then((response) => response.json())
      .then((session) => {
        window.localStorage.setItem("matchops.session", session.token);
        setToken(session.token);
        refresh(session.token);
      });
  }, []);

  async function refresh(sessionToken: string) {
    const response = await fetch(`/api/opportunities?token=${sessionToken}`);
    const data = await response.json();
    setOpportunities(data.opportunities);
  }

  async function interact(opportunityId: string, type: "ACCEPT" | "IGNORE" | "SAVE") {
    if (!token) return;

    setBusyId(opportunityId);
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        opportunityId,
        type,
        dwellTimeSeconds: 4
      })
    });
    await refresh(token);
    setBusyId(null);
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return opportunities;

    return opportunities.filter((opportunity) => {
      return [
        opportunity.title,
        opportunity.description,
        opportunity.contractType,
        opportunity.location ?? "",
        ...opportunity.tags
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [opportunities, query]);

  const bestMatch = filtered[0];

  return (
    <main className="min-h-screen bg-mist/85">
      <header className="sticky top-0 z-20 border-b border-line bg-mist/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <Sparkles size={20} aria-hidden />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight text-ink">MatchOps</p>
              <p className="text-xs text-ink/60">Web MVP</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/auth"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
            >
              <LogIn size={16} />
              Entrar
            </a>
            <a
              href="/publisher"
              className="hidden h-10 items-center justify-center rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss sm:inline-flex"
            >
              Publicar
            </a>
            <div className="hidden items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink/70 sm:flex">
              <span className="h-2 w-2 rounded-full bg-moss" />
              Sesión anónima activa
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <label className="mb-2 block text-sm font-medium text-ink" htmlFor="search">
              Buscar oportunidades
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-mist px-3">
              <Search size={17} aria-hidden className="text-ink/50" />
              <input
                id="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full bg-transparent text-sm outline-none"
                placeholder="React, UX, remoto..."
              />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Perfil implícito</h2>
              <Filter size={17} aria-hidden className="text-ink/50" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full w-2/5 rounded-full bg-coral" />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              Interactúa con oportunidades para que el sistema mejore tu match
              automáticamente.
            </p>
          </div>

          {bestMatch ? (
            <div className="rounded-lg border border-line bg-ink p-4 text-white shadow-soft">
              <p className="text-xs uppercase tracking-wide text-white/55">Mejor match</p>
              <p className="mt-2 text-3xl font-semibold">{bestMatch.matchScore}%</p>
              <p className="mt-1 text-sm text-white/70">{bestMatch.title}</p>
            </div>
          ) : null}
        </aside>

        <div className="grid gap-4">
          {filtered.map((opportunity) => (
            <article
              key={opportunity.id}
              className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-moss px-2 py-1 text-xs font-medium text-white">
                      {opportunity.matchScore}% match
                    </span>
                    <span className="rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/70">
                      {workModeLabels[opportunity.workMode]}
                    </span>
                    <span className="rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/70">
                      {opportunity.contractType}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold text-ink">
                    {opportunity.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">
                    {opportunity.description}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    title="Ignorar"
                    onClick={() => interact(opportunity.id, "IGNORE")}
                    className="grid h-11 w-11 place-items-center rounded-lg border border-line text-ink/65 transition hover:border-coral hover:text-coral"
                  >
                    {busyId === opportunity.id ? <Loader2 className="animate-spin" size={18} /> : <X size={18} />}
                  </button>
                  <button
                    type="button"
                    title="Guardar"
                    onClick={() => interact(opportunity.id, "SAVE")}
                    className="grid h-11 w-11 place-items-center rounded-lg border border-line text-ink/65 transition hover:border-gold hover:text-gold"
                  >
                    <Bookmark size={18} />
                  </button>
                  <button
                    type="button"
                    title="Aceptar"
                    onClick={() => interact(opportunity.id, "ACCEPT")}
                    className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white transition hover:bg-moss"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-line px-2 py-1 text-xs text-ink/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <footer className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm text-ink/62 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {opportunity.publisher.name ?? "Publicador"} · Reputación{" "}
                  {opportunity.publisher.reputationPoints}
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle size={16} aria-hidden />
                  {opportunity.location ?? "Sin ubicación"} ·{" "}
                  {opportunity.compensation ?? "Compensación por definir"}
                </span>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
