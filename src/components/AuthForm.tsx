"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

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

    window.location.href = data.user.role === "PUBLISHER" ? "/publisher" : "/";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist/90 px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="mb-5">
          <p className="text-sm font-medium text-moss">MatchOps</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            {mode === "login" ? "Ingresar" : "Crear cuenta"}
          </h1>
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
    </main>
  );
}
