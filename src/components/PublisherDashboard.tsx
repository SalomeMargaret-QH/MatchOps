"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive,
  BriefcaseBusiness,
  CheckCircle2,
  LogOut,
  Loader2,
  PauseCircle,
  Plus,
  Radio,
  Users,
  Mail,
  Star,
  ChevronDown,
  ChevronUp,
  Link2,
  Save,
  Pencil,
  MessageCircle
} from "lucide-react";

type WorkMode = "REMOTE" | "HYBRID" | "ONSITE";
type Status = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";

type PublisherOpportunity = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  workMode: WorkMode;
  location: string | null;
  contractType: string;
  compensation: string | null;
  applicationUrl: string | null;
  status: Status;
  createdAt: string;
  _count: {
    interactions: number;
    savedBy: number;
    conversations: number;
  };
};

const workModeLabels: Record<WorkMode, string> = {
  REMOTE: "Remoto",
  HYBRID: "Híbrido",
  ONSITE: "Presencial"
};

const statusLabels: Record<Status, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  ARCHIVED: "Archivada"
};

type Applicant = {
  appliedAt: string;
  candidate: {
    id: string;
    name: string | null;
    email: string | null;
    reputationPoints: number;
    isCurrentlyWorking: boolean | null;
    currentCompany: string | null;
    currentRole: string | null;
    description: string | null;
  };
};

const emptyForm = {
  title: "",
  description: "",
  tags: "",
  workMode: "REMOTE" as WorkMode,
  location: "",
  contractType: "Freelance",
  compensation: "",
  applicationUrl: ""
};

export function PublisherDashboard() {
  const [opportunities, setOpportunities] = useState<PublisherOpportunity[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
    // NUEVO: Guarda el ID de la oferta seleccionada para ver sus candidatos
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [applicantsByOpportunity, setApplicantsByOpportunity] = useState<
    Record<string, Applicant[]>
  >({});
  const [loadingApplicantsId, setLoadingApplicantsId] = useState<string | null>(null);
  const [messagingCandidateId, setMessagingCandidateId] = useState<string | null>(null);


  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const response = await fetch("/api/publisher/opportunities");
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "No se pudo cargar el panel.");
      setLoading(false);
      return;
    }

    setOpportunities(data.opportunities);
    setLoading(false);
  }

  async function createOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    };

    if (editingId) {
      await fetch(`/api/publisher/opportunities/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setEditingId(null);
    } else {
      await fetch("/api/publisher/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    setForm(emptyForm);
    await refresh();
    setSaving(false);
  }

  function startEdit(opportunity: PublisherOpportunity) {
    setEditingId(opportunity.id);
    setForm({
      title: opportunity.title,
      description: opportunity.description,
      tags: opportunity.tags.join(", "),
      workMode: opportunity.workMode,
      location: opportunity.location ?? "",
      contractType: opportunity.contractType,
      compensation: opportunity.compensation ?? "",
      applicationUrl: opportunity.applicationUrl ?? ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth";
  }

  async function updateStatus(id: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED") {
    setMutatingId(id);
    await fetch(`/api/publisher/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await refresh();
    setMutatingId(null);
  }

  async function toggleApplicants(opportunityId: string) {
    if (selectedOpportunityId === opportunityId) {
      setSelectedOpportunityId(null);
      return;
    }

    setSelectedOpportunityId(opportunityId);

    if (!applicantsByOpportunity[opportunityId]) {
      setLoadingApplicantsId(opportunityId);
      const response = await fetch(
        `/api/publisher/opportunities/${opportunityId}/applicants`
      );
      const data = await response.json();
      if (response.ok) {
        setApplicantsByOpportunity((prev) => ({
          ...prev,
          [opportunityId]: data.applicants
        }));
      }
      setLoadingApplicantsId(null);
    }
  }

  async function messageApplicant(opportunityId: string, candidateId: string) {
    setMessagingCandidateId(candidateId);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, candidateId })
      });
      const data = await response.json();
      if (response.ok) {
        window.location.href = `/mensajes?conversationId=${data.conversation.id}`;
      }
    } finally {
      setMessagingCandidateId(null);
    }
  }

  const totals = useMemo(() => {
    return opportunities.reduce(
      (acc, opportunity) => {
        acc.interactions += opportunity._count.interactions;
        acc.saved += opportunity._count.savedBy;
        acc.conversations += opportunity._count.conversations;
        return acc;
      },
      { interactions: 0, saved: 0, conversations: 0 }
    );
  }, [opportunities]);

  return (
    <main className="min-h-screen bg-mist/90">
      <header className="border-b border-line bg-white/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-moss">MatchOps Publisher</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">
              Panel de oportunidades
            </h1>
          </div>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-line px-4 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
          >
            Ver feed
          </a>
          <a
            href="/mensajes"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-4 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
          >
            <MessageCircle size={16} />
            Mensajes
          </a>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-4 text-sm font-medium text-ink transition hover:border-coral hover:text-coral"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[390px_1fr]">
        <aside className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Interacciones" value={totals.interactions} />
            <Metric label="Guardados" value={totals.saved} />
            <Metric label="Chats" value={totals.conversations} />
          </div>

          <form
            onSubmit={createOpportunity}
            className="rounded-lg border border-line bg-white p-4 shadow-soft"
          >
            <div className="mb-4 flex items-center gap-2">
              <BriefcaseBusiness size={19} className="text-moss" />
              <h2 className="text-base font-semibold text-ink">
                {editingId ? "Editar oportunidad" : "Nueva oportunidad"}
              </h2>
            </div>

            <Field label="Título">
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
                placeholder="Frontend Developer React"
              />
            </Field>

            <Field label="Descripción">
              <textarea
                required
                minLength={40}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="min-h-28 w-full resize-y rounded-lg border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-moss"
                placeholder="Describe responsabilidades, requisitos y contexto del proyecto."
              />
            </Field>

            <Field label="Etiquetas">
  <input
    required
    value={form.tags}
    onChange={(event) => setForm({ ...form, tags: event.target.value })}
    className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
    placeholder="React, TypeScript, UI"
  />
  
  {/* VISTA PREVIA INTERACTIVA DE REQUISITOS (TAGS) EN TIEMPO REAL */}
  <div className="mt-2 flex flex-wrap gap-1.5">
    {form.tags.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag, idx) => (
        <span 
          key={idx} 
          className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2.5 py-1 text-xs font-bold text-moss shadow-sm border border-moss/20"
        >
          #{tag.toLowerCase()}
          <button
            type="button"
            title="Eliminar requisito"
            onClick={() => {
              const currentTags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
              currentTags.splice(idx, 1);
              setForm({ ...form, tags: currentTags.join(", ") });
            }}
            className="ml-0.5 font-normal text-xs text-moss/60 hover:text-coral transition-colors"
          >
            ×
          </button>
        </span>
      ))
    }
    {form.tags.trim() === "" && (
      <p className="text-[11px] text-ink/40 italic">
        Separa los requisitos con comas (Ej: Titulado, Inglés, ONPE) para activar las etiquetas de exclusión.
      </p>
    )}
  </div>
</Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Modalidad">
                <select
                  value={form.workMode}
                  onChange={(event) =>
                    setForm({ ...form, workMode: event.target.value as WorkMode })
                  }
                  className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
                >
                  <option value="REMOTE">Remoto</option>
                  <option value="HYBRID">Híbrido</option>
                  <option value="ONSITE">Presencial</option>
                </select>
              </Field>
              <Field label="Contrato">
                <input
                  required
                  value={form.contractType}
                  onChange={(event) =>
                    setForm({ ...form, contractType: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Ubicación">
                <input
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
                  placeholder="Lima, Perú"
                />
              </Field>
              <Field label="Compensación">
                <input
                  value={form.compensation}
                  onChange={(event) =>
                    setForm({ ...form, compensation: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
                  placeholder="USD 1,800"
                />
              </Field>
            </div>

            <Field label="Enlace de postulación (opcional)">
              <input
                type="url"
                value={form.applicationUrl}
                onChange={(event) =>
                  setForm({ ...form, applicationUrl: event.target.value })
                }
                className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
                placeholder="https://tuempresa.com/postular"
              />
            </Field>

            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : editingId ? (
                  <Save size={17} />
                ) : (
                  <Plus size={17} />
                )}
                {editingId ? "Guardar cambios" : "Publicar oportunidad"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="h-11 rounded-lg border border-line px-4 text-sm font-semibold text-ink/60 transition hover:bg-mist"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </aside>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-lg border border-line bg-white p-6 text-sm text-ink/60">
              Cargando oportunidades...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-coral/30 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-ink">Acceso requerido</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{error}</p>
              <a
                href="/auth"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-medium text-white transition hover:bg-moss"
              >
                Ingresar o crear cuenta
              </a>
            </div>
          ) : null}

          {!error && opportunities.map((opportunity) => (
            <article
              key={opportunity.id}
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/70">
                      <Radio size={13} />
                      {statusLabels[opportunity.status]}
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
                  {opportunity.applicationUrl && (
                    <a
                      href={opportunity.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-moss hover:underline"
                    >
                      <Link2 size={13} />
                      {opportunity.applicationUrl}
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <ActionButton
                    label="Editar"
                    icon={<Pencil size={17} />}
                    busy={false}
                    onClick={() => startEdit(opportunity)}
                  />
                  {opportunity.status !== "ACTIVE" ? (
                    <ActionButton
                      label="Activar"
                      icon={<CheckCircle2 size={17} />}
                      busy={mutatingId === opportunity.id}
                      onClick={() => updateStatus(opportunity.id, "ACTIVE")}
                    />
                  ) : (
                    <ActionButton
                      label="Pausar"
                      icon={<PauseCircle size={17} />}
                      busy={mutatingId === opportunity.id}
                      onClick={() => updateStatus(opportunity.id, "PAUSED")}
                    />
                  )}
                  <ActionButton
                    label="Archivar"
                    icon={<Archive size={17} />}
                    busy={mutatingId === opportunity.id}
                    onClick={() => updateStatus(opportunity.id, "ARCHIVED")}
                  />
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

              <footer className="mt-4 grid gap-2 border-t border-line pt-4 text-sm text-ink/62 sm:grid-cols-3">
                <span>{opportunity._count.interactions} interacciones</span>
                <span>{opportunity._count.savedBy} guardados</span>
                <span>{opportunity._count.conversations} conversaciones</span>
              </footer>

              <button
                type="button"
                onClick={() => toggleApplicants(opportunity.id)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:text-ink transition"
              >
                <Users size={16} />
                Ver postulantes
                {selectedOpportunityId === opportunity.id ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {selectedOpportunityId === opportunity.id && (
                <div className="mt-3 space-y-2 rounded-lg border border-line bg-mist/50 p-3">
                  {loadingApplicantsId === opportunity.id ? (
                    <p className="flex items-center gap-2 text-sm text-ink/60">
                      <Loader2 size={15} className="animate-spin" />
                      Cargando postulantes...
                    </p>
                  ) : (applicantsByOpportunity[opportunity.id]?.length ?? 0) === 0 ? (
                    <p className="text-sm text-ink/50">
                      Todavía nadie ha postulado a esta oferta.
                    </p>
                  ) : (
                    applicantsByOpportunity[opportunity.id].map((applicant) => (
                      <div
                        key={applicant.candidate.id}
                        className="rounded-lg border border-line bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                            {applicant.candidate.name
                              ? applicant.candidate.name
                                  .trim()
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((part) => part[0]?.toUpperCase())
                                  .join("")
                              : "C"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-ink">
                                {applicant.candidate.name ?? "Candidato"}
                              </p>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold">
                                <Star size={13} />
                                {applicant.candidate.reputationPoints} pts
                              </span>
                            </div>

                            {applicant.candidate.isCurrentlyWorking && applicant.candidate.currentRole ? (
                              <p className="mt-1 text-xs text-ink/60">
                                Actualmente: {applicant.candidate.currentRole}
                                {applicant.candidate.currentCompany
                                  ? ` en ${applicant.candidate.currentCompany}`
                                  : ""}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-ink/60">Disponible para trabajar</p>
                            )}

                            {applicant.candidate.description && (
                              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                                {applicant.candidate.description}
                              </p>
                            )}

                            {applicant.candidate.email && (
                              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-moss">
                                <Mail size={13} />
                                {applicant.candidate.email}
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={() => messageApplicant(opportunity.id, applicant.candidate.id)}
                              disabled={messagingCandidateId === applicant.candidate.id}
                              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-ink px-3 text-xs font-bold text-white transition hover:bg-moss disabled:opacity-60"
                            >
                              {messagingCandidateId === applicant.candidate.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <MessageCircle size={13} />
                              )}
                              Enviar mensaje
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-white p-3 shadow-soft">
      <p className="text-xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink/60">{label}</p>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  busy,
  onClick
}: {
  label: string;
  icon: React.ReactNode;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? <Loader2 size={17} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
function DecisionButtons({
  busy,
  onAccept,
  onReject
}: {
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Botón de Rechazo (Semáforo Rojo) */}
      <button
        type="button"
        disabled={busy}
        onClick={onReject}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-coral/30 bg-coral/5 px-3 text-xs font-bold text-coral transition hover:bg-coral hover:text-white disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : "✕"}
        Rechazar
      </button>

      {/* Botón de Aceptar Match (Semáforo Verde) */}
      <button
        type="button"
        disabled={busy}
        onClick={onAccept}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-moss px-3 text-xs font-bold text-white transition hover:bg-ink shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : "✓"}
        Aceptar Match
      </button>
    </div>
  );
}