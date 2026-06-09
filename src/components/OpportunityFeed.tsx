"use client";

import { useEffect, useMemo, useState } from "react";
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
  Award
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
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [description, setDescription] = useState("");

        useEffect(() => {
    const existingToken = window.localStorage.getItem("matchops.session");

    // LEER INMEDIATAMENTE LOS DATOS LABORALES GUARDADOS EN EL LOGIN
    const savedWorking = window.localStorage.getItem("matchops.isWorking") === "true";
    const savedCompany = window.localStorage.getItem("matchops.company") ?? "";
    const savedRole = window.localStorage.getItem("matchops.role") ?? "";
    const savedDesc = window.localStorage.getItem("matchops.description") ?? "";
    
    setIsCurrentlyWorking(savedWorking);
    setCurrentCompany(savedCompany);
    setCurrentRole(savedRole);
    setDescription(savedDesc);

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



  // Graba los cambios en la laptop automáticamente cada vez que el usuario escribe
  useEffect(() => {
    window.localStorage.setItem("matchops.isWorking", String(isCurrentlyWorking));
    window.localStorage.setItem("matchops.company", currentCompany);
    window.localStorage.setItem("matchops.role", currentRole);
  }, [isCurrentlyWorking, currentCompany, currentRole]);

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

          {/* PERFIL DEL CANDIDATO LIMPIO */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                C
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink">Perfil del Candidato</h4>
                <p className="text-[10px] text-ink/50">Búsqueda Activa</p>
              </div>
            </div>

            {/* SECCIÓN CORREGIDA: Reemplaza las preguntas por tus textos fijos guardados en localStorage */}
            <div className="space-y-2 text-xs pt-1 border-t border-line/40">
      <div className="flex flex-col gap-1 bg-mist/40 p-2 rounded-lg border border-line/50 relative group">
  <span className="text-ink/60 font-medium text-[11px]">Estado Laboral Actual:</span>
  <div className="flex items-center justify-between gap-2">
    <span className={`font-bold ${isCurrentlyWorking ? 'text-blue-600' : 'text-amber-600'}`}>
      {isCurrentlyWorking ? `Trabajando en: ${currentCompany}` : "Disponible para Trabajar"}
    </span>
    
    {/* EL BOTÓN AHORA ES CONDICIONAL: Solo aparece si realmente necesitas usarlo, no estorba al iniciar sesión */}
    <button
      type="button"
      onClick={async () => {
        if (isCurrentlyWorking) {
          const confirmar = window.confirm("¿Tu contrato finalizó? Haz clic en Aceptar para pasar este empleo a tu historial de experiencia.");
          if (confirmar) {
            const experienciaPasada = `\n• Ex-${currentRole} en ${currentCompany}.`;
            const nuevaDesc = description + experienciaPasada;
            setDescription(nuevaDesc);
            setIsCurrentlyWorking(false);
            setCurrentCompany("");
            setCurrentRole("");
            window.localStorage.setItem("matchops.description", nuevaDesc);
            await fetch(`/api/auth/update-profile`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, isCurrentlyWorking: false, currentCompany: null, currentRole: null, description: nuevaDesc })
            });
          }
        } else {
          const empresa = prompt("¿En qué empresa empezaste a trabajar?");
          const cargo = prompt("¿Cuál es tu nuevo cargo / puesto?");
          if (empresa && cargo) {
            setIsCurrentlyWorking(true);
            setCurrentCompany(empresa);
            setCurrentRole(cargo);
            await fetch(`/api/auth/update-profile`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, isCurrentlyWorking: true, currentCompany: empresa, currentRole: cargo })
            });
          }
        }
      }}
      className="text-[9px] bg-ink text-white font-bold px-1.5 py-0.5 rounded hover:bg-moss transition-opacity opacity-0 group-hover:opacity-100 shrink-0"
    >
      Modificar
    </button>
  </div>
  {isCurrentlyWorking && currentRole && (
    <span className="text-[10px] text-ink/50 font-medium mt-0.5">
      Cargo: {currentRole}
    </span>
  )}
</div>

               {/* Si el usuario está laborando, renderiza la empresa y puesto */}
              {isCurrentlyWorking && (
                <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] space-y-1">
                  <p className="text-ink/70"><strong className="text-ink">Empresa:</strong> {currentCompany || "No especificada"}</p>
                  <p className="text-ink/70"><strong className="text-ink">Puesto / Cargo:</strong> {currentRole || "No especificado"}</p>
                </div>
              )}

              {/* SECCIÓN DINÁMICA DE TU DESCRIPCIÓN REAL */}
              <div className="mt-3 pt-2.5 border-t border-line/40 space-y-2">
                <span className="block text-[10px] font-bold text-ink/60 uppercase tracking-wider">Tu Descripción & Logros</span>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-line/60 text-[11px] text-ink/75 leading-relaxed font-medium">
                  {description || "Haz clic en el botón de abajo para redactar tu descripción profesional real."}
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    const nuevaDesc = prompt("Escribe tu descripción profesional real (Carrera, experiencia, habilidades):", description);
                    if (nuevaDesc !== null) {
                      setDescription(nuevaDesc);
                      window.localStorage.setItem("matchops.description", nuevaDesc);
                    }
                  }}
                  className="w-full text-center text-[11px] font-bold bg-ink text-white py-2 rounded-lg hover:bg-moss transition-colors shadow-sm"
                >
                  {!description ? "+ Crear Descripción" : "📝 Editar Descripción"}
                </button>
              </div>

              {/* MIS MATCHES ACTIVOS EN TIEMPO REAL */}
              <div className="mt-3 pt-2.5 border-t border-line/40">
                <span className="block text-[10px] font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                  Mis Matches Activos ({initialOpportunities.filter(op => op.matchScore >= 80).slice(0, 3).length})
                </span>
                <div className="space-y-1.5">
                  {initialOpportunities.filter(op => op.matchScore >= 80).slice(0, 3).map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] shadow-sm">
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
                    <p className="text-[11px] text-ink/40 italic bg-gray-50 p-2 rounded border text-center">
                      Aún no has hecho match con ninguna empresa. ¡Dale a Aplicar!
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-2 border border-line mt-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink/60 font-medium">Calibración de Intereses:</span>
                <span className="font-bold text-emerald-600 animate-pulse">● Activo</span>
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
              className="h-11 w-full bg-transparent text-sm outline-none text-ink"
              placeholder="Ej. React, Python, Remoto..."
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

                    <h2 className="mt-3.5 text-xl font-bold text-ink tracking-tight hover:text-moss transition cursor-pointer">
                      {opportunity.title}
                    </h2>
                    
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

                    <p className="mt-4 text-sm leading-relaxed text-ink/75">
                      {opportunity.description}
                    </p>

                    {opportunity.tags && opportunity.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {opportunity.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-moss/10 px-3 py-1 text-xs font-medium text-moss"
                          >
                            #{tag.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    {opportunity.compensation && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mist px-3 py-2 text-sm font-semibold text-ink">
                        <DollarSign size={15} />
                        {opportunity.compensation}
                      </div>
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