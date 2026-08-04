export default function PoliticaPrivacidad() {
  return (
    <main className="max-w-4xl mx-auto p-6 py-10">
      <h1 className="text-2xl font-bold mb-4">Política de Privacidad</h1>
      <p className="text-gray-600 mb-6">Última actualización: 4 de agosto de 2026</p>

      <section className="space-y-6 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">1. ¿Quién es el responsable de tus datos?</h2>
          <p>El responsable del tratamiento de tus datos personales es MatchOps, con domicilio en Arequipa, Perú. Al utilizar nuestra plataforma, aceptas las prácticas descritas en esta política.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">2. ¿Qué datos recopilamos?</h2>
          <p>Solo recopilamos la información necesaria para ofrecer el servicio:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Datos de registro: nombre, correo electrónico y contraseña cifrada.</li>
            <li>Datos de perfil: habilidades, preferencias laborales y experiencia que tú decidas compartir.</li>
            <li>Datos de uso: interacciones con oportunidades, búsquedas y preferencias para mejorar el sistema de coincidencias.</li>
            <li>Datos técnicos: dirección IP, tipo de dispositivo y navegador, para garantizar la seguridad y funcionamiento del sitio.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">3. ¿Para qué usamos tus datos?</h2>
          <p>Usamos tu información únicamente para:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Gestionar tu cuenta y autenticación en la plataforma.</li>
            <li>Conectarte con oportunidades y candidatos compatibles.</li>
            <li>Mejorar nuestro algoritmo de emparejamiento y la experiencia de uso.</li>
            <li>Enviarte comunicaciones relacionadas con el servicio, solo si lo autorizas.</li>
            <li>Cumplir con obligaciones legales vigentes en Perú.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">4. ¿Compartimos tus datos?</h2>
          <p>No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales. Solo compartimos información cuando sea estrictamente necesario para el funcionamiento del servicio o por mandato legal.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">5. ¿Cómo protegemos tu información?</h2>
          <p>Aplicamos medidas de seguridad técnicas y organizacionales para proteger tus datos: contraseñas cifradas, conexiones seguras HTTPS y acceso restringido a la información.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">6. Tus derechos</h2>
          <p>Tienes derecho a acceder, corregir, eliminar o limitar el uso de tus datos. Puedes ejercerlos escribiendo a: <strong>contacto@matchops.pe</strong></p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">7. Cambios a esta política</h2>
          <p>Nos reservamos el derecho de actualizar esta política. Cualquier cambio se publicará en esta misma página con la fecha de revisión actualizada.</p>
        </div>
      </section>
    </main>
  );
}