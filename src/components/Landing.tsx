"use client";

import { useState } from "react";
import {
  Sparkles,
  Target,
  ShieldCheck,
  Zap,
  MapPin,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
  ArrowRight
} from "lucide-react";

type PreviewOpportunity = {
  id: string;
  title: string;
  description: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  location: string | null;
  contractType: string;
  publisherName: string | null;
};

const workModeLabels = {
  REMOTE: "Remoto",
  HYBRID: "Híbrido",
  ONSITE: "Presencial"
};

const highlights = [
  {
    icon: Target,
    title: "Matching inteligente",
    description: "Analizamos tus intereses y te mostramos las vacantes con mejor compatibilidad."
  },
  {
    icon: Zap,
    title: "Postulación en un clic",
    description: "Sin formularios eternos. Aplica a oportunidades reales en segundos."
  },
  {
    icon: ShieldCheck,
    title: "Reputación transparente",
    description: "Empresas y candidatos con puntaje de confianza visible para ambas partes."
  }
];

export function Landing({ preview }: { preview: PreviewOpportunity[] }) {
  const [reactions, setReactions] = useState<Record<string, "like" | "skip">>({});

  function react(id: string, value: "like" | "skip") {
    setReactions((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <main className="min-h-screen bg-mist">
      {/* HERO */}
      <header className="border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white shadow-md">
              <Sparkles size={20} aria-hidden />
            </div>
            <p className="text-lg font-bold leading-tight text-ink tracking-tight">MatchOps</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/auth"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              Entrar
            </a>
            <a
              href="/auth"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-moss shadow-sm"
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-moss">
          <Briefcase size={13} />
          Plataforma de empleo con matching
        </p>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Encuentra la oportunidad que sí encaja contigo
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink/65">
          MatchOps aprende de tus intereses en tiempo real y te conecta con vacantes
          reales, mientras las empresas ven candidatos con el perfil correcto.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/auth"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-6 text-sm font-bold text-white shadow-soft transition hover:bg-moss"
          >
            Empezar gratis
            <ArrowRight size={16} />
          </a>
          <a
            href="#vista-previa"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-line bg-white px-6 text-sm font-bold text-ink transition hover:border-moss hover:text-moss"
          >
            Ver una vista previa
          </a>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-line bg-white p-5 shadow-soft"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-moss/10 text-moss">
                <item.icon size={20} />
              </div>
              <h3 className="mt-3 text-base font-bold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VISTA PREVIA (sin cuenta, solo para probar la sensación de la app) */}
      <section id="vista-previa" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink">Prueba cómo se siente</h2>
          <p className="mt-2 text-sm text-ink/60">
            Dale me gusta o pasa estas oportunidades de ejemplo. Cuando crees tu cuenta,
            usamos tus preferencias reales para afinar el match desde el primer momento.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {preview.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink/50">
              Aún no hay ofertas publicadas para mostrar en la vista previa.
            </div>
          ) : (
            preview.map((opportunity) => {
              const reaction = reactions[opportunity.id];
              return (
                <article
                  key={opportunity.id}
                  className={`rounded-xl border bg-white p-5 shadow-soft transition ${
                    reaction === "skip" ? "opacity-40" : "opacity-100"
                  } ${reaction === "like" ? "border-moss" : "border-line"}`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-semibold text-ink/70">
                      <Briefcase size={12} />
                      {workModeLabels[opportunity.workMode]}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-semibold text-ink/70">
                      {opportunity.contractType}
                    </span>
                    {opportunity.location && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-semibold text-ink/70">
                        <MapPin size={12} />
                        {opportunity.location}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-ink">{opportunity.title}</h3>
                  <p className="mt-1 text-xs font-medium text-ink/50">
                    {opportunity.publisherName ?? "Empresa Confidencial"}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70 line-clamp-2">
                    {opportunity.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => react(opportunity.id, "skip")}
                      className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-coral transition hover:bg-coral/5 hover:border-coral"
                    >
                      <ThumbsDown size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => react(opportunity.id, "like")}
                      className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-moss transition hover:bg-moss/5 hover:border-moss"
                    >
                      <ThumbsUp size={17} />
                    </button>
                    {reaction && (
                      <span className="text-xs font-semibold text-ink/50">
                        {reaction === "like" ? "¡Anotado! Te gusta este tipo de oferta." : "Entendido, no es lo tuyo."}
                      </span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="mt-10 rounded-xl bg-ink p-6 text-center text-white shadow-soft">
          <p className="text-sm font-bold uppercase tracking-widest opacity-75">
            Esto fue solo una prueba
          </p>
          <p className="mt-2 text-lg font-semibold">
            Crea tu cuenta para guardar tus preferencias reales y postular de verdad
          </p>
          <a
            href="/auth"
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-ink transition hover:bg-mist"
          >
            Crear cuenta gratis
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <footer className="border-t border-line py-6 text-center text-xs text-ink/45">
        <p>© {new Date().getFullYear()} MatchOps</p>
        <div className="mt-1.5 flex items-center justify-center gap-3">
          <a href="/terminos" className="hover:text-moss hover:underline">Términos y condiciones</a>
          <span>·</span>
          <a href="/privacidad" className="hover:text-moss hover:underline">Privacidad</a>
        </div>
      </footer>
    </main>
  );
}
