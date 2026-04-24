# Fusion del modulo Login

## Cambios integrados

- Se agregaron las rutas `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/roles`, `GET /api/users` y `POST /api/users`.
- Se incorporo autenticacion JWT con middleware de autorizacion por permisos.
- Se migraron los modulos externos a ES modules para que funcionen con `"type": "module"` del proyecto base.
- Se adapto el acceso a PostgreSQL para reutilizar `src/database/db.js` y sus variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DB_SSL`.
- Se agregaron `JWT_SECRET` y `JWT_EXPIRES_IN` al `env.example` del proyecto base.
- Se agregaron scripts `npm run db:init` y `npm run db:seed` para crear el esquema de autenticacion y cargar datos iniciales.
- Se anadio el esquema SQL en `src/database/sql/auth-schema.sql`.
- Se actualizo Swagger para exponer seguridad `BearerAuth` y documentar las rutas nuevas.

## Estructura acoplada al proyecto base

- Configuracion JWT: `src/config/auth.js`
- Controladores: `src/controllers/authController.js`, `src/controllers/roleController.js`, `src/controllers/userController.js`
- Middleware: `src/middleware/authMiddleware.js`, `src/middleware/permissionMiddleware.js`
- Modelos: `src/models/roleModel.js`, `src/models/userModel.js`
- Servicios: `src/services/authService.js`, `src/services/roleService.js`, `src/services/userService.js`
- Seguridad y utilidades: `src/security/accessControl.js`, `src/utils/idGenerator.js`, `src/utils/validation.js`
- Scripts: `scripts/init-db.js`, `scripts/seed.js`

## Variables de entorno necesarias

```env
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
DB_SSL=true
PORT=3000
NODE_ENV=development
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=24h
```

## Flujo recomendado despues de la fusion

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

## Notas de compatibilidad

- Se mantuvo la carpeta actual como fuente principal de verdad.
- No se uso `DATABASE_URL`; el modulo importado fue ajustado al esquema de variables ya existente en este backend.
- La creacion de usuarios respeta permisos segun el rol autenticado.
- El seed crea un `SuperAdmin` inicial: `superadmin@demo.edu` / `Demo12345!`.