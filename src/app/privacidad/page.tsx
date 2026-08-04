import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Política de privacidad" };

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-mist px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-6 shadow-soft sm:p-8">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-moss">
          <ArrowLeft size={15} />
          Volver a MatchOps
        </a>

        <h1 className="mt-4 text-2xl font-bold text-ink">Política de privacidad</h1>
        <p className="mt-1 text-xs text-ink/50">Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long" })}</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-ink/75">
          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">1. Qué datos recopilamos</h2>
            <p>
              Recopilamos la información que nos das directamente (nombre, correo, cargo
              actual, descripción profesional) y datos derivados de tu actividad en la
              plataforma (ofertas que ves, guardas o a las que postulas) para calcular tu
              compatibilidad con nuevas oportunidades.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">2. Para qué usamos tus datos</h2>
            <p>
              Usamos tus datos para mostrarte oportunidades relevantes, permitir que los
              publicadores vean tu perfil cuando postulas, habilitar la mensajería entre
              candidatos y empresas, y mejorar el funcionamiento de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">3. Con quién compartimos tus datos</h2>
            <p>
              Tu perfil (nombre, cargo actual, descripción, reputación) es visible para el
              publicador de una oferta únicamente cuando postulas a ella. No vendemos tus
              datos a terceros.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">4. Tus derechos</h2>
            <p>
              Puedes actualizar tu perfil en cualquier momento desde tu cuenta. Para solicitar
              la eliminación de tu cuenta y tus datos personales, contáctanos a través de los
              canales disponibles en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 text-base font-bold text-ink">5. Seguridad</h2>
            <p>
              Tu contraseña se almacena de forma cifrada y tu sesión se protege mediante
              cookies seguras. Tomamos medidas razonables para proteger tu información, aunque
              ningún sistema es 100% infalible.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
