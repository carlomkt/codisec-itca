# Deploy API (Render) + Frontend (Netlify)

## Backend (Render)

1. Crea un repo con este proyecto o usa el existente.
2. En Render, usa el Blueprint (IaC):
   - Conecta tu repo
   - Selecciona `render.yaml`
   - Provisionará:
     - Web Service: `codisec-api` (Node)
     - Database: `codisec-db` (Postgres)
   - Durante build:
     - `npm ci && npx prisma generate && npx prisma migrate deploy && npx tsc -p tsconfig.node.json`
   - Start: `node dist-server/server/index.js`
3. Tras el deploy, Render te dará una URL pública, p.ej. `https://codisec-api.onrender.com`

## Frontend (Netlify)

1. Ve a Netlify > Site Settings > Build & deploy > Environment
2. Añade variable:
   - `VITE_API_URL = https://codisec-api.onrender.com`
3. Redeploy del sitio (Preview o Production).

## Local Dev
- `npm run dev` - Vite + API local (SQLite). 
- Asegura que el puerto 5175 esté libre.

## Notas
- Catálogos: `/config/catalog`. 
- Tokens: `GET /api/dev-token` en dev; en prod usa `/api/login`.
- Si Render duerme en plan free, el primer llamado puede demorar.