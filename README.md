# MatchOps Web

Base inicial del sitio web de MatchOps: Next.js, TypeScript, Tailwind, Prisma y PostgreSQL.

## Qué incluye

- Feed web MVP conectado a API.
- Panel de publicador en `/publisher`.
- Login y registro en `/auth`.
- Conversión de sesión anónima al registrarse.
- Sesión anónima temporal.
- Modelos de base de datos para usuarios, oportunidades, interacciones, perfil implícito, guardados, conversaciones y mensajes.
- Cálculo inicial de `matchScore`.
- Endpoints base:
  - `POST /api/sessions`
  - `GET /api/opportunities`
  - `POST /api/interactions`
  - `GET /api/publisher/opportunities`
  - `POST /api/publisher/opportunities`
  - `PATCH /api/publisher/opportunities/:id`
  - `GET /api/health`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`

## Primer arranque

```bash
cd matchops-web
copy .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Luego abre:

```txt
http://localhost:3000
```

Panel de publicador:

```txt
http://localhost:3000/publisher
```

Login y registro:

```txt
http://localhost:3000/auth
```

## Próximo bloque recomendado

Después de esta base, conviene construir:

- Registro/login real.
- Conversión de sesión anónima a usuario registrado.
- Guardados persistentes por usuario.
- Mensajería básica.

## Despliegue

Revisa [DEPLOYMENT.md](./DEPLOYMENT.md) para desplegar en Vercel con PostgreSQL en la nube.
