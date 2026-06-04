# Despliegue de MatchOps Web

Esta guía despliega MatchOps en Vercel con PostgreSQL administrado en la nube.

## 1. Antes de desplegar

No uses el PostgreSQL de Docker para producción. Docker solo sirve para desarrollo local. Para producción necesitas una base PostgreSQL en la nube, por ejemplo Neon, Supabase o Prisma Postgres.

Vercel recomienda conectar bases de datos desde su Marketplace de Storage. Las integraciones de Postgres disponibles incluyen Neon, Supabase y AWS Aurora Postgres; al conectarlas, Vercel puede inyectar las variables de entorno del proyecto automáticamente.

## 2. Subir el proyecto a GitHub

Desde la carpeta del proyecto:

```powershell
cd C:\Users\Tilina\Desktop\matchops-web
git init
git add .
git commit -m "Initial MatchOps web deploy"
```

Crea un repositorio vacío en GitHub y luego ejecuta los comandos que GitHub te muestre. Normalmente será algo como:

```powershell
git branch -M main
git remote add origin https://github.com/TU_USUARIO/matchops-web.git
git push -u origin main
```

## 3. Crear proyecto en Vercel

1. Entra a Vercel.
2. Crea un nuevo proyecto.
3. Importa el repositorio `matchops-web`.
4. Framework: Next.js.
5. Build command: `npm run build`.
6. Install command: `npm install`.

## 4. Crear PostgreSQL en la nube

Opción recomendada:

1. En Vercel, entra al proyecto.
2. Ve a Storage o Marketplace.
3. Crea o conecta una base PostgreSQL, por ejemplo Neon o Supabase.
4. Asegúrate de que exista una variable llamada `DATABASE_URL`.

Si creas la base fuera de Vercel, copia su connection string y agrégala manualmente en:

```txt
Vercel Project > Settings > Environment Variables
```

Variables necesarias:

```env
DATABASE_URL="postgresql://USUARIO:CLAVE@HOST:PUERTO/DB?sslmode=require"
NEXT_PUBLIC_APP_URL="https://TU-DOMINIO.vercel.app"
```

## 5. Crear tablas en producción

Cuando ya tengas el `DATABASE_URL` de producción, aplica el schema de Prisma:

```powershell
cd C:\Users\Tilina\Desktop\matchops-web
$env:DATABASE_URL="postgresql://USUARIO:CLAVE@HOST:PUERTO/DB?sslmode=require"
npx prisma db push
npx prisma db seed
```

El seed es opcional. Sirve para crear oportunidades demo.

## 6. Desplegar

En Vercel:

1. Ve a Deployments.
2. Lanza un nuevo deployment o haz `git push`.
3. Espera a que termine el build.

También puedes desplegar con CLI:

```powershell
npx vercel
npx vercel --prod
```

## 7. Verificar

Abre estas rutas:

```txt
https://TU-DOMINIO.vercel.app
https://TU-DOMINIO.vercel.app/auth
https://TU-DOMINIO.vercel.app/publisher
https://TU-DOMINIO.vercel.app/api/health
```

## 8. Errores comunes

Si aparece error de Prisma durante el build:

```txt
Prisma Client did not initialize
```

Verifica que el script `build` sea:

```json
"build": "prisma generate && next build"
```

Si aparece error de base de datos:

```txt
Can't reach database server
```

Revisa que `DATABASE_URL` esté en Vercel y que incluya SSL si tu proveedor lo requiere.

Si el sitio abre pero no hay oportunidades, ejecuta:

```powershell
npx prisma db seed
```
