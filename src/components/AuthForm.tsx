"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, Sparkles, Target, ShieldCheck, Zap } from "lucide-react";

type Mode = "login" | "register";
type Role = "CANDIDATE" | "PUBLISHER";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NUEVOS ESTADOS LABORALES ACTUALIZADOS
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentRole, setCurrentRole] = useState(""); // ◄--- Puesto actual

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        // ENVIAR NUEVOS CAMPOS SOLO SI ES REGISTRO Y CANDIDATO
        ...(mode === "register" && role === "CANDIDATE" && {
          isCurrentlyWorking,
          currentCompany: isCurrentlyWorking ? currentCompany : "",
          currentRole: isCurrentlyWorking ? currentRole : "" // ◄--- Manda el cargo al backend
        }),
        anonymousToken:
          mode === "register"
            ? window.localStorage.getItem("matchops.session") ?? undefined
            : undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "No se pudo completar la operación.");
      setLoading(false);
      return;
    }
// Guardar la respuesta exitosa en el localStorage antes de redirigir
     if (data.user) {
      window.localStorage.setItem("matchops.session", data.token || data.user.id || "");
      window.localStorage.setItem("matchops.role", data.user.role || "CANDIDATE");
      window.localStorage.setItem("matchops.isWorking", String(data.user.isCurrentlyWorking ?? false));
      window.localStorage.setItem("matchops.company", data.user.currentCompany ?? "");
      window.localStorage.setItem("matchops.roleJob", data.user.currentRole ?? "");
    }

    // Tu línea original que redirige al usuario se queda quieta abajo:
    window.location.href = data.user.role === "PUBLISHER" ? "/publisher" : "/";
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* PANEL LATERAL DECORATIVO */}
      <div className="relative hidden overflow-hidden bg-ink px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(110,168,216,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(59,130,196,0.35), transparent 50%)"
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 backdrop-blur">
            <Sparkles size={20} />
          </div>
          <p className="text-lg font-bold tracking-tight">MatchOps</p>
        </div>

        <div className="relative">
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight tracking-tight">
            El match correcto entre talento y oportunidad
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Miles de candidatos y empresas ya usan MatchOps para encontrarse más rápido.
          </p>

          <div className="mt-8 space-y-4">
            <SidePoint icon={Target} text="Matching inteligente según tus intereses reales" />
            <SidePoint icon={Zap} text="Postulación en un clic, sin fricciones" />
            <SidePoint icon={ShieldCheck} text="Reputación transparente para ambas partes" />
          </div>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} MatchOps</p>
      </div>

      {/* PANEL DEL FORMULARIO */}
      <div className="grid place-items-center bg-mist px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-soft">
        <div className="mb-5">
          <p className="text-sm font-semibold text-moss">MatchOps</p>
          <h1 className="mt-1 text-2xl font-bold text-ink tracking-tight">
            {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            {mode === "login"
              ? "Ingresa para ver tus oportunidades."
              : "Empieza a recibir matches en minutos."}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-lg border border-line bg-mist p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`h-10 rounded-md text-sm font-medium ${
              mode === "login" ? "bg-white text-ink shadow-sm" : "text-ink/60"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`h-10 rounded-md text-sm font-medium ${
              mode === "register" ? "bg-white text-ink shadow-sm" : "text-ink/60"
            }`}
          >
            Registro
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Nombre</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
                placeholder="Tu nombre"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Correo</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
              placeholder="correo@ejemplo.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Contraseña
            </span>
            <input
              required
              type="password"
              minLength={mode === "register" ? 8 : 1}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
              placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
            />
          </label>

          {mode === "register" ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Tipo de cuenta
              </span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss"
              >
                <option value="CANDIDATE">Candidato</option>
                <option value="PUBLISHER">Publicador</option>
              </select>
            </label>
          ) : null}

          {/* SECCIÓN DE PREGUNTAS LABORALES MEJORADA (CONDICIONAL) */}
          {mode === "register" && role === "CANDIDATE" ? (
            <div className="space-y-3 rounded-lg border border-line bg-mist/50 p-3 mt-4">
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={isCurrentlyWorking}
                  onChange={(event) => {
                    setIsCurrentlyWorking(event.target.checked);
                    if (!event.target.checked) {
                      setCurrentCompany("");
                      setCurrentRole("");
                    }
                  }}
                  className="h-4 w-4 rounded border-line text-moss focus:ring-moss"
                />
                <span className="text-sm font-medium text-ink">
                  ¿Estás trabajando actualmente?
                </span>
              </label>

              {/* Muestra dónde trabaja y el puesto si el checkbox está marcado */}
              {isCurrentlyWorking ? (
                <div className="space-y-3 pt-2 border-t border-line/60 animate-fadeIn">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/70">
                      ¿En qué empresa o lugar trabajas?
                    </span>
                    <input
                      required={isCurrentlyWorking}
                      value={currentCompany}
                      onChange={(event) => setCurrentCompany(event.target.value)}
                      className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss bg-white"
                      placeholder="Ej: Banco de la Nación, Empresa XYZ"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/70">
                      ¿De qué estás trabajando? (Tu cargo/puesto)
                    </span>
                    <input
                      required={isCurrentlyWorking}
                      value={currentRole}
                      onChange={(event) => setCurrentRole(event.target.value)}
                      className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-moss bg-white"
                      placeholder="Ej: Asistente de Sistemas, Analista, Chef"
                    />
                  </label>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
            Continuar
          </button>
        </form>
      </section>
      </div>
    </main>
  );
}

function SidePoint({
  icon: Icon,
  text
}: {
  icon: typeof Target;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10">
        <Icon size={16} />
      </div>
      <p className="text-sm text-white/80">{text}</p>
    </div>
  );
}