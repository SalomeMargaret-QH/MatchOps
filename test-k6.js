import http from 'k6/http';
import { sleep, check } from 'k6';

// Configuración del plan de pruebas (Benchmark Oficial)
export const options = {
  stages: [
    { duration: '15s', target: 1 },   // Escenario 1: Carga mínima (1 usuario para establecer línea base)
    { duration: '30s', target: 10 },  // Escenario 2: Carga normal (10 usuarios concurrentes)
    { duration: '1m', target: 200 },  // Escenario 4: Carga alta / Pico (200 usuarios concurrentes a fondo)
    { duration: '15s', target: 0 },   // Desescalado: Bajada controlada de usuarios a cero
  ],
  thresholds: {
    // Si la tasa de errores de conexión supera el 1%, el benchmark marcará alerta técnica
    http_req_failed: ['rate<0.01'], 
    // El 95% de las peticiones normales deberían responder idealmente rápido
    http_req_duration: ['p(95)<3000'], 
  },
};

export default function () {
  // URL oficial de tu aplicación en Vercel
  const url = 'https://match-ops-chi.vercel.app/';
  
  // Ejecutamos la petición GET al endpoint principal
  const res = http.get(url);

  // Verificación del estado HTTP (Asegura que responda con 200 OK y no se caiga)
  check(res, {
    'Conexión exitosa (HTTP 200)': (r) => r.status === 200,
  });

  // Simulación de tiempo de lectura de un Candidato/Publicador (espera de 1 segundo)
  sleep(1);
}
