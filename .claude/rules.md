# PymeSync — Reglas del Proyecto

## Contexto del Proyecto

Plataforma omnicanal de atención al cliente para PyMEs, centralizando WhatsApp, Instagram y Messenger en una única bandeja de entrada con sincronización en tiempo real. 

El stack tecnológico es:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma (ORM)
- **Base de Datos**: MySQL
- **Autenticación**: JWT en cookies `httpOnly` + `bcrypt` para hashing de contraseñas
- **Envío de Correos**: Resend (verificación de cuenta, reset de contraseña)
- **Colas y Asincronía**: Redis (para ingesta de webhooks de Meta)
- **Infraestructura**: Arquitectura orientada a la nube (Cloud-based), no on-premise.

El archivo `docs/plan.md` es la memoria principal del proyecto. Consultarlo siempre al inicio de cada sesión para saber el estado actual y el próximo paso.

---

## Reglas de Comportamiento

### General
- Actuar siempre como arquitecto senior. Pensar en escalabilidad y alta concurrencia desde el primer día (los webhooks pueden generar picos de tráfico).
- Antes de implementar cualquier cosa, confirmar que está alineado con el Milestone activo en `docs/plan.md`.
- Después de completar cada tarea, actualizar el estado en `docs/plan.md` (marcar checkbox, actualizar "Estado Actual").
- Mantener la separación de responsabilidades: el webhook solo recibe y encola; un worker procesa y guarda; WebSocket emite al cliente.

### Código
- Todo el código nuevo va en la carpeta correcta según la estructura del proyecto.
- Variables, funciones y esquemas de base de datos en inglés. UI y mensajes al usuario final en español.
- No escribir comentarios que expliquen QUÉ hace el código, solo comentar el POR QUÉ cuando no sea obvio (ej. por qué se usa cierto workaround para la API de Meta).
- Preferir editar archivos existentes antes de crear nuevos.

### Frontend (React + Vite)
- La UI se divide en un layout de tres columnas: Canales/Lista de Chats, Hilo de Mensajes, e Info del Cliente.
- Los componentes visuales van en `src/frontend/src/components/`.
- La lógica de conexión en tiempo real va en custom hooks (ej. `useWebSockets.ts`) dentro de `src/frontend/src/hooks/`.
- Manejar el estado global de forma eficiente para no re-renderizar toda la bandeja con cada mensaje nuevo.
- Nunca hardcodear URLs del backend o de WebSockets. Usar variables de entorno (`import.meta.env`).

### Backend (Node.js + Express + Prisma)
- Todas las rutas REST bajo `/api/v1/`.
- El endpoint de recepción de webhooks de Meta debe responder siempre HTTP 200 de inmediato y delegar el procesamiento a una cola (Redis/BullMQ).
- Separar rutas, controladores, servicios, middlewares, workers y modelos (Prisma) en sus respectivas carpetas.
- Validar SIEMPRE la firma HMAC (X-Hub-Signature) de los webhooks entrantes de Meta por seguridad.
- Usar `zod` para validar todos los payloads de request (body/params/query) antes de llegar al controlador.
- Nunca hardcodear API keys, secrets o tokens de Meta/Resend/JWT. Leer siempre desde variables de entorno (`.env`, nunca commiteado).
- Contraseñas SIEMPRE hasheadas con `bcrypt` (nunca en texto plano, ni en logs).
- El JWT de sesión se emite exclusivamente en una cookie `httpOnly`, `sameSite`, y `secure` en producción. Nunca exponer el JWT en el body de la respuesta ni en localStorage.
- Un usuario no puede iniciar sesión si `isVerified` es `false`.

### Base de Datos y Multi-Tenant
- El diseño debe ser multi-tenant (orientado a PyMEs). Toda consulta a la base de datos debe filtrar estrictamente por `tenant_id`.
- Utilizar transacciones seguras para evitar la duplicación de mensajes (Meta a veces envía el mismo webhook más de una vez).

### Reglas de Negocio (Meta API)
- **Ventana de 24 horas**: El backend debe validar si la conversación está dentro de la ventana de 24 horas antes de permitir el envío de un mensaje de texto libre. Si está fuera de la ventana, forzar el uso de *Template Messages*.
- Guardar de forma persistente los identificadores externos (`external_id`) de los mensajes y contactos para mantener la referencia con las APIs de Meta.

---

## Estructura de Carpetas de Referencia

```
PymeSync/
├── .claude/
│   └── rules.md              ← Este archivo
├── docs/
│   └── plan.md               ← Memoria principal del proyecto
├── src/
│   ├── frontend/             ← Proyecto React + Vite
│   │   ├── src/
│   │   │   ├── components/   ← Componentes de UI
│   │   │   │   ├── chat/     ← Componentes del hilo de mensajes
│   │   │   │   ├── layout/   ← Sidebar y estructura base
│   │   │   │   └── panels/   ← Paneles de información
│   │   │   ├── hooks/        ← Custom hooks (WebSockets, API)
│   │   │   ├── lib/          ← Clientes HTTP y utilidades
│   │   │   └── types/        ← Interfaces de TypeScript
│   │   └── package.json
│   └── backend/              ← Proyecto Node.js + Express + Prisma
│       ├── prisma/
│       │   └── schema.prisma ← Modelos de base de datos (MySQL)
│       ├── src/
│       │   ├── config/       ← env, cliente Prisma, cliente Resend
│       │   ├── controllers/  ← Controladores (auth, user, webhooks)
│       │   ├── routes/       ← Rutas REST bajo /api/v1/
│       │   ├── middlewares/  ← Auth (JWT), manejo de errores
│       │   ├── services/     ← Lógica de negocio (auth, email, mensajes)
│       │   ├── validators/   ← Esquemas zod de request
│       │   ├── utils/        ← Helpers (tokens, jwt)
│       │   ├── workers/      ← Procesamiento en background (Colas)
│       │   ├── app.js
│       │   └── server.js
│       ├── .env.example
│       └── package.json
└── tests/
```

---

## Preguntas Clave Antes de Implementar

1. ¿En qué Milestone estamos? (ver `docs/plan.md`)
2. ¿Esta tarea está en el Milestone activo o es trabajo futuro?
3. ¿El procesamiento que voy a agregar bloquea el endpoint del webhook? (Si es así, mover a background).
4. ¿Esta consulta de base de datos incluye el filtro por tenant/PyME?
5. ¿Al terminar, debo actualizar `docs/plan.md`?