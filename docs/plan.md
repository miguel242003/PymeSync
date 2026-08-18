# PymeSync — Plan del Proyecto

## Estado Actual
Milestone 1 y 2 completos: backend de autenticación + multi-tenant desplegado en producción (Oracle Cloud VPS) y probado end-to-end. Pantallas de auth del frontend (Milestone 5, adelantado) implementadas y verificadas en navegador.

### Infraestructura desplegada
- VPS Oracle Cloud (ARM, Ubuntu 24.04) — comparte servidor con una instancia de n8n existente (contenedor Docker, puerto 443 propio, no tocado).
- Backend: Node.js 24 + PM2 (`pymesync-backend`), arranca automático al reiniciar el servidor.
- MySQL 8.0 local, base `pymesync`, usuario `pymesync_app`.
- nginx como reverse proxy: HTTP en puerto 80 (`http://165.1.124.49`) y HTTPS real en puerto 8443 (`https://pymesync.duckdns.org:8443`, certificado Let's Encrypt vía certbot). El 443 estándar no está disponible porque Docker/n8n lo ocupa exclusivamente a nivel de SO.
- Dominio gratuito vía DuckDNS: `pymesync.duckdns.org` → `165.1.124.49`.
- Script de deploy: `src/backend/scripts/deploy.sh` (empaqueta, sube, `npm install`, `prisma db push`, `pm2 restart --update-env`).
- Resend: cuenta con `onboarding@resend.dev` como remitente — **solo entrega a la casilla dueña de la cuenta Resend** hasta que se verifique un dominio propio.

---

## Milestone 1 — Sistema de Autenticación y Autorización

Backend: Node.js + Express + Prisma + MySQL + Resend + JWT (cookie httpOnly).

- [x] Estructura de carpetas del backend (`src/backend/`).
- [x] `schema.prisma` con modelo `User` (email, password, isVerified, verificationToken, resetPasswordToken, resetPasswordExpires).
- [x] Registro (`POST /api/v1/auth/signup`) con hash bcrypt + token de verificación.
- [x] Envío de email de verificación vía Resend.
- [x] Confirmación de cuenta (`GET /api/v1/auth/verify/:token`).
- [x] Login (`POST /api/v1/auth/login`) con bloqueo si `isVerified` es falso, JWT en cookie httpOnly.
- [x] Logout (`POST /api/v1/auth/logout`).
- [x] Middleware `requireAuth` para proteger rutas privadas.
- [x] Forgot password (`POST /api/v1/auth/forgot-password`) con email vía Resend.
- [x] Reset password (`POST /api/v1/auth/reset-password/:token`).
- [x] Perfil: `GET /api/v1/users/me` y `PUT /api/v1/users/me` (rutas protegidas).
- [x] `npm install` de dependencias del backend (se detectó vulnerabilidad crítica en `bcrypt@5.x` vía `node-tar`; se subió a `bcrypt@6.0.0`, 0 vulnerabilidades).
- [x] VM de Oracle Cloud configurada (Node.js, MySQL, nginx, PM2, certbot) — comparte servidor con n8n existente, sin conflictos.
- [x] Cuenta y API key de Resend configuradas.
- [x] `.env` real del backend en el VPS con `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `CLIENT_URL` (multi-origen).
- [x] Schema sincronizado con `prisma db push` (no hay migraciones versionadas todavía — pendiente correr `prisma migrate dev --name init` en local si se sigue evolucionando el schema).
- [x] Flujo completo probado end-to-end en producción: signup → email de verificación (Resend) → verify → login → cookie de sesión → `/me`.
- [x] Fix de cookie cross-site: `SameSite=None` (antes `Lax`, que bloqueaba la cookie porque frontend y backend viven en dominios distintos) en `auth.controller.js`.
- [x] Frontend scaffolded: Vite + React 19 + TypeScript + Tailwind v4 + React Router (`src/frontend/`). Nota: se tuvo que bajar Vite de v8 a v5 por incompatibilidad con Node 20.18 local.
- [x] Pantallas de auth: Login, Signup, VerifyEmail, ForgotPassword, ResetPassword, Dashboard placeholder — probadas con Playwright contra el backend real, incluida persistencia de sesión tras reload.
- [ ] Pendiente (no urgente): certificado TLS de n8n vencido desde julio — no afecta a PymeSync, revisar en otra sesión.
- [ ] Pendiente (no urgente): verificar dominio propio en Resend para poder enviar a cualquier destinatario.

---

## Milestone 2 — Modelo multi-tenant

Decisión de producto: el signup crea la empresa (tenant) automáticamente — patrón tipo Slack, sin roles todavía (solo `tenantId` por usuario; roles se agregan cuando haya funcionalidad que los necesite, ej. invitar gente).

- [x] `schema.prisma`: modelo `Tenant` (id, name, createdAt, updatedAt) + `User.tenantId` (FK obligatoria, indexada).
- [x] `POST /api/v1/auth/signup` ahora requiere `companyName`; crea `Tenant` + `User` en una transacción atómica (`prisma.$transaction`).
- [x] `GET /api/v1/users/me` incluye el tenant (`{ tenantId, tenant: { id, name } }`).
- [x] Frontend: campo "Nombre de la empresa" en Signup; Dashboard muestra el tenant del usuario.
- [x] Fix: la respuesta de `/auth/login` no incluye tenant (solo id/email/name) — el frontend ahora llama a `/me` después de loguear para tener el perfil completo, en vez de confiar en la respuesta parcial del login.
- [x] Datos de prueba anteriores (sin tenant) borrados de la BD de producción antes de aplicar el campo `tenantId` obligatorio — recreados y reverificados end-to-end.
- [x] Probado end-to-end en producción y en navegador (Playwright): signup con empresa → verify → login → `/me` y Dashboard muestran el tenant correcto.

## Milestone 3 — Webhooks de Meta (WhatsApp/Messenger/Instagram) + cola Redis

Código implementado, pendiente de credenciales reales de Meta y prueba end-to-end (ver `docs/meta-webhooks-setup.md` para la guía paso a paso de configuración en Meta for Developers).

- [x] `schema.prisma`: modelos `Channel`, `Conversation`, `Message` (+ enums `ChannelPlatform`, `MessageDirection`, `MessageStatus`), relacionados a `Tenant`. Idempotencia vía `externalMessageId` único.
- [x] Endpoint webhook unificado `GET/POST /api/v1/webhooks/meta` (un solo endpoint para los 3 canales, discrimina por `req.body.object`) — handshake de verificación + validación de firma HMAC (`X-Hub-Signature-256`) + captura de raw body montada antes del `express.json()` global en `app.js`.
- [x] Cola BullMQ + Redis (`config/redis.js`, `services/meta-queue.service.js`): el webhook solo valida y encola, responde 200 rápido.
- [x] Worker (`workers/meta.worker.js`, proceso separado vía `npm run worker`): consume la cola y persiste `Conversation`/`Message` en BD — solo persistencia, sin auto-respuesta ni WebSockets (eso es Milestone 4).
- [x] Endpoint autenticado `POST /api/v1/channels` para registrar canales (no hay UI de admin todavía).
- [x] Nuevas env vars (`REDIS_URL`, `META_APP_SECRET`, `META_VERIFY_TOKEN`) agregadas a `config/env.js` y `.env.example`.
- [x] Dependencias `bullmq` + `ioredis` instaladas.
- [ ] Pendiente: el usuario todavía no tiene la Meta App creada — seguir `docs/meta-webhooks-setup.md`.
- [ ] Pendiente: correr `prisma migrate dev` (o `db push` en el próximo deploy) para aplicar el nuevo schema — no se corrió porque no hay `DATABASE_URL` local configurada en esta sesión.
- [ ] Pendiente: probar el flujo end-to-end con Redis local + ngrok + credenciales reales de Meta.
- [ ] Pendiente (no urgente): Redis no está instalado en el VPS de producción — decisión de infraestructura para cuando este milestone esté listo para desplegarse.

## Próximo paso
Crear la Meta App siguiendo `docs/meta-webhooks-setup.md`, correr la migración de Prisma en local, y probar el flujo end-to-end con Redis + ngrok.

## Milestones futuros (no iniciados)
- Milestone 4: WebSockets para bandeja de entrada en tiempo real.
- Milestone 5 (parcial): resto del frontend — layout de 3 columnas para bandeja de mensajes, una vez existan esos endpoints.
