# ARQUITECTURA - Sistema de Configuración Visual

## Flujo de Datos - GET /api/institucion/config

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Frontend)                           │
│                                                                       │
│  GET /api/institucion/config                                        │
│  Authorization: Bearer <JWT_TOKEN>                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EXPRESS ROUTER                                │
│                    institucionRoutes.js                              │
│                                                                       │
│  router.get('/config', getConfig)                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE CHAIN                                │
│                                                                       │
│  1. authMiddleware                                                   │
│     ├─ Verifica Authorization header                                │
│     ├─ Valida JWT con secret                                        │
│     └─ Almacena user en req.auth                                    │
│                                                                       │
│  2. getConfig (controller)                                          │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                                │
│                 institucionController.js                             │
│                                                                       │
│  export const getConfig = async (req, res, next) => {               │
│    const config = await getInstitucionConfigService();              │
│    res.status(200).json(config);                                    │
│  }                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                                  │
│                 institucionService.js                                │
│                                                                       │
│  export const getInstitucionConfigService = async () => {           │
│    const config = await getInstitucionConfig();                     │
│    // Retorna solo campos de configuración                          │
│    return { nombre, logo_url, primary_color, ... }                 │
│  }                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       MODEL LAYER                                    │
│                  institucionModel.js                                 │
│                                                                       │
│  export const getInstitucionConfig = async () => {                  │
│    const result = await query(                                      │
│      'SELECT ... FROM institucion WHERE id = 1'                    │
│    );                                                                │
│    return result.rows[0];                                           │
│  }                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                  │
│                      PostgreSQL Pool                                 │
│                                                                       │
│  tabla: institucion                                                  │
│  id=1 | nombre | logo_url | primary_color | secondary_color | ...  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RESPONSE                                      │
│                                                                       │
│  HTTP/1.1 200 OK                                                    │
│  Content-Type: application/json                                     │
│                                                                       │
│  {                                                                   │
│    "nombre": "IUSH Principal",                                      │
│    "logo_url": null,                                                │
│    "primary_color": "#1F2937",                                      │
│    "secondary_color": "#3B82F6",                                    │
│    "background_color": "#F9FAFB",                                   │
│    "text_primary": "#111827",                                       │
│    "text_secondary": "#6B7280",                                     │
│    "text_tertiary": "#9CA3AF"                                       │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos - PUT /api/institucion/config

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Frontend)                           │
│                     (SUPER_ADMIN Usuario)                            │
│                                                                       │
│  PUT /api/institucion/config                                        │
│  Authorization: Bearer <JWT_TOKEN_SUPER_ADMIN>                      │
│  Content-Type: application/json                                     │
│                                                                       │
│  {                                                                   │
│    "primary_color": "#FF5733",                                      │
│    "secondary_color": "#33FF57"                                     │
│  }                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EXPRESS ROUTER                                │
│                    institucionRoutes.js                              │
│                                                                       │
│  router.put('/config',                                              │
│    authMiddleware,                                                  │
│    authorizePermissions(['sistema.personalizar']),                  │
│    updateConfig                                                     │
│  )                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌────────────┐  ┌──────────────┐ ┌──────────────┐
   │ auth       │  │ permission   │ │ updateConfig │
   │ Middleware │  │ Middleware   │ │ (controller) │
   │            │  │              │ │              │
   │ Valida JWT │  │ Valida roles │ │ Procesa req  │
   └────────────┘  └──────────────┘ └──────────────┘
        │                │                │
        └────────────────┴────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                                │
│                 institucionController.js                             │
│                                                                       │
│  export const updateConfig = async (req, res, next) => {            │
│    const configData = {                                             │
│      primary_color: req.body.primary_color,                         │
│      secondary_color: req.body.secondary_color                      │
│    };                                                                │
│    const updated = await updateInstitucionConfigService(configData);│
│    res.status(200).json(updated);                                   │
│  }                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                                  │
│                 institucionService.js                                │
│                                                                       │
│  VALIDACIONES:                                                       │
│  1. Verificar campos no vacíos                                      │
│  2. Validar colores HEX: ^#([0-9A-Fa-f]{6})$                        │
│  3. Validar URLs                                                    │
│  4. Sanear datos                                                    │
│                                                                       │
│  Si validaciones OK:                                                │
│    const updated = await updateInstitucionConfig(configData);       │
│    return { nombre, logo_url, primary_color, ... }                 │
│                                                                       │
│  Si error:                                                          │
│    throw error (statusCode: 400)                                    │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                    ┌────┴───────┐
                    │            │
                    ▼            ▼
            ✅ VALIDO      ❌ INVÁLIDO
                    │            │
                    │            └────────┐
                    │                     │
                    ▼                     ▼
        ┌──────────────────┐  ┌─────────────────────┐
        │   MODEL LAYER    │  │  ERROR HANDLER      │
        │                  │  │                     │
        │  UPDATE SQL:     │  │  res.status(400)    │
        │                  │  │  .json({            │
        │  UPDATE inst...  │  │    error: "..."     │
        │  SET ...         │  │  })                 │
        │  WHERE id = 1    │  └─────────────────────┘
        │  RETURNING *     │
        │                  │
        │  result.rows[0]  │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  PostgreSQL      │
        │                  │
        │  UPDATE ejecutado│
        │  campos updated  │
        │                  │
        │  DEVUELVE fila   │
        └──────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  RESPONSE: 200   │
        │                  │
        │  {               │
        │    nombre: "...",│
        │    primary_...: "#FF5733"│
        │    secondary_...: "#33FF57"│
        │    ...           │
        │  }               │
        └──────────────────┘
```

---

## Árbol de Dependencias

```
institucionRoutes.js
│
├── authMiddleware
│   └── jwt.verify()
│       └── config/auth.js
│
├── authorizePermissions()
│   └── accessControl.js
│       └── rolePermissions[]
│
└── institucionController
    │
    ├── getConfig()
    │   └── institucionService.getInstitucionConfigService()
    │       └── institucionModel.getInstitucionConfig()
    │           └── db.query() → PostgreSQL
    │
    └── updateConfig()
        └── institucionService.updateInstitucionConfigService()
            ├── isValidHexColor() → regex
            ├── isValidUrl() → URL constructor
            └── institucionModel.updateInstitucionConfig()
                └── db.query() → PostgreSQL UPDATE
```

---

## Flujo de Seguridad

```
REQUEST
│
├─ ¿Tiene Authorization header?
│  │
│  ├─ NO → 401 Unauthorized
│  │
│  └─ SÍ → Extraer token
│
├─ ¿Token válido y no expirado?
│  │
│  ├─ NO → 401 Unauthorized
│  │
│  └─ SÍ → Guardar datos en req.auth
│
├─ ¿Es PUT?
│  │
│  ├─ NO (GET) → Continuar
│  │
│  └─ SÍ → ¿Usuario tiene permiso "sistema.personalizar"?
│     │
│     ├─ NO → 403 Forbidden
│     │
│     └─ SÍ → Continuar
│
├─ Procesar request
│  │
│  ├─ Validar datos
│  ├─ Ejecutar lógica
│  └─ Retornar respuesta
│
└─ RESPONSE
```

---

## Estructura de Validaciones

```
updateConfig (PUT)
│
├─ Sanitizar entrada
│  ├─ Trim strings
│  └─ Coercer tipos
│
├─ Validar presencia
│  └─ Al menos 1 campo
│
├─ Validar formato colores
│  └─ regex: ^#([0-9A-Fa-f]{6})$
│     ├─ #1F2937 ✅
│     ├─ #GGGGGG ❌
│     ├─ #FFF ❌
│     └─ FF0000 ❌
│
├─ Validar URLs
│  └─ new URL(logo_url)
│     ├─ https://example.com/logo.png ✅
│     └─ "no-es-url" ❌
│
└─ Validar no vacíos
   └─ "" ❌

Si TODO OK → UPDATE
Si ERROR → return error 400
```

---

## Tabla Institución

```
┌──────────┬────────────┬──────────┬────────────────┬─────────────────┬──────────────────┐
│ id (PK)  │ nombre     │ logo_url │ primary_color  │ secondary_color │ ... (5 más)       │
├──────────┼────────────┼──────────┼────────────────┼─────────────────┼──────────────────┤
│ 1        │ IUSH       │ NULL     │ #1F2937        │ #3B82F6         │ #F9FAFB ...      │
│          │ Principal  │          │                │                 │                  │
├──────────┼────────────┼──────────┼────────────────┼─────────────────┼──────────────────┤
│ (fixed)  │ (read-only)│ (update) │ (update)       │ (update)        │ (update)         │
│ (no más) │ (no muta)  │          │                │                 │                  │
└──────────┴────────────┴──────────┴────────────────┴─────────────────┴──────────────────┘

Campos adicionales:
- creacion: TIMESTAMPTZ (automático al insertar)
- actualizacion: TIMESTAMPTZ (automático, actualiza con trigger)

Trigger: update_institucion_actualizacion_column()
  ON UPDATE → SET actualizacion = NOW()
```

---

## Códigos de Error

```
200 OK
├─ GET /config → retorna configuración
└─ PUT /config → retorna configuración actualizada

400 Bad Request
├─ Colores HEX inválidos
├─ URL inválida
├─ Campos vacíos
└─ Sin campos para actualizar

401 Unauthorized
├─ Sin Authorization header
├─ Token inválido
└─ Token expirado

403 Forbidden
├─ Usuario no tiene rol SUPER_ADMIN
└─ Permiso "sistema.personalizar" no encontrado

404 Not Found
└─ Institución no existe (no debería ocurrir normalmente)

500 Internal Server Error
├─ Error BD
├─ Error de servidor
└─ Excepción no capturada
```

---

## Stack Tecnológico

```
┌───────────────────────────────────────┐
│          FRONTEND (React/Vue)          │
│    Consume endpoints REST JSON        │
└───────────────────────────────────────┘
            │
            │ HTTP/REST
            ▼
┌───────────────────────────────────────┐
│   BACKEND (Node.js + Express)         │
├───────────────────────────────────────┤
│ • Routing: express                    │
│ • Auth: jsonwebtoken (JWT)            │
│ • Middleware: custom                  │
│ • Validación: regex + URL constructor │
└───────────────────────────────────────┘
            │
            │ Queries SQL
            ▼
┌───────────────────────────────────────┐
│    DATABASE (PostgreSQL + pg pool)    │
│                                       │
│ tabla: institucion                    │
│  └─ id=1 (fixed)                      │
│  └─ configuración visual              │
│  └─ timestamps automáticos            │
└───────────────────────────────────────┘
```

---

## Ciclo de Vida del PUT Request

```
1. Client → Frontend
   ├─ Usuario hace clic "Guardar"
   └─ Envía PUT con nuevos colores

2. Frontend → Backend
   ├─ Construye request HTTP
   ├─ Incluye JWT en header
   └─ Serializa JSON body

3. Backend: authMiddleware
   ├─ Lee header Authorization
   ├─ Extrae token
   ├─ Valida JWT
   └─ Guarda usuario en req.auth

4. Backend: authorizePermissions
   ├─ Lee req.auth.roles/permisos
   ├─ Verifica "sistema.personalizar"
   └─ Si NO tiene → 403 STOP

5. Backend: updateConfig (controller)
   ├─ Lee req.body
   ├─ Sanitiza datos
   └─ Llama service

6. Backend: updateInstitucionConfigService
   ├─ Valida colores
   ├─ Valida URLs
   ├─ Valida presencia
   └─ Llama model

7. Backend: updateInstitucionConfig (model)
   ├─ Ejecuta UPDATE SQL
   ├─ WHERE id = 1
   └─ RETURNING *

8. PostgreSQL
   ├─ Ejecuta UPDATE
   ├─ Trigger actualiza "actualizacion"
   └─ Retorna fila actualizada

9. Backend: Response
   ├─ 200 OK
   ├─ Content-Type: application/json
   └─ Body: configuración actualizada

10. Frontend: Response Handler
    ├─ Recibe 200 OK
    ├─ Parsea JSON
    ├─ Actualiza UI
    └─ Muestra "¡Guardado!"
```

---

## Checklist de Implementación

```
✅ Crear schema SQL
✅ Crear modelo
✅ Crear servicio con validaciones
✅ Crear controlador
✅ Crear rutas
✅ Integrar en app.js
✅ Crear script inicializador
✅ Documentación completa
✅ Ejemplos de testing
✅ Seguridad integrada
✅ Validaciones implementadas
✅ Manejo de errores
```

