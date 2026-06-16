import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50  },  // sube a 50 usuarios
    { duration: '30s', target: 100 },  // sube a 100
    { duration: '30s', target: 0   },  // baja a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  http.get('https://match-ops-chi.vercel.app/');
  sleep(1);
}