import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Términos y condiciones" };

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-mist px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-6 shadow-soft sm:p-8">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-moss">
          <ArrowLeft size={15} />
          Volver a MatchOps
        </a>

        <h1 className="mt-4 text-2xl font-bold text-ink">Términos y condiciones</h1>
        <p className="mt-1 text-xs text-ink/50">Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long" })}</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-ink/75">
          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">1. Sobre MatchOps</h2>
            <p>
              MatchOps es una plataforma que conecta candidatos con oportunidades laborales
              publicadas por terceros. Actuamos como intermediarios tecnológicos; no somos
              empleadores ni garantizamos la veracidad de cada oferta publicada por un
              publicador externo.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">2. Cuentas de usuario</h2>
            <p>
              Eres responsable de mantener la confidencialidad de tu cuenta y de la exactitud
              de la información que compartes en tu perfil. Nos reservamos el derecho de
              suspender cuentas que proporcionen información falsa o hagan un uso indebido de
              la plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">3. Publicación de ofertas</h2>
            <p>
              Los publicadores son responsables del contenido de sus ofertas y de cumplir con
              la legislación laboral vigente. MatchOps puede retirar publicaciones que
              incumplan estos términos o resulten engañosas.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">4. Uso aceptable</h2>
            <p>
              No está permitido usar la plataforma para spam, acoso, discriminación,
              recolección masiva de datos de otros usuarios, ni para publicar ofertas
              fraudulentas.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">5. Cambios en el servicio</h2>
            <p>
              Podemos modificar o discontinuar funciones de la plataforma en cualquier
              momento. Notificaremos cambios relevantes en estos términos cuando corresponda.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">6. Contacto</h2>
            <p>
              Para consultas sobre estos términos, puedes escribirnos a través de los canales
              de contacto disponibles en la plataforma.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
