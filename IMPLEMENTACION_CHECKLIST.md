# ✅ CHECKLIST - Sistema de Configuración Visual

## 📋 Archivos Creados

### Base de Datos
- ✅ `src/database/sql/institucion-schema.sql` - Schema SQL con tabla, trigger e inserción inicial

### Modelos
- ✅ `src/models/institucionModel.js` - Funciones para consultar y actualizar BD

### Servicios
- ✅ `src/services/institucionService.js` - Validaciones y lógica de negocio

### Controladores
- ✅ `src/controllers/institucionController.js` - Handlers para GET y PUT

### Rutas
- ✅ `src/routes/institucionRoutes.js` - Definición de endpoints con documentación Swagger

### Scripts
- ✅ `scripts/init-institucion.js` - Inicializador automático de BD

### Documentación
- ✅ `INSTITUCION_README.md` - Documentación completa del sistema
- ✅ `EJEMPLOS_TESTING.js` - Ejemplos de uso y testing
- ✅ `IMPLEMENTACION_CHECKLIST.md` - Este archivo

---

## 🔧 Cambios a Archivos Existentes

### `src/app.js`
- ✅ Agregado `import institucionRoutes`
- ✅ Agregado `app.use('/api/institucion', institucionRoutes)`

### `package.json`
- ✅ Agregado script: `"db:init-institucion": "node scripts/init-institucion.js"`

### `src/security/accessControl.js`
- ✅ **Verificado** - Permiso `sistema.personalizar` ya existe para SuperAdmin

---

## 🚀 Pasos de Instalación

### 1. Crear la Base de Datos

```bash
npm run db:init-institucion
```

**Qué hace**:
- Crea la tabla `institucion`
- Crea el trigger para actualizar timestamps
- Inserta el registro con `id = 1`

**Verificar**:
```bash
psql -U postgres -d plataformaiush -c "SELECT * FROM institucion;"
```

Debe mostrar:
```
 id |     nombre     | logo_url | primary_color | secondary_color | background_color | ... | creacion | actualizacion
----+----------------+----------+---------------+-----------------+------------------+-----+----------+---------------
  1 | IUSH Principal | NULL     | #1F2937       | #3B82F6         | #F9FAFB          | ... | NOW()    | NOW()
```

### 2. Iniciar el Servidor

```bash
npm run dev
```

Debe mostrar:
```
✅ Conectado a PostgreSQL: ...
Server running on port 3000
```

### 3. Verificar Endpoints

```bash
# Obtener config (requiere token)
curl -X GET http://localhost:3000/api/institucion/config \
  -H "Authorization: Bearer <TOKEN>"

# Respuesta esperada (200):
{
  "nombre": "IUSH Principal",
  "logo_url": null,
  "primary_color": "#1F2937",
  ...
}
```

---

## 📝 Endpoints Implementados

### GET /api/institucion/config
- **Seguridad**: `authMiddleware` (JWT válido)
- **Roles**: Todos los usuarios autenticados
- **Respuesta**: Configuración visual actual (sin `nombre` editable)

### PUT /api/institucion/config
- **Seguridad**: `authMiddleware` + `authorizePermissions(['sistema.personalizar'])`
- **Roles**: SOLO SUPER_ADMIN
- **Request**: Campos opcionales de colores, URL del logo
- **Validaciones**:
  - Colores: `#RRGGBB` (regex: `^#([0-9A-Fa-f]{6})$`)
  - URL: Validación de URL estándar
  - No permitir strings vacíos

---

## 🔐 Seguridad Integrada

### Autenticación
- ✅ `authMiddleware` valida JWT Bearer token
- ✅ Requiere `Authorization: Bearer <token>`

### Autorización
- ✅ GET: Requiere usuario autenticado
- ✅ PUT: Requiere permiso `sistema.personalizar` (SUPER_ADMIN)

### Validaciones
- ✅ Colores HEX válidos
- ✅ URLs válidas
- ✅ No campos vacíos
- ✅ Campo `nombre` read-only

---

## 📊 Estructura de Datos

### Request Body (PUT)
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

### Response (GET/PUT)
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

## 🧪 Testing Manual

### Test 1: Obtener configuración (sin permisos, solo auth)
```bash
curl -X GET http://localhost:3000/api/institucion/config \
  -H "Authorization: Bearer <TOKEN_USUARIO>"
```

**Esperado**: 200 OK + JSON de configuración

### Test 2: Actualizar colores (solo SUPER_ADMIN)
```bash
curl -X PUT http://localhost:3000/api/institucion/config \
  -H "Authorization: Bearer <TOKEN_SUPER_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"primary_color": "#FF5733"}'
```

**Esperado**: 200 OK + JSON actualizado

### Test 3: Intentar actualizar sin permisos (usuario regular)
```bash
curl -X PUT http://localhost:3000/api/institucion/config \
  -H "Authorization: Bearer <TOKEN_USUARIO>" \
  -H "Content-Type: application/json" \
  -d '{"primary_color": "#FF5733"}'
```

**Esperado**: 403 Forbidden

### Test 4: Color HEX inválido
```bash
curl -X PUT http://localhost:3000/api/institucion/config \
  -H "Authorization: Bearer <TOKEN_SUPER_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"primary_color": "#GGGGGG"}'
```

**Esperado**: 400 Bad Request

### Test 5: URL inválida
```bash
curl -X PUT http://localhost:3000/api/institucion/config \
  -H "Authorization: Bearer <TOKEN_SUPER_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"logo_url": "no-es-url"}'
```

**Esperado**: 400 Bad Request

### Test 6: Sin token
```bash
curl -X GET http://localhost:3000/api/institucion/config
```

**Esperado**: 401 Unauthorized

---

## 🔍 Verificar Integración

### 1. Confirmar que las rutas están registradas
```bash
# En el servidor, buscar en logs:
✅ "app.use('/api/institucion', institucionRoutes)"
```

### 2. Confirmar que Swagger documenta los endpoints
```
http://localhost:3000/api-docs
```

Buscar `/api/institucion/config` en la sección "Institución"

### 3. Confirmar permisos
```javascript
// En src/security/accessControl.js, verificar:
SuperAdmin: [..., 'sistema.personalizar', ...]
```

---

## 📂 Estructura Final del Proyecto

```
PlataformaIUSH-Backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roleController.js
│   │   ├── userController.js
│   │   └── institucionController.js        ✨ NUEVO
│   ├── models/
│   │   ├── roleModel.js
│   │   ├── userModel.js
│   │   └── institucionModel.js             ✨ NUEVO
│   ├── services/
│   │   ├── authService.js
│   │   ├── roleService.js
│   │   ├── userService.js
│   │   └── institucionService.js           ✨ NUEVO
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── roleRoutes.js
│   │   ├── userRoutes.js
│   │   └── institucionRoutes.js            ✨ NUEVO
│   ├── database/
│   │   ├── db.js
│   │   └── sql/
│   │       ├── auth-schema.sql
│   │       └── institucion-schema.sql      ✨ NUEVO
│   ├── middleware/
│   ├── security/
│   ├── utils/
│   ├── views/
│   ├── config/
│   └── app.js                              (Modificado)
├── scripts/
│   ├── init-db.js
│   ├── seed.js
│   └── init-institucion.js                 ✨ NUEVO
├── package.json                             (Modificado)
├── INSTITUCION_README.md                   ✨ NUEVO
├── EJEMPLOS_TESTING.js                     ✨ NUEVO
├── IMPLEMENTACION_CHECKLIST.md             ✨ NUEVO
└── ... otros archivos
```

---

## ✨ Características Implementadas

- ✅ **Institución única** - Solo `id = 1`, sin endpoints para crear/eliminar
- ✅ **Campos de configuración** - Colores, logo, con defaults
- ✅ **Auditoría** - Timestamps automáticos (`creacion`, `actualizacion`)
- ✅ **Seguridad JWT** - Autenticación con Bearer token
- ✅ **Control de roles** - Permiso `sistema.personalizar` para SUPER_ADMIN
- ✅ **Validaciones** - Colores HEX, URLs válidas
- ✅ **Documentación** - Swagger + README completo
- ✅ **Mantenibilidad** - Separación en capas (modelo, servicio, controlador)

---

## 🚨 Posibles Problemas y Soluciones

### Error: "No se encontró la configuración de la institución"
**Solución**: Ejecutar `npm run db:init-institucion`

### Error: "El token es invalido"
**Solución**: Generar token válido mediante login `/api/auth/login`

### Error: "No tienes permisos"
**Solución**: El usuario debe tener rol SUPER_ADMIN

### Color no actualiza
**Solución**: Verificar formato `#RRGGBB` (6 dígitos hex válidos)

### URL del logo no valida
**Solución**: Debe ser URL completa: `https://example.com/logo.png`

---

## 📱 Próximos Pasos (Frontend)

1. **Cargar tema al iniciar**
   - GET `/api/institucion/config`
   - Aplicar colores a CSS variables

2. **Panel de administración (SUPER_ADMIN)**
   - Formulario para editar colores
   - Upload de logo
   - Preview en tiempo real

3. **Almacenamiento local**
   - Cache de configuración
   - Sincronizar cambios

---

## 📞 Referencias

- **Documentación completa**: [INSTITUCION_README.md](INSTITUCION_README.md)
- **Ejemplos de testing**: [EJEMPLOS_TESTING.js](EJEMPLOS_TESTING.js)
- **Swagger API**: http://localhost:3000/api-docs

---

## ✅ Verificación Final

- [ ] Base de datos creada (`npm run db:init-institucion`)
- [ ] Servidor inicia sin errores (`npm run dev`)
- [ ] GET `/api/institucion/config` devuelve 200
- [ ] PUT `/api/institucion/config` devuelve 403 sin SUPER_ADMIN
- [ ] PUT `/api/institucion/config` devuelve 200 con SUPER_ADMIN
- [ ] Validaciones de color funcionan
- [ ] Endpoints en Swagger

---

**Implementación completada: 2026-04-25**
