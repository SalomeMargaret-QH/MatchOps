# Mejoras aplicadas a MatchOps

Este documento resume lo que cambió respecto al repo original. Los cambios de
código están hechos para que puedas copiar/pegar los archivos directamente
sobre tu repo actual (o reemplazarlo entero).

## 🔴 Crítico

1. **Repo reducido de 944 MB a ~700 KB.**
   El zip ya NO incluye `.npm-cache/` (1,600 archivos de caché de npm que
   estaban commiteados) ni `reporte-k6.json` (15 MB). Ahora `.gitignore`
   los excluye explícitamente.

   ⚠️ **Importante:** esto limpia el *contenido* que copies de aquí en
   adelante, pero el historial de tu repo en GitHub sigue teniendo esos
   archivos pesados en commits viejos. Para limpiar el historial también,
   corre esto una vez (después de hacer un backup):

   ```bash
   pip install git-filter-repo
   git filter-repo --path .npm-cache --invert-paths
   git filter-repo --path reporte-k6.json --invert-paths
   git push origin --force --all
   ```

   Si el repo es nuevo y nadie más lo clonó, la alternativa más simple es
   borrar `.git`, reemplazar los archivos con este zip, y hacer
   `git init` + primer commit limpio.

2. **`test-bd-k6.js` (vacío) fue eliminado.**

3. **Validación de Zod ahora devuelve 400 con detalle, no 500 genérico.**
   Nuevo archivo `src/lib/api-handler.ts` con dos helpers:
   - `withValidation(schema, handler)` para rutas con body y sin params
     dinámicos (login, register, interactions, publisher opportunities POST).
   - `parseJsonWithSchema(request, schema)` para rutas con `[id]` en la
     URL (PATCH de oportunidad, mensajes, crear conversación).

   Se actualizaron estos archivos para usarlos:
   - `src/app/api/auth/login/route.ts`
   - `src/app/api/auth/register/route.ts`
   - `src/app/api/interactions/route.ts`
   - `src/app/api/publisher/opportunities/route.ts`
   - `src/app/api/publisher/opportunities/[id]/route.ts`
   - `src/app/api/conversations/route.ts`
   - `src/app/api/conversations/[id]/messages/route.ts`

## 🟡 Importante

4. **Fix de timing attack en login.**
   `src/lib/password.ts` ahora exporta `DUMMY_HASH_FOR_TIMING`. En
   `login/route.ts`, si el correo no existe, igual se corre `scrypt`
   contra ese hash señuelo, para que la respuesta tarde lo mismo con o
   sin cuenta registrada (evita que alguien detecte correos válidos
   midiendo el tiempo de respuesta).

5. **Tests para `matching.ts`.**
   Nuevo `src/lib/matching.test.ts` con 12 casos: score neutral sin
   perfil, score perfecto, penalización por trabajar en la misma
   empresa, normalización de tags, límites de `updateProfileSignals`,
   etc. Corre con:
   ```bash
   npm install
   npm run db:generate   # matching.ts usa tipos de @prisma/client
   npm test
   ```

6. **CI básico con GitHub Actions.**
   Nuevo `.github/workflows/ci.yml`: en cada push/PR a `main` corre
   `npm ci`, `prisma generate`, `lint`, `test` y `build`. Ajusta el
   `DATABASE_URL` placeholder si quieres apuntarlo a una base de datos
   real de pruebas (por ejemplo con un secret de GitHub).

## No incluido (pendiente, a propósito)

- **Rate limiting** en login/register: no lo agregué porque depende de
  tu infraestructura (Upstash Redis si usas Vercel, o un middleware con
  un store en memoria si es un solo servidor). Si quieres, en el próximo
  paso te dejo la versión con `@upstash/ratelimit` lista para Vercel.
- **Dividir `OpportunityFeed.tsx` y `PublisherDashboard.tsx`** (734 y 741
  líneas): no toqué la UI para no arriesgar romper algo sin poder probarlo
  visualmente. Si quieres, lo hacemos en una siguiente pasada con calma.
- **Índices adicionales** en `Interaction(userId, type)` y
  `Message(receiverId, readAt)`: requiere una migración de Prisma nueva
  (`npx prisma migrate dev`) que es mejor que corras tú conectada a tu
  base de datos, para no pisar tus migraciones existentes.
