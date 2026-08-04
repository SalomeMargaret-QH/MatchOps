import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-ink text-white shadow-soft">
          <Sparkles size={24} />
        </div>
        <h1 className="mt-6 text-6xl font-extrabold tracking-tight text-ink">404</h1>
        <p className="mt-2 text-lg font-semibold text-ink">Esta página no existe</p>
        <p className="mt-1 text-sm text-ink/55">
          Puede que la oferta haya sido eliminada o el enlace esté mal escrito.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-bold text-white transition hover:bg-moss"
        >
          <ArrowLeft size={16} />
          Volver a MatchOps
        </a>
      </div>
    </main>
  );
}
