# PymeSync

Plataforma omnicanal de atención al cliente para PyMEs: centraliza WhatsApp, Instagram y Messenger en una única bandeja de entrada, con autenticación multi-tenant y sincronización en tiempo real.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router
- **Backend**: Node.js + Express + Prisma (ORM)
- **Base de datos**: MySQL
- **Autenticación**: JWT en cookie `httpOnly` + `bcrypt` para hashing de contraseñas
- **Email**: Resend (verificación de cuenta, reset de contraseña)
- **Colas y asincronía**: Redis + BullMQ (ingesta de webhooks de Meta)
- **Infraestructura**: VPS en Oracle Cloud, nginx como reverse proxy, PM2

## Estructura del proyecto

```
PymeSync/
├── docs/                    # Documentación (plan del proyecto, guías de setup/deploy)
├── src/
│   ├── frontend/            # React + Vite
│   └── backend/             # Node.js + Express + Prisma
│       ├── prisma/          # schema.prisma
│       └── src/
│           ├── config/      # env, cliente Prisma, clientes de Resend/Redis
│           ├── controllers/
│           ├── routes/      # rutas REST bajo /api/v1
│           ├── middlewares/
│           ├── services/    # lógica de negocio
│           ├── validators/  # esquemas zod
│           ├── utils/
│           └── workers/     # procesamiento en background (BullMQ)
└── tests/
```

## Requisitos

- Node.js 20+
- MySQL 8
- Redis (para el worker de webhooks de Meta)

## Desarrollo local

### Backend

```bash
cd src/backend
npm install
cp .env.example .env   # completar con tus valores
npx prisma migrate dev
npm run dev             # API en http://localhost:4000
npm run worker          # worker de BullMQ (proceso aparte)
```

### Frontend

```bash
cd src/frontend
npm install
cp .env.example .env   # completar con tus valores
npm run dev             # http://localhost:5173
```

## Documentación

- [`docs/plan.md`](docs/plan.md) — estado actual del proyecto y roadmap por milestones.
- [`docs/deploy-oracle-vps.md`](docs/deploy-oracle-vps.md) — despliegue del backend en el VPS.
- [`docs/meta-webhooks-setup.md`](docs/meta-webhooks-setup.md) — configuración de la Meta App (WhatsApp/Messenger/Instagram) y del webhook.

## Notas de seguridad

Los archivos `.env` y las llaves privadas de despliegue (`key/`) nunca se commitean — ver `.gitignore`. Usar siempre los `.env.example` como referencia.
