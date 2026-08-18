# Configuración de Meta for Developers — Milestone 3

Guía manual para crear la Meta App y conectar WhatsApp, Messenger e Instagram al webhook de PymeSync. Esto se hace una vez en el dashboard de Meta (https://developers.facebook.com), no es código.

## 1. Crear la Meta App

- developers.facebook.com → My Apps → Create App.
- Tipo de app: **Business**.
- Nombre (ej. "PymeSync Dev"), asociarla a un Business Portfolio (crear uno si no tenés).

## 2. Copiar el App Secret → `META_APP_SECRET`

- Dashboard de la app → Settings → Basic → "App Secret" → Show. Pegarlo en `.env` como `META_APP_SECRET`.

## 3. Inventar el Verify Token → `META_VERIFY_TOKEN`

- No lo genera Meta — lo inventás vos (ej. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Va en `.env` como `META_VERIFY_TOKEN` y también se pega en la configuración del webhook (paso 7) — deben coincidir exactamente.

## 4. Agregar el producto WhatsApp

- Dashboard → Add Product → WhatsApp → Set up.
- Meta provisiona un **número de prueba** gratis (solo se puede enviar a hasta 5 números verificados en "To", en la pantalla de API Setup).
- En WhatsApp → API Setup, copiar el **Phone number ID** — es el `externalId` del canal `WHATSAPP` (se registra vía `POST /api/v1/channels`, no va en `.env`).
- En la misma pantalla, generar un **token temporal** (24h, sirve para probar) o, para algo más duradero, Business Settings → System Users → crear un system user → generar un **token permanente** con permisos `whatsapp_business_messaging` y `whatsapp_business_management`. Ese token es el `accessToken` del canal.

## 5. Agregar el producto Messenger

- Dashboard → Add Product → Messenger → Set up.
- Messenger → Settings → Access Tokens: conectar una Página de Facebook que administrés (o crear una de prueba).
- Generar un **Page Access Token** — es el `accessToken` del canal `MESSENGER`.
- El ID numérico de la Página (visible en "About" de la Página o vía Graph API Explorer `GET /me`) es el `externalId`.

## 6. Agregar el producto Instagram

- Requiere que la Página del paso 5 tenga una **cuenta profesional de Instagram** (Business o Creator) vinculada (se hace desde la app de Instagram: Settings → Account type, y Settings → linked accounts → conectar con la Página).
- Dashboard → Add Product → Instagram → configurar mensajería.
- El identificador (`ig_business_id` o el mismo Page ID, según cómo Meta esté ruteando los DMs de IG en la versión actual de la API — conviene verificarlo empíricamente una vez conectada la cuenta) es el `externalId` del canal `INSTAGRAM`; el token suele ser el mismo Page Access Token del paso 5 — confirmar que sus permisos incluyan `instagram_manage_messages`.

## 7. Configurar la suscripción del webhook

- Dashboard → Webhooks (barra lateral) → para cada objeto relevante (`whatsapp_business_account`, `page`, `instagram`) click en Subscribe/Edit.
- Callback URL: tu URL pública + `/api/v1/webhooks/meta` (ej. `https://xxxx.ngrok-free.app/api/v1/webhooks/meta` en desarrollo).
- Verify token: el valor exacto de `META_VERIFY_TOKEN` del paso 3.
- "Verify and Save" — esto dispara el handshake GET contra tu app corriendo. Si falla, casi siempre es porque la app/túnel no está corriendo, el token no coincide, o la URL está mal.
- Suscribirse al campo `messages` en cada producto (WhatsApp, Messenger, Instagram) — es el que entrega los mensajes entrantes.
- Para WhatsApp específicamente, además volver a WhatsApp → Configuration y confirmar el webhook ahí también (Meta a veces requiere que el webhook esté asociado también a la WABA específica).

## 8. Registrar los canales en PymeSync

- Loguearte en la app de PymeSync (flujo de auth existente) para tener una cookie de sesión válida.
- Llamar a `POST /api/v1/channels` con `{ platform, externalId, accessToken, displayName }` una vez por cada canal creado arriba (WhatsApp de prueba, Página de Messenger, cuenta de Instagram).

## Desarrollo local

- Redis vía Docker: `docker run -d --name pymesync-redis -p 6379:6379 redis:7-alpine`.
- Túnel público para que Meta llegue a tu máquina: `ngrok http 4000` → usar la URL `https://xxxx.ngrok-free.app` en el paso 7. Las URLs gratuitas de ngrok cambian en cada reinicio, así que hay que reverificar el webhook en el dashboard cada sesión de desarrollo (o usar un dominio fijo de ngrok/cloudflared si esto se vuelve molesto).
- Correr `npm run dev` (Express) y `npm run worker` (BullMQ) en paralelo.

## Verificación end-to-end

1. Handshake GET: `curl "http://localhost:4000/api/v1/webhooks/meta?hub.mode=subscribe&hub.verify_token=<META_VERIFY_TOKEN>&hub.challenge=12345"` → debe responder `200` con body `12345`.
2. Registrar el canal de WhatsApp de prueba con `POST /api/v1/channels`.
3. Enviar un mensaje de prueba desde la herramienta de test de WhatsApp en el dashboard de Meta.
4. Confirmar `200` en los logs de Express y en "Recent deliveries" del dashboard de Meta.
5. Revisar en la base de datos (Prisma Studio: `npm run prisma:studio`) que aparecen las filas en `channels`, `conversations` y `messages`.
6. Reenviar el mismo mensaje (botón "Resend" en el dashboard) y confirmar que no se duplica el `Message` (constraint único en `externalMessageId`).
7. Repetir para Messenger e Instagram.
8. Prueba negativa: `POST` al webhook con firma inválida o ausente → debe responder `401` y no encolar nada.
