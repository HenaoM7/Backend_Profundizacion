# Sistema de Configuración Visual - Institución

## Descripción

Sistema backend para gestionar la configuración visual (theming) de una institución única. Permite obtener y actualizar colores, logo y configuración de tema.

---

## Características

✅ **Institución Única**: Solo existe un registro con `id = 1`
✅ **Seguridad**: Autenticación JWT + Control de roles
✅ **Validaciones**: Colores HEX, URLs válidas
✅ **Persistencia**: Almacenamiento en PostgreSQL
✅ **Timestamps**: Auditoría con `creacion` y `actualizacion`

---

## API Endpoints

### 1. GET /api/institucion/config

**Descripción**: Obtiene la configuración visual actual de la institución

**Seguridad**: `authMiddleware` (requiere JWT válido)

**Request**:
```bash
curl -X GET http://localhost:3000/api/institucion/config \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
{
  "nombre": "IUSH Principal",
  "logo_url": "https://example.com/logo.png",
  "primary_color": "#1F2937",
  "secondary_color": "#3B82F6",
  "background_color": "#F9FAFB",
  "text_primary": "#111827",
  "text_secondary": "#6B7280",
  "text_tertiary": "#9CA3AF"
}
```

---

### 2. PUT /api/institucion/config

**Descripción**: Actualiza la configuración visual de la institución

**Seguridad**: `authMiddleware` + `authorizePermissions(['sistema.personalizar'])`
- Solo usuarios con rol **SUPER_ADMIN** pueden actualizar

**Request**:
```bash
curl -X PUT http://localhost:3000/api/institucion/config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "logo_url": "https://example.com/new-logo.png",
    "primary_color": "#FF5733",
    "secondary_color": "#33FF57"
  }'
```

**Body (Todos los campos son opcionales)**:
```json
{
  "logo_url": "https://example.com/logo.png",
  "primary_color": "#RRGGBB",
  "secondary_color": "#RRGGBB",
  "background_color": "#RRGGBB",
  "text_primary": "#RRGGBB",
  "text_secondary": "#RRGGBB",
  "text_tertiary": "#RRGGBB"
}
```

**Response (200)**:
```json
{
  "nombre": "IUSH Principal",
  "logo_url": "https://example.com/new-logo.png",
  "primary_color": "#FF5733",
  "secondary_color": "#33FF57",
  "background_color": "#F9FAFB",
  "text_primary": "#111827",
  "text_secondary": "#6B7280",
  "text_tertiary": "#9CA3AF"
}
```

**Errores**:
- **400**: Colores inválidos o URL no válida
- **401**: Token no proporcionado o inválido
- **403**: Usuario no tiene permisos SUPER_ADMIN

---

## Validaciones

### Colores HEX
- Formato: `#RRGGBB`
- Ejemplo válido: `#1F2937`
- Regex: `^#([0-9A-Fa-f]{6})$`

### URLs
- Debe ser una URL válida
- Ejemplo: `https://example.com/logo.png`

### Campos vacíos
- No se permiten strings vacíos en la actualización

---

## Base de Datos

### Tabla: `institucion`

```sql
CREATE TABLE IF NOT EXISTS institucion (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  background_color VARCHAR(7),
  text_primary VARCHAR(7),
  text_secondary VARCHAR(7),
  text_tertiary VARCHAR(7),
  creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Características

- **id = 1**: Identificador fijo (no se permite crear más registros)
- **nombre**: Campo de solo lectura (no es editable vía API)
- **Colores**: Campos opcionales en formato HEX
- **logo_url**: URL del logo (opcional)
- **Timestamps**: Auditoría automática

---

## Estructura del Proyecto

```
src/
├── controllers/
│   └── institucionController.js      # Controladores
├── models/
│   └── institucionModel.js           # Acceso a datos
├── services/
│   └── institucionService.js         # Lógica de negocio y validaciones
├── routes/
│   └── institucionRoutes.js          # Definición de rutas
├── database/
│   └── sql/
│       └── institucion-schema.sql    # Schema SQL
└── app.js                             # Integración de rutas

scripts/
└── init-institucion.js               # Script de inicialización
```

---

## Instalación y Configuración

### 1. Ejecutar script de inicialización

```bash
npm run db:init-institucion
```

Este script:
- ✅ Crea la tabla `institucion`
- ✅ Crea el trigger automático para `actualizacion`
- ✅ Inserta el registro único con `id = 1`

### 2. Iniciar el servidor

```bash
npm run dev    # Desarrollo con nodemon
npm start      # Producción
```

---

## Integración con Sistema de Autenticación

El sistema utiliza los middlewares existentes:

### authMiddleware
```javascript
import { authMiddleware } from '../middleware/authMiddleware.js';
// Valida JWT en Authorization: Bearer <token>
```

### authorizePermissions
```javascript
import { authorizePermissions } from '../middleware/permissionMiddleware.js';
// Valida permisos basados en roles
```

### Permisos

El permiso `sistema.personalizar` ya existe en `accessControl.js`:

```javascript
rolePermissions = {
  SuperAdmin: ['sistema.personalizar', ...],
  // ...
}
```

---

## Ejemplos de Uso

### Obtener configuración (Cliente autenticado)

```javascript
const token = 'eyJhbGc...'; // Token JWT

const response = await fetch('/api/institucion/config', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const config = await response.json();
console.log(config.primary_color); // "#1F2937"
```

### Actualizar configuración (SUPER_ADMIN)

```javascript
const token = 'eyJhbGc...'; // Token SUPER_ADMIN

const response = await fetch('/api/institucion/config', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    primary_color: '#FF5733',
    secondary_color: '#33FF57'
  })
});

const updatedConfig = await response.json();
console.log('Configuración actualizada:', updatedConfig);
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 400 | Datos inválidos (color HEX o URL) |
| 401 | Token no válido o expirado |
| 403 | Permisos insuficientes |
| 404 | Configuración no encontrada |
| 500 | Error interno del servidor |

---

## Puntos Importantes

🔒 **Seguridad**:
- GET requiere autenticación (cualquier usuario autenticado)
- PUT requiere autenticación + permiso SUPER_ADMIN
- No hay endpoints para crear/eliminar institución

📝 **Datos**:
- Solo existe `id = 1`
- El campo `nombre` NO es editable
- Los timestamps se actualizan automáticamente

✅ **Validaciones**:
- Colores deben ser HEX válido: `#RRGGBB`
- URLs deben ser válidas
- No se permiten campos vacíos en actualizaciones

---

## Configuración de Variables de Entorno

En `.env`:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plataformaiush
DB_SSL=false
JWT_SECRET=your_secret_key
```

---

## Próximos Pasos (Frontend)

El frontend puede:

1. **Cargar tema al iniciar**:
   - GET `/api/institucion/config`
   - Aplicar colores a CSS variables

2. **Editar tema** (solo SUPER_ADMIN):
   - PUT `/api/institucion/config`
   - Guardar cambios

3. **Mostrar preview en tiempo real**:
   - Validar colores HEX antes de enviar
   - Mostrar cambios mientras se editan

---

## Troubleshooting

### Error: "No se encontró la configuración de la institución"
- Ejecutar: `npm run db:init-institucion`

### Error: "El campo debe ser un color HEX válido"
- Formato correcto: `#FF5733` (6 caracteres hex)
- Ejemplos válidos: `#1F2937`, `#3B82F6`, `#FFFFFF`

### Error: "No tienes permisos para realizar esta acción"
- El usuario debe tener rol SUPER_ADMIN
- Verificar que el token contiene el permiso `sistema.personalizar`

---

## Documentación de Rutas (Swagger)

Las rutas están documentadas con OpenAPI 3.0 en `institucionRoutes.js`.

Acceder a documentación interactiva:
```
http://localhost:3000/api-docs
```

