"use client";

import { useEffect, useMemo, useState } from "react";
import { NotificationCenter } from "@/components/NotificationCenter";
import {
  Bookmark,
  Check,
  Filter,
  LogIn,
  Loader2,
  Search,
  Sparkles,
  X,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Award,
  Pencil,
  Save,
  BadgeCheck,
  ExternalLink,
  MessageCircle
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
  applicationUrl: string | null;
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
  const [workModeFilter, setWorkModeFilter] = useState<"" | "REMOTE" | "HYBRID" | "ONSITE">("");
  const [locationFilter, setLocationFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [reputationPoints, setReputationPoints] = useState(0);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [description, setDescription] = useState("");
  const [editingWork, setEditingWork] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [workDraft, setWorkDraft] = useState({ isCurrentlyWorking: false, company: "", role: "" });
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    // El servidor ya garantiza que solo llegamos aquí con sesión válida (cookie httpOnly).
    // Solo leemos el token local para efectos de UI (mostrar botones, refrescar el feed).
    const existingToken = window.localStorage.getItem("matchops.session");

    if (existingToken) {
      setToken(existingToken);
      refresh(existingToken);
    }

    // Cargamos el perfil real guardado en el servidor (antes se perdía al recargar la página)
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => {
        if (!data.user) return;
        setCandidateName(data.user.name ?? "");
        setReputationPoints(data.user.reputationPoints ?? 0);
        setIsCurrentlyWorking(Boolean(data.user.isCurrentlyWorking));
        setCurrentCompany(data.user.currentCompany ?? "");
        setCurrentRole(data.user.currentRole ?? "");
        setDescription(data.user.description ?? "");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) return;
    const timeout = setTimeout(() => {
      refresh(token, { workMode: workModeFilter, location: locationFilter });
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workModeFilter, locationFilter, token]);

  async function saveWorkStatus() {
    setSavingProfile(true);
    const payload = {
      isCurrentlyWorking: workDraft.isCurrentlyWorking,
      currentCompany: workDraft.isCurrentlyWorking ? workDraft.company : null,
      currentRole: workDraft.isCurrentlyWorking ? workDraft.role : null
    };
    await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setIsCurrentlyWorking(payload.isCurrentlyWorking);
    setCurrentCompany(payload.currentCompany ?? "");
    setCurrentRole(payload.currentRole ?? "");
    setSavingProfile(false);
    setEditingWork(false);
  }

  async function saveDescription() {
    setSavingProfile(true);
    await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: descriptionDraft })
    });
    setDescription(descriptionDraft);
    setSavingProfile(false);
    setEditingDescription(false);
  }

  async function refresh(sessionToken: string, filters?: { workMode?: string; location?: string }) {
    const params = new URLSearchParams({ token: sessionToken });
    const activeWorkMode = filters?.workMode ?? workModeFilter;
    const activeLocation = filters?.location ?? locationFilter;
    if (activeWorkMode) params.set("workMode", activeWorkMode);
    if (activeLocation.trim()) params.set("location", activeLocation.trim());

    const response = await fetch(`/api/opportunities?${params.toString()}`);
    const data = await response.json();
    setOpportunities(data.opportunities);
  }

  async function interact(opportunityId: string, type: "ACCEPT" | "IGNORE" | "SAVE") {
    setBusyId(opportunityId);
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(token ? { token } : {}),
        opportunityId,
        type,
        dwellTimeSeconds: 4
      })
    });
    await refresh(token ?? "");
    setBusyId(null);
  }

  async function startConversation(opportunityId: string) {
    setMessagingId(opportunityId);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId })
      });
      const data = await response.json();
      if (response.ok) {
        window.location.href = `/mensajes?conversationId=${data.conversation.id}`;
      }
    } finally {
      setMessagingId(null);
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-moss text-white";
    if (score >= 50) return "bg-ink text-white";
    return "bg-coral text-white";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-moss";
    if (score >= 50) return "bg-ink";
    return "bg-coral";
  };

  return (
  <main className="min-h-screen bg-mist/85">
    {/* 1. CABECERA CONDICIONAL INTELIGENTE */}
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white shadow-md">
            <Sparkles size={20} aria-hidden />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-ink tracking-tight">MatchOps</p>
            <p className="text-xs font-medium text-ink/50">Plataforma de Matching de Empleo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter />
          <a
            href="/postulaciones"
            className="hidden h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-mist sm:inline-flex"
          >
            <Briefcase size={16} />
            Mis postulaciones
          </a>
          <a
            href="/mensajes"
            className="hidden h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-mist sm:inline-flex"
          >
            <MessageCircle size={16} />
            Mensajes
          </a>
          {/* Oculta Entrar y Publicar si el usuario ya inició sesión (token activo) */}
          {!token ? (
            <>
              <a
                href="/auth"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-mist"
              >
                <LogIn size={16} />
                Entrar
              </a>
              <a
                href="/publisher"
                className="hidden h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-moss sm:inline-flex shadow-sm"
              >
                Publicar Vacante
              </a>
            </>
          ) : (
            /* Botón para cerrar sesión si ya estás dentro */
            <button
  onClick={async () => {
    // 1. Apagamos inmediatamente todos los estados de React en la laptop
    setToken(null);
    setIsCurrentlyWorking(false);
    setCurrentCompany("");
    setCurrentRole("");
    setDescription("");

    // 2. Avisamos al servidor de Next.js para romper la sesión en Prisma
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error al salir:", e);
    }
    
    // 3. Limpiamos la memoria local por completo
    window.localStorage.clear();
    
    // 4. Redirigimos de forma limpia a la pantalla de entrada
    window.location.href = "/auth";
  }}
  className="text-xs font-bold text-coral hover:underline px-2 transition-all"
>
  Cerrar Sesión
</button>
          )}
        </div>
      </div>
    </header>

    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        {/* PANEL DE BARRA LATERAL (CANDIDATO EXCLUSIVO) */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Tu Cuenta Activa</span>
          </div>

          {/* PERFIL DEL CANDIDATO */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-base font-bold text-white shadow-sm">
                {candidateName
                  ? candidateName
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("")
                  : "C"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold text-ink">
                  {candidateName || "Tu perfil"}
                </h4>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-gold">
                  <BadgeCheck size={12} />
                  {reputationPoints} pts de reputación
                </span>
              </div>
            </div>

            {/* ESTADO LABORAL */}
            <div className="rounded-lg border border-line/60 bg-mist/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">
                  Estado laboral
                </span>
                {!editingWork && (
                  <button
                    type="button"
                    onClick={() => {
                      setWorkDraft({
                        isCurrentlyWorking,
                        company: currentCompany,
                        role: currentRole
                      });
                      setEditingWork(true);
                    }}
                    className="text-ink/40 transition hover:text-moss"
                    title="Editar estado laboral"
                  >
                    <Pencil size={13} />
                  </button>
                )}
              </div>

              {!editingWork ? (
                <>
                  <p className={`mt-1.5 text-sm font-bold ${isCurrentlyWorking ? "text-moss" : "text-gold"}`}>
                    {isCurrentlyWorking ? "Trabajando actualmente" : "Disponible para trabajar"}
                  </p>
                  {isCurrentlyWorking && (currentCompany || currentRole) && (
                    <p className="mt-1 text-xs text-ink/60">
                      {currentRole || "Sin cargo especificado"}
                      {currentCompany ? ` · ${currentCompany}` : ""}
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-ink">
                    <input
                      type="checkbox"
                      checked={workDraft.isCurrentlyWorking}
                      onChange={(event) =>
                        setWorkDraft({ ...workDraft, isCurrentlyWorking: event.target.checked })
                      }
                      className="h-3.5 w-3.5 rounded border-line text-moss focus:ring-moss"
                    />
                    Estoy trabajando actualmente
                  </label>

                  {workDraft.isCurrentlyWorking && (
                    <>
                      <input
                        value={workDraft.company}
                        onChange={(event) =>
                          setWorkDraft({ ...workDraft, company: event.target.value })
                        }
                        placeholder="Empresa"
                        className="h-8 w-full rounded-md border border-line bg-white px-2 text-xs outline-none focus:border-moss"
                      />
                      <input
                        value={workDraft.role}
                        onChange={(event) => setWorkDraft({ ...workDraft, role: event.target.value })}
                        placeholder="Cargo / puesto"
                        className="h-8 w-full rounded-md border border-line bg-white px-2 text-xs outline-none focus:border-moss"
                      />
                    </>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveWorkStatus}
                      disabled={savingProfile}
                      className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-ink text-xs font-bold text-white transition hover:bg-moss disabled:opacity-60"
                    >
                      {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingWork(false)}
                      className="h-8 rounded-md border border-line px-3 text-xs font-semibold text-ink/60 transition hover:bg-mist"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPCIÓN PROFESIONAL */}
            <div className="rounded-lg border border-line/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">
                  Descripción profesional
                </span>
                {!editingDescription && (
                  <button
                    type="button"
                    onClick={() => {
                      setDescriptionDraft(description);
                      setEditingDescription(true);
                    }}
                    className="text-ink/40 transition hover:text-moss"
                    title="Editar descripción"
                  >
                    <Pencil size={13} />
                  </button>
                )}
              </div>

              {!editingDescription ? (
                <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
                  {description || "Aún no has escrito tu descripción profesional. Cuéntale a las empresas sobre tu experiencia y habilidades."}
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={descriptionDraft}
                    onChange={(event) => setDescriptionDraft(event.target.value)}
                    rows={4}
                    placeholder="Carrera, experiencia, habilidades..."
                    className="w-full resize-none rounded-md border border-line px-2 py-1.5 text-xs leading-relaxed outline-none focus:border-moss"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveDescription}
                      disabled={savingProfile}
                      className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-ink text-xs font-bold text-white transition hover:bg-moss disabled:opacity-60"
                    >
                      {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDescription(false)}
                      className="h-8 rounded-md border border-line px-3 text-xs font-semibold text-ink/60 transition hover:bg-mist"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MIS MATCHES ACTIVOS EN TIEMPO REAL */}
            <div className="border-t border-line/40 pt-3">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink/50">
                Mis Matches Activos ({initialOpportunities.filter(op => op.matchScore >= 80).slice(0, 3).length})
              </span>
              <div className="space-y-1.5">
                {initialOpportunities.filter(op => op.matchScore >= 80).slice(0, 3).map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-2 rounded-lg bg-moss/8 border border-moss/20 text-[11px] shadow-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink truncate">{match.title}</p>
                      <p className="text-[10px] text-ink/50 truncate">{match.publisher.name || "Empresa Confidencial"}</p>
                    </div>
                    <span className="ml-2 shrink-0 bg-ink text-white font-extrabold px-1.5 py-0.5 rounded text-[9px]">
                      {match.matchScore}%
                    </span>
                  </div>
                ))}
                {initialOpportunities.filter(op => op.matchScore >= 80).slice(0, 3).length === 0 && (
                  <p className="text-[11px] text-ink/40 italic bg-mist p-2 rounded border border-line text-center">
                    Aún no has hecho match con ninguna empresa. ¡Dale a Aplicar!
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-mist p-2 border border-line">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink/60 font-medium">Calibración de Intereses:</span>
                <span className="font-bold text-moss animate-pulse">● Activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* BUSCADOR DE OPORTUNIDADES */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
          <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="search">
            Buscar oportunidades
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-mist px-3 focus-within:border-moss transition">
            <Search size={17} aria-hidden className="text-ink/40" />
           <input
  id="search"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
  autoComplete="off" // ◄--- PEGA ESTA LÍNEA AQUÍ
  className="h-11 w-full bg-transparent text-sm outline-none text-ink"
  placeholder="Ej. React, Python, Remoto..."
/>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              value={workModeFilter}
              onChange={(event) =>
                setWorkModeFilter(event.target.value as typeof workModeFilter)
              }
              className="h-10 rounded-lg border border-line bg-white px-2.5 text-sm text-ink outline-none focus:border-moss"
            >
              <option value="">Toda modalidad</option>
              <option value="REMOTE">Remoto</option>
              <option value="HYBRID">Híbrido</option>
              <option value="ONSITE">Presencial</option>
            </select>
            <input
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              placeholder="Ubicación"
              className="h-10 rounded-lg border border-line bg-white px-2.5 text-sm text-ink outline-none focus:border-moss"
            />
          </div>
        </div>

        {/* PERFIL IMPLÍCITO */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider text-xs">Perfil Implícito</h2>
            <Filter size={17} aria-hidden className="text-moss" />
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-line">
            <div className="h-full w-3/4 rounded-full bg-moss" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink/60">
            El sistema analiza tus interacciones en tiempo real para calibrar automáticamente tu nivel de afinidad con las vacantes.
          </p>
        </div>

        {bestMatch ? (
          <div className="rounded-xl border border-line p-5 shadow-md bg-ink text-white">
            <p className="text-xs font-bold uppercase tracking-widest opacity-75">Tu mejor recomendación</p>
            <p className="mt-2 text-4xl font-extrabold">{bestMatch.matchScore}%</p>
            <p className="mt-2 text-sm font-medium line-clamp-2 opacity-90">{bestMatch.title}</p>
          </div>
        ) : null}
      </aside>


        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center shadow-soft">
              <p className="text-sm font-medium text-ink/50">No se encontraron ofertas que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            filtered.map((opportunity) => (
              <article
                key={opportunity.id}
                className="rounded-xl border border-line bg-white p-5 shadow-soft hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-line">
                  <div 
                    className={`h-full ${getScoreBarColor(opportunity.matchScore)}`} 
                    style={{ width: `${opportunity.matchScore}%` }}
                  />
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between pt-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${getScoreColor(opportunity.matchScore)} shadow-sm`}>
                        {opportunity.matchScore}% de Match
                      </span>
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

                    <a href={`/oportunidad/${opportunity.id}`}>
                      <h2 className="mt-3.5 text-xl font-bold text-ink tracking-tight hover:text-moss transition cursor-pointer">
                        {opportunity.title}
                      </h2>
                    </a>
                    
                    <div className="mt-1 flex items-center gap-4 text-xs text-ink/50">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Building2 size={13} />
                        {opportunity.publisher.name ?? "Empresa Confidencial"}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-moss">
                        <Award size={13} />
                        Reputación: {opportunity.publisher.reputationPoints} pts
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-ink/75 line-clamp-3">
                      {opportunity.description}
                    </p>

                    {opportunity.tags && opportunity.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {opportunity.tags.slice(0, 6).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-moss/10 px-3 py-1 text-xs font-medium text-moss"
                          >
                            #{tag.toLowerCase()}
                          </span>
                        ))}
                        {opportunity.tags.length > 6 && (
                          <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink/50">
                            +{opportunity.tags.length - 6} más
                          </span>
                        )}
                      </div>
                    )}

                    {opportunity.compensation && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mist px-3 py-2 text-sm font-semibold text-ink">
                        <DollarSign size={15} />
                        {opportunity.compensation}
                      </div>
                    )}

                    {opportunity.applicationUrl && (
                      <a
                        href={opportunity.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-moss hover:text-ink hover:underline"
                      >
                        <ExternalLink size={14} />
                        Ver más detalles / postular en el sitio
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col">
                    <button
                      type="button"
                      title="Ignorar"
                      onClick={() => interact(opportunity.id, "IGNORE")}
                      className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-coral transition hover:bg-coral/5 hover:border-coral shadow-sm"
                      disabled={busyId === opportunity.id}
                    >
                      {busyId === opportunity.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <X size={18} />
                      )}
                    </button>

                    <button
                      type="button"
                      title="Guardar"
                      onClick={() => interact(opportunity.id, "SAVE")}
                      className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-ink/60 transition hover:bg-mist hover:text-ink shadow-sm"
                      disabled={busyId === opportunity.id}
                    >
                      <Bookmark size={18} />
                    </button>

                    <button
                      type="button"
                      title="Enviar mensaje"
                      onClick={() => startConversation(opportunity.id)}
                      className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-moss transition hover:bg-moss/5 hover:border-moss shadow-sm"
                      disabled={messagingId === opportunity.id}
                    >
                      {messagingId === opportunity.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <MessageCircle size={18} />
                      )}
                    </button>

                    <button
                      type="button"
                      title="Postular / Aceptar"
                      onClick={() => interact(opportunity.id, "ACCEPT")}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-ink px-4 text-sm font-bold text-white transition hover:bg-moss shadow-sm"
                      disabled={busyId === opportunity.id}
                    >
                      {busyId === opportunity.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={16} />
                          Aplicar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}