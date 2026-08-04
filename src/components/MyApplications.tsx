"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Building2,
  Star
} from "lucide-react";

type Application = {
  appliedAt: string;
  opportunity: {
    id: string;
    title: string;
    description: string;
    workMode: "REMOTE" | "HYBRID" | "ONSITE";
    location: string | null;
    contractType: string;
    compensation: string | null;
    applicationUrl: string | null;
    status: "ACTIVE" | "PAUSED" | "ARCHIVED";
    publisher: { name: string | null; reputationPoints: number };
  };
};

const workModeLabels = { REMOTE: "Remoto", HYBRID: "Híbrido", ONSITE: "Presencial" };

const statusBadge: Record<Application["opportunity"]["status"], string> = {
  ACTIVE: "bg-moss/10 text-moss",
  PAUSED: "bg-gold/15 text-gold",
  ARCHIVED: "bg-ink/10 text-ink/60"
};

const statusLabel: Record<Application["opportunity"]["status"], string> = {
  ACTIVE: "Vacante activa",
  PAUSED: "Vacante pausada",
  ARCHIVED: "Vacante archivada"
};

export function MyApplications() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/interactions/mine")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "No se pudieron cargar tus postulaciones.");
          return;
        }
        setApplications(data.postulaciones);
      })
      .catch(() => setError("No se pudieron cargar tus postulaciones."));
  }, []);

  return (
    <main className="min-h-screen bg-mist px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-moss"
        >
          <ArrowLeft size={15} />
          Volver al feed
        </a>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Mis postulaciones</h1>
        <p className="mt-1 text-sm text-ink/60">
          Todas las oportunidades a las que has aplicado, en un solo lugar.
        </p>

        <div className="mt-6 space-y-3">
          {error && (
            <div className="rounded-lg border border-coral/30 bg-coral/5 p-4 text-sm text-coral">
              {error}
            </div>
          )}

          {!error && applications === null && (
            <p className="flex items-center gap-2 text-sm text-ink/60">
              <Loader2 size={15} className="animate-spin" />
              Cargando tus postulaciones...
            </p>
          )}

          {applications?.length === 0 && (
            <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink/50">
              Todavía no has postulado a ninguna oportunidad.
            </div>
          )}

          {applications?.map(({ appliedAt, opportunity }) => (
            <article
              key={opportunity.id}
              className="rounded-xl border border-line bg-white p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${statusBadge[opportunity.status]}`}
                >
                  {statusLabel[opportunity.status]}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/70">
                  <Briefcase size={12} />
                  {workModeLabels[opportunity.workMode]}
                </span>
                {opportunity.location && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/70">
                    <MapPin size={12} />
                    {opportunity.location}
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-lg font-bold text-ink">{opportunity.title}</h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-ink/50">
                <Building2 size={13} />
                {opportunity.publisher.name ?? "Empresa Confidencial"}
                <span className="inline-flex items-center gap-0.5 text-gold">
                  <Star size={11} />
                  {opportunity.publisher.reputationPoints}
                </span>
              </p>

              <p className="mt-3 text-sm leading-relaxed text-ink/70 line-clamp-2">
                {opportunity.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-ink/45">
                  Postulaste el{" "}
                  {new Date(appliedAt).toLocaleDateString("es-PE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
                {opportunity.applicationUrl && (
                  <a
                    href={opportunity.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss hover:underline"
                  >
                    <ExternalLink size={13} />
                    Ver enlace
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
