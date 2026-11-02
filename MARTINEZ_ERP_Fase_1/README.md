# MARTÍNEZ ERP — Fase 1

Base independiente para el ERP de Funeraria Martínez.

## Arquitectura
- `frontend/`: React + Vite, interfaz responsive.
- `backend/`: Node.js + Express, API REST.
- PostgreSQL: usuarios y auditoría.
- Autenticación: JWT + bcrypt.
- Despliegue: frontend en Vercel y backend + PostgreSQL en Render.

## Requisitos
- Node.js 20+
- PostgreSQL 14+ (o una instancia administrada en Render)

## Desarrollo local

### 1. Base de datos
Crea una base PostgreSQL llamada `martinez_erp`. Copia `backend/.env.example` a `backend/.env` y configura `DATABASE_URL`.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run db:init
npm run admin:create
npm run dev
```
La API estará en `http://localhost:4000`.

### 3. Frontend
En otra terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
La web estará en `http://localhost:5173`.

## Crear el primer administrador
Configura `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL` y `INITIAL_ADMIN_PASSWORD` en `backend/.env`, luego ejecuta:
```bash
npm run admin:create
```
El comando crea el administrador solo si el correo todavía no existe. Cambia la contraseña inicial después del primer ingreso.

## Despliegue en la nube

### Render
1. Crea una base PostgreSQL en Render.
2. Crea un Web Service desde el repositorio.
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Variables: `DATABASE_URL` (Internal Database URL), `JWT_SECRET`, `FRONTEND_URL`, `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, `NODE_ENV=production`.
7. Al iniciar, la API crea las tablas necesarias si todavía no existen. Después de desplegar, ejecuta `npm run admin:create` desde la Shell de Render para crear el primer administrador.

### Vercel
1. Importa el mismo repositorio.
2. Root Directory: `frontend`
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Variable: `VITE_API_URL=https://TU-BACKEND.onrender.com/api`

## Seguridad y alcance de esta fase
- Las contraseñas se almacenan con bcrypt.
- Los tokens JWT expiran.
- Los endpoints privados requieren autenticación.
- Las acciones de inicio/cierre de sesión y administración de usuarios quedan auditadas.
- CORS limita el acceso al dominio configurado.
- No hay datos de demostración.
- Esta fase es una base funcional; antes de producción se recomienda configurar dominio propio, copias de seguridad automáticas, monitoreo y rotación de secretos.
