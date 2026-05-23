import swaggerJsdoc from 'swagger-jsdoc';

const STUDENT_ID   = 'fdb51787-747c-4c2c-8ed7-2bc9ebc62145';
const DOCENTE_ID   = 'c98d3456-0899-4ce7-ad4d-ed3f69095c77';
const ADMIN_ID     = 'f821425b-0e37-47d4-898e-c47d7ff98658';
const SA_ID        = '0b36846d-c1e9-4d67-a7b6-043638b3112d';
const MODULE_ID    = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const COURSE_ID    = '2346196f-091b-4cb3-beb8-128bca3ad069';
const CONTENT_ID   = 'c1111111-0000-0000-0000-000000000001';
const CERT_ID      = '626491ee-21ee-497e-a441-d35794c64ddc';
const CERT_CODIGO  = '37bbf000-e4cb-4edd-bdca-347d1f0d608a';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'PlataformaIUSH — API REST',
    version: '2.0.0',
    description: `
## Plataforma Educativa IUSH · Backend — Equipo 5

Módulo de **Progreso Académico, Validación de Contenidos y Certificaciones** del sistema educativo PlataformaIUSH.

### Módulos
| Prefijo | Descripción |
|---------|-------------|
| \`/progreso\` | Seguimiento de avance por contenido y curso, validación booleana y estadísticas |
| \`/validacion\` | Gestión de preguntas de validación por contenido |
| \`/certificates\` | Plantillas HTML, generación y descarga de certificados |

### Autenticación
Todos los endpoints (excepto \`GET /certificates/verificar/:codigo\`) requieren:
\`\`\`
Authorization: Bearer <token>
\`\`\`

#### Tokens de prueba
| Token | Rol | userId |
|-------|-----|--------|
| \`token-superadmin-001\` | SuperAdmin | \`${SA_ID}\` |
| \`token-admin-001\` | Admin | \`${ADMIN_ID}\` |
| \`token-docente-001\` | Docente | \`${DOCENTE_ID}\` |
| \`token-estudiante-001\` | Estudiante | \`${STUDENT_ID}\` |

### Lógica central del sistema
1. Docente/Admin configura una **pregunta booleana** por contenido
2. Estudiante responde \`true\` o \`false\` al finalizar el contenido
3. Si la respuesta es **correcta** → el contenido se marca completado y el progreso del curso aumenta
4. Si la respuesta es **incorrecta** → el intento se registra pero el progreso no cambia
5. Al alcanzar el **100%** del curso → el certificado se genera automáticamente con la plantilla HTML del curso
6. No existen calificaciones numéricas ni promedios
    `,
    contact: { name: 'Equipo 5 — PlataformaIUSH', email: 'dev@plataformaiush.edu.co' },
    license: { name: 'ISC' },
  },
  servers: [{ url: 'http://localhost:3000', description: 'Desarrollo local' }],
  tags: [
    { name: 'Sistema',         description: 'Estado y salud de la API' },
    { name: 'Autenticacion',   description: 'Login y obtención de usuario autenticado' },
    { name: 'SuperAdmin',      description: 'Gestión y vista de usuarios (solo SuperAdmin)' },
    { name: 'Institución',     description: 'Configuración visual y branding de la institución' },
    { name: 'Cursos',          description: 'Gestión de cursos — Equipo 1' },
    { name: 'Modulos',         description: 'Gestión de módulos — Equipo 1' },
    { name: 'Contenidos',      description: 'Gestión de contenidos — Equipo 1' },
    { name: 'Teacher',         description: 'Orquestación Vista Docente — Equipo 6' },
    { name: 'Inscripciones',   description: 'Gestión de inscripciones estudiante-curso — Equipo 7' },
    { name: 'Admin Dashboard', description: 'Reportes del panel administrativo' },
    { name: 'Progreso',        description: '[Equipo 5] Avance del estudiante por contenido y curso; estadísticas académicas' },
    { name: 'Validación',      description: '[Equipo 5] Preguntas booleanas que controlan si un contenido se marca completado' },
    { name: 'Certificados',    description: '[Equipo 5] Plantillas HTML, generación y descarga de certificados de finalización' },
    { name: 'Notas',           description: 'Gestión de calificaciones por módulo y curso' },
    { name: 'Evaluaciones',    description: 'Envío de respuestas con corrección automática y creación de nota' },
    { name: 'Reportes',        description: 'Reportes académicos y de negocio sobre vistas PostgreSQL (Equipo 9)' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa uno de los tokens de prueba.',
      },
    },
    schemas: {
      ValidacionContenido: {
        type: 'object',
        description: 'Pregunta booleana de validación asociada a un contenido.',
        properties: {
          id:          { type: 'string', format: 'uuid',      example: '3dde7d5e-7a03-4001-80bb-be6ccfc81fff' },
          idContenido: { type: 'string', format: 'uuid',      example: CONTENT_ID },
          pregunta:    { type: 'string',                      example: 'React es una biblioteca de JavaScript. ¿Verdadero o falso?' },
          activo:      { type: 'boolean',                     example: true },
          creadoEn:    { type: 'string', format: 'date-time', example: '2026-05-15T17:50:37.657Z' },
        },
      },
      ValidarRequest: {
        type: 'object',
        required: ['respuesta'],
        properties: {
          respuesta: { type: 'boolean', example: true, description: 'Respuesta del estudiante: true o false.' },
        },
      },
      ValidarResponse: {
        type: 'object',
        properties: {
          correcto: { type: 'boolean', example: true },
          progreso:     { $ref: '#/components/schemas/ProgresoCurso', nullable: true, description: 'Presente solo si la respuesta fue correcta.' },
          certificado:  { $ref: '#/components/schemas/Certificate',   nullable: true, description: 'Presente solo si el curso se completó al 100%.' },
        },
      },
      ProgresoCurso: {
        type: 'object',
        description: 'Estado de avance del estudiante en un curso.',
        properties: {
          id:                    { type: 'string', format: 'uuid',      example: 'c7132421-c558-46b1-9edc-871643859181' },
          idUsuario:             { type: 'string', format: 'uuid',      example: STUDENT_ID },
          idCurso:               { type: 'string', format: 'uuid',      example: COURSE_ID },
          porcentaje:            { type: 'number', minimum: 0, maximum: 100, example: 50 },
          contenidosCompletados: { type: 'integer', example: 1 },
          totalContenidos:       { type: 'integer', example: 2 },
          completado:            { type: 'boolean', example: false },
          aprobado:              { type: 'boolean', example: false },
          fechaInicio:           { type: 'string', format: 'date-time', example: '2026-05-15T10:00:00.000Z' },
          fechaCompletado:       { type: 'string', format: 'date-time', nullable: true, example: null },
        },
      },
      EstadisticasCurso: {
        type: 'object',
        description: 'Estadísticas de progreso de un curso.',
        properties: {
          idCurso:                 { type: 'string', format: 'uuid', example: COURSE_ID },
          porcentaje_promedio:     { type: 'number', example: 100 },
          total_estudiantes:       { type: 'integer', example: 1 },
          estudiantes_completados: { type: 'integer', example: 1 },
          estudiantes_pendientes:  { type: 'integer', example: 0 },
          ranking: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id_usuario:             { type: 'string', example: STUDENT_ID },
                nombre_estudiante:      { type: 'string', nullable: true, example: 'Estudiante Base' },
                porcentaje:             { type: 'number', example: 100 },
                contenidos_completados: { type: 'integer', example: 2 },
                total_contenidos:       { type: 'integer', example: 2 },
                completado:             { type: 'boolean', example: true },
                posicion:               { type: 'integer', example: 1 },
              },
            },
          },
          contenidos_mayor_fallo: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id_contenido:   { type: 'string', format: 'uuid', example: CONTENT_ID },
                titulo:         { type: 'string', example: 'Introducción a React' },
                total_intentos: { type: 'integer', example: 4 },
                total_fallos:   { type: 'integer', example: 3 },
                tasa_fallo:     { type: 'number',  example: 75 },
              },
            },
          },
        },
      },
      EstadisticasGlobal: {
        type: 'object',
        properties: {
          total_cursos:             { type: 'integer', example: 5 },
          total_estudiantes:        { type: 'integer', example: 30 },
          porcentaje_promedio_global: { type: 'number', example: 68.5 },
          cursos_completados:       { type: 'integer', example: 12 },
        },
      },
      Certificate: {
        type: 'object',
        description: 'Certificado de finalización de un curso.',
        properties: {
          id:                 { type: 'string', format: 'uuid',      example: CERT_ID },
          userId:             { type: 'string', format: 'uuid',      example: STUDENT_ID },
          courseId:           { type: 'string', format: 'uuid',      example: COURSE_ID },
          issuedAt:           { type: 'string', format: 'date-time', example: '2026-05-08T04:42:32.443Z' },
          url:                { type: 'string', format: 'uri',       example: 'https://plataformaiush.edu.co/certificates/verificar/37bbf000-...' },
          nombreEstudiante:   { type: 'string', nullable: true,      example: 'Juan Pérez' },
          nombreCurso:        { type: 'string', nullable: true,      example: 'React 2.0' },
          descargado:         { type: 'boolean',                     example: false },
          descargadoEn:       { type: 'string', format: 'date-time', nullable: true, example: null },
          codigoVerificacion: { type: 'string', format: 'uuid',      example: CERT_CODIGO },
          htmlRenderizado:    { type: 'string', nullable: true,      example: '<html>...</html>', description: 'HTML generado con los datos del estudiante. Null si no hay plantilla.' },
        },
      },
      PlantillaCertificado: {
        type: 'object',
        properties: {
          id:           { type: 'string', format: 'uuid', example: 'b9f8786d-2770-44e7-99dc-5e2c2c72a185' },
          idCurso:      { type: 'string', format: 'uuid', example: COURSE_ID },
          htmlTemplate: { type: 'string', example: '<html><body><h1>{{NOMBRE_ESTUDIANTE}}</h1></body></html>' },
          activo:       { type: 'boolean', example: true },
          creadoEn:     { type: 'string', format: 'date-time', example: '2026-05-15T17:51:06.890Z' },
        },
      },
      ValidacionRequest: {
        type: 'object',
        required: ['pregunta', 'respuestaCorrecta'],
        properties: {
          pregunta:          { type: 'string',  example: 'React es una biblioteca de JavaScript. ¿Verdadero o falso?' },
          respuestaCorrecta: { type: 'boolean', example: true },
        },
      },
      PlantillaRequest: {
        type: 'object',
        required: ['htmlTemplate'],
        properties: {
          htmlTemplate: {
            type: 'string',
            description: 'HTML de la plantilla. Tokens soportados: {{NOMBRE_ESTUDIANTE}}, {{NOMBRE_CURSO}}, {{FECHA}}, {{CODIGO_VERIFICACION}}.',
            example: '<html><body><h1>Certificado</h1><p><strong>{{NOMBRE_ESTUDIANTE}}</strong> completó el curso <strong>{{NOMBRE_CURSO}}</strong> el {{FECHA}}.</p><small>Código: {{CODIGO_VERIFICACION}}</small></body></html>',
          },
        },
      },
      CertificadoRequest: {
        type: 'object',
        required: ['userId', 'courseId'],
        properties: {
          userId:   { type: 'string', format: 'uuid', example: STUDENT_ID },
          courseId: { type: 'string', format: 'uuid', example: COURSE_ID },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string',  example: 'Descripción del error.' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Token ausente o inválido.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'Token de autenticación requerido. Formato: Bearer <token>' } } },
      },
      Forbidden: {
        description: 'Rol insuficiente.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'Acceso denegado. Rol requerido: Docente o Admin o SuperAdmin.' } } },
      },
      NotFound: {
        description: 'Recurso no encontrado.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'Recurso no encontrado.' } } },
      },
      Conflict: {
        description: 'El recurso ya existe.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'El certificado ya fue emitido para este estudiante y curso.' } } },
      },
      BadRequest: {
        description: 'Datos de entrada inválidos.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'El campo respuesta debe ser un valor booleano (true o false).' } } },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {

    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Estado de la API',
        security: [],
        responses: {
          200: { description: 'Servicio activo.', content: { 'application/json': { example: { status: 'UP', service: 'PlataformaIUSH-Backend', version: '1.0.0' } } } },
        },
      },
    },

    '/progreso/contenido/{id}/validar': {
      post: {
        tags: ['Progreso'],
        summary: 'Responder pregunta de validación de un contenido',
        description: `El estudiante envía su respuesta booleana para la pregunta de validación del contenido.

**Si la respuesta es correcta:**
- El contenido se marca como completado
- El porcentaje del curso se recalcula
- Si el porcentaje llega al 100%, se genera el certificado automáticamente

**Si la respuesta es incorrecta:**
- Se registra el intento (para estadísticas de tasa de fallo)
- El progreso NO cambia
- El estudiante puede intentarlo de nuevo

**Roles:** Estudiante, Admin, SuperAdmin`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: CONTENT_ID }, description: 'UUID del contenido.' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidarRequest' },
              examples: {
                correcto:   { summary: 'Respuesta correcta',   value: { respuesta: true  } },
                incorrecto: { summary: 'Respuesta incorrecta', value: { respuesta: false } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Respuesta procesada.',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, data: { $ref: '#/components/schemas/ValidarResponse' } } },
                examples: {
                  incorrecta: { summary: 'Respuesta incorrecta', value: { success: true, message: 'Respuesta incorrecta. Inténtalo de nuevo.', data: { correcto: false } } },
                  correcta50: { summary: 'Correcta — 50% progreso', value: { success: true, message: 'Respuesta correcta. Progreso actualizado.', data: { correcto: true, porcentaje: 50, completado: false, certificado: null } } },
                  correcta100: { summary: 'Correcta — curso completado', value: { success: true, message: '¡Curso completado! Certificado generado automáticamente.', data: { correcto: true, porcentaje: 100, completado: true, certificado: { id: CERT_ID, url: 'https://plataformaiush.edu.co/certificates/verificar/...' } } } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Contenido o pregunta de validación no encontrados.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'Este contenido no tiene pregunta de validación configurada.' } } } },
          409: { description: 'El estudiante ya completó este contenido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'El estudiante ya completó este contenido.' } } } },
        },
      },
    },

    '/progreso/mis-cursos': {
      get: {
        tags: ['Progreso'],
        summary: 'Mis cursos con porcentaje de avance',
        description: 'Lista todos los cursos en los que el usuario autenticado tiene actividad registrada.\n\n**Roles:** Todos',
        responses: {
          200: {
            description: 'Lista de cursos con progreso.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [{ id_progreso_curso: 'uuid', id_usuario: STUDENT_ID, id_curso: COURSE_ID, porcentaje: '100.00', contenidos_completados: 2, total_contenidos: 2, completado: true, aprobado: true, titulo_curso: 'React 2.0' }],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/progreso/curso/{id_curso}': {
      get: {
        tags: ['Progreso'],
        summary: 'Progreso en un curso específico',
        description: `Retorna el estado de avance del usuario en el curso.

Si el estudiante aún no tiene actividad, retorna 0% con totales en 0.

**Query param opcional:** \`?userId=uuid\` — solo Admin/SuperAdmin/Docente pueden consultar a otros usuarios.

**Roles:** Estudiante (solo el propio), Docente, Admin, SuperAdmin`,
        parameters: [
          { name: 'id_curso',  in: 'path',  required: true,  schema: { type: 'string', format: 'uuid', example: COURSE_ID }, description: 'UUID del curso.' },
          { name: 'userId',    in: 'query', required: false, schema: { type: 'string', format: 'uuid', example: STUDENT_ID }, description: 'UUID del estudiante (solo Admin/Docente).' },
        ],
        responses: {
          200: {
            description: 'Progreso del estudiante.',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/ProgresoCurso' } } },
                example: { success: true, data: { id: 'uuid', idUsuario: STUDENT_ID, idCurso: COURSE_ID, porcentaje: 100, contenidosCompletados: 2, totalContenidos: 2, completado: true, aprobado: true } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/progreso/curso/{id_curso}/modulos': {
      get: {
        tags: ['Progreso'],
        summary: 'Progreso desglosado por módulo',
        description: `Retorna el avance del estudiante módulo a módulo dentro del curso.

Útil para mostrar en el frontend qué porcentaje del estudiante ha completado en cada módulo.

**Query param opcional:** \`?userId=uuid\` — solo Admin/SuperAdmin/Docente pueden consultar a otros usuarios.

**Roles:** Estudiante (solo el propio), Docente, Admin, SuperAdmin`,
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id_curso', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: 'b0b0b0b0-3333-4444-8888-999999999993' }, description: 'UUID del curso.' },
          { name: 'userId',   in: 'query', required: false, schema: { type: 'string', format: 'uuid', example: STUDENT_ID }, description: 'UUID del estudiante (solo Admin/Docente).' },
        ],
        responses: {
          200: {
            description: 'Progreso por módulo.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    idUsuario: STUDENT_ID,
                    idCurso: 'b0b0b0b0-3333-4444-8888-999999999993',
                    modulos: [
                      { id_modulo: 'e0e0e0e0-5555-4444-8888-999999999995', titulo_modulo: 'Modelado Relacional', orden: 1, total_contenidos: 2, completados: 2, porcentaje_modulo: 100 },
                    ],
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/progreso/curso/{id_curso}/todos': {
      get: {
        tags: ['Progreso'],
        summary: 'Progreso de todos los estudiantes en un curso',
        description: 'Lista el avance de todos los estudiantes con actividad en el curso, ordenados por porcentaje.\n\n**Roles:** Docente, Admin, SuperAdmin',
        parameters: [{ name: 'id_curso', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: COURSE_ID } }],
        responses: {
          200: {
            description: 'Lista de progreso por estudiante.',
            content: {
              'application/json': {
                example: { success: true, data: [{ id_progreso_curso: 'uuid', id_usuario: STUDENT_ID, id_curso: COURSE_ID, porcentaje: '100.00', completado: true, nombre_estudiante: null }] },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/progreso/estadisticas/curso/{id}': {
      get: {
        tags: ['Progreso'],
        summary: 'Estadísticas detalladas de un curso',
        description: `Retorna métricas completas del curso:
- Porcentaje promedio de finalización
- Ranking de estudiantes por avance
- Contenidos con mayor tasa de fallo (basado en intentos de validación)

**Roles:** Docente, Admin, SuperAdmin`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: COURSE_ID }, description: 'UUID del curso.' }],
        responses: {
          200: {
            description: 'Estadísticas del curso.',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/EstadisticasCurso' } } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/progreso/estadisticas/global': {
      get: {
        tags: ['Progreso'],
        summary: 'Estadísticas globales de la plataforma',
        description: 'Métricas agregadas de todos los cursos y estudiantes.\n\n**Roles:** Admin, SuperAdmin',
        responses: {
          200: {
            description: 'Estadísticas globales.',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/EstadisticasGlobal' } } },
                example: { success: true, data: { total_cursos: 5, total_estudiantes: 30, porcentaje_promedio_global: 68.5, cursos_completados: 12 } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/validacion/contenido/{id}': {
      post: {
        tags: ['Validación'],
        summary: 'Crear o actualizar pregunta de validación',
        description: `Asocia una pregunta booleana a un contenido. Si ya existe una pregunta para ese contenido, la reemplaza.

El campo \`respuestaCorrecta\` nunca se expone al Estudiante en el GET.

**Roles:** Docente, Admin, SuperAdmin`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: CONTENT_ID }, description: 'UUID del contenido.' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidacionRequest' },
              example: { pregunta: 'React es una biblioteca de JavaScript. ¿Verdadero o falso?', respuestaCorrecta: true },
            },
          },
        },
        responses: {
          201: {
            description: 'Pregunta guardada.',
            content: {
              'application/json': {
                example: { success: true, data: { id: 'uuid', idContenido: CONTENT_ID, pregunta: 'React es una biblioteca de JavaScript. ¿Verdadero o falso?', activo: true, creadoEn: '2026-05-15T17:50:37.657Z' } },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      get: {
        tags: ['Validación'],
        summary: 'Obtener pregunta de validación de un contenido',
        description: `Retorna la pregunta configurada para el contenido.

El campo \`respuestaCorrecta\` se omite cuando quien consulta es un **Estudiante**.

**Roles:** Todos`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: CONTENT_ID }, description: 'UUID del contenido.' }],
        responses: {
          200: {
            description: 'Pregunta de validación.',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/ValidacionContenido' } } },
                examples: {
                  estudiante: { summary: 'Como Estudiante (sin respuesta_correcta)', value: { success: true, data: { id: 'uuid', idContenido: CONTENT_ID, pregunta: 'React es una biblioteca de JavaScript. ¿Verdadero o falso?', activo: true, creadoEn: '2026-05-15T17:50:37.657Z' } } },
                  docente: { summary: 'Como Docente (con respuesta_correcta)', value: { success: true, data: { id: 'uuid', idContenido: CONTENT_ID, pregunta: 'React es una biblioteca de JavaScript. ¿Verdadero o falso?', respuestaCorrecta: true, activo: true, creadoEn: '2026-05-15T17:50:37.657Z' } } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/certificates/plantilla/{courseId}': {
      post: {
        tags: ['Certificados'],
        summary: 'Registrar o actualizar plantilla HTML del certificado',
        description: `Asocia una plantilla HTML a un curso. Si ya existe una para ese curso, la reemplaza.

**Tokens disponibles en el HTML:**
| Token | Reemplazado por |
|-------|----------------|
| \`{{NOMBRE_ESTUDIANTE}}\` | Nombre del estudiante |
| \`{{NOMBRE_CURSO}}\` | Título del curso |
| \`{{FECHA}}\` | Fecha de emisión en español |
| \`{{CODIGO_VERIFICACION}}\` | UUID único de verificación |

**Roles:** Admin, SuperAdmin`,
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: COURSE_ID }, description: 'UUID del curso.' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlantillaRequest' },
              example: { htmlTemplate: '<html><body><h1>Certificado</h1><p>Se certifica que <strong>{{NOMBRE_ESTUDIANTE}}</strong> completó el curso <strong>{{NOMBRE_CURSO}}</strong> el {{FECHA}}.</p><small>Código: {{CODIGO_VERIFICACION}}</small></body></html>' },
            },
          },
        },
        responses: {
          201: {
            description: 'Plantilla guardada.',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/PlantillaCertificado' } } } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/certificates': {
      post: {
        tags: ['Certificados'],
        summary: 'Generar certificado manualmente',
        description: `Emite un certificado para un estudiante que ya completó el 100% del curso.

> Los certificados también se generan **automáticamente** cuando el estudiante valida correctamente el último contenido del curso.

**Roles:** Admin`,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificadoRequest' }, example: { userId: STUDENT_ID, courseId: COURSE_ID } } },
        },
        responses: {
          201: { description: 'Certificado generado.', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Certificate' } } } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'Sin permiso de rol o el curso no está al 100%.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'El estudiante debe completar el 100% del curso para recibir el certificado.' } } } },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },

    '/certificates/verificar/{codigo}': {
      get: {
        tags: ['Certificados'],
        summary: 'Verificar autenticidad de un certificado (público)',
        description: 'Endpoint **sin autenticación**. Permite verificar que un certificado es auténtico usando el código impreso en él.',
        security: [],
        parameters: [{ name: 'codigo', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: CERT_CODIGO }, description: 'Código de verificación del certificado.' }],
        responses: {
          200: {
            description: 'Certificado verificado.',
            content: {
              'application/json': {
                example: { success: true, data: { nombreEstudiante: 'Juan Pérez', nombreCurso: 'React 2.0', emitidoEn: '2026-05-08T04:42:32.443Z', url: 'https://plataformaiush.edu.co/certificates/verificar/...' } },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/certificates/usuario/{userId}': {
      get: {
        tags: ['Certificados'],
        summary: 'Listar certificados de un usuario',
        description: '**Roles:** Admin, SuperAdmin, Docente (cualquier usuario) · Estudiante (solo los propios)',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: STUDENT_ID }, description: 'UUID del usuario.' }],
        responses: {
          200: { description: 'Lista de certificados.', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Certificate' } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/certificates/{id}/preview': {
      get: {
        tags: ['Certificados'],
        summary: 'Previsualizar certificado en HTML',
        description: 'Retorna el certificado renderizado como HTML. Si el certificado fue generado sin plantilla, retorna 404.\n\n**Roles:** Admin, SuperAdmin, Docente · Estudiante (solo el propio)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: CERT_ID }, description: 'UUID del certificado.' }],
        responses: {
          200: { description: 'HTML del certificado.', content: { 'text/html': { schema: { type: 'string' }, example: '<html><body>...</body></html>' } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/certificates/{id}/descargar': {
      get: {
        tags: ['Certificados'],
        summary: 'Descargar certificado',
        description: `Marca el certificado como descargado (solo la primera vez) y retorna el HTML con header de descarga.

La fecha de primera descarga (\`descargadoEn\`) es inmutable.

**Roles:** Admin, SuperAdmin, Docente · Estudiante (solo el propio)`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid', example: CERT_ID }, description: 'UUID del certificado.' }],
        responses: {
          200: { description: 'HTML descargable del certificado.', content: { 'text/html': { schema: { type: 'string' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Evaluaciones ──────────────────────────────────────────────────────────
    '/evaluaciones/contenido/{id_contenido}/responder': {
      post: {
        tags: ['Evaluaciones'],
        summary: 'Responder evaluación de un contenido',
        description: `El estudiante envía sus respuestas para todas las preguntas de la evaluación de un contenido.

El sistema:
1. Verifica que el estudiante no haya respondido antes esta evaluación (única por usuario/evaluación)
2. Valida que cada opción seleccionada pertenece a su pregunta
3. Calcula la calificación: *(puntaje_correctas / puntaje_total) × 100*
4. **Crea automáticamente una nota** con la calificación obtenida en el módulo del contenido

**Roles permitidos:** Estudiante, Admin`,
        parameters: [
          {
            name: 'id_contenido', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: CONTENT_ID },
            description: 'UUID del contenido que contiene la evaluación.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EvaluacionRespuestaRequest' },
              example: {
                respuestas: [
                  { idEvaluacion: 1, idOpcion: 2 },
                  { idEvaluacion: 2, idOpcion: 5 },
                  { idEvaluacion: 3, idOpcion: 7 },
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Evaluación respondida. Nota creada automáticamente.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    nota: {
                      id: 'uuid-nota',
                      userId: STUDENT_ID,
                      courseId: COURSE_ID,
                      moduleId: MODULE_ID,
                      score: 75,
                      numeroIntento: 1,
                    },
                    calificacion:    75,
                    puntajeObtenido: 15,
                    puntajeTotal:    20,
                    detalle: [
                      { idEvaluacion: 1, enunciado: '¿Qué es un componente en React?', esCorrecta: true,  puntaje: 10 },
                      { idEvaluacion: 2, enunciado: '¿Qué hace useState?',             esCorrecta: false, puntaje: 10 },
                    ],
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: 'Contenido o evaluación no encontrado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { success: false, message: 'No se encontraron preguntas para este contenido.' },
              },
            },
          },
          409: {
            description: 'El estudiante ya respondió esta evaluación.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { success: false, message: 'Ya respondiste la evaluación de este contenido.' },
              },
            },
          },
        },
      },
    },

    // ── Reportes ──────────────────────────────────────────────────────────────
    '/api/reportes/cursos-populares': {
      get: {
        tags: ['Reportes'],
        summary: 'Cursos más populares por inscritos',
        description: `Retorna los cursos ordenados de mayor a menor número de inscritos (solo cursos no eliminados).\n\n**Roles permitidos:** Admin, SuperAdmin`,
        parameters: [
          {
            name: 'curso_id', in: 'query', required: false,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'Filtra la respuesta a un único curso.',
          },
        ],
        responses: {
          200: { description: 'Lista de cursos con total de inscritos.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          503: { description: 'Vista de BD no disponible.' },
        },
      },
    },

    '/api/reportes/inscripciones-por-periodo': {
      get: {
        tags: ['Reportes'],
        summary: 'Inscripciones por período',
        description: `Agrupa inscripciones por el período indicado. Para modos de palabra clave el año se toma automáticamente del año actual y **siempre** se devuelven todas las filas aunque estén en 0.

**Modos disponibles:**
- \`mensual\` → 12 filas (Enero – Diciembre del año actual)
- \`trimestral\` → 4 filas (T1 – T4 del año actual)
- \`semestral\` → 2 filas (1S – 2S del año actual)
- \`anual\` → 1 fila (total del año actual)
- \`custom\` → requiere \`fecha_inicio\` y \`fecha_fin\`, agrupa por mes dentro del rango

**Roles permitidos:** Admin, SuperAdmin`,
        parameters: [
          {
            name: 'agrupacion', in: 'query', required: false,
            schema: { type: 'string', enum: ['mensual', 'trimestral', 'semestral', 'anual', 'custom'], example: 'mensual' },
            description: 'Tipo de agrupación. Si se omite o es "custom" se requieren fecha_inicio y fecha_fin.',
          },
          {
            name: 'fecha_inicio', in: 'query', required: false,
            schema: { type: 'string', format: 'date', example: '2026-01-01' },
            description: 'Obligatorio cuando agrupacion=custom. Formato YYYY-MM-DD.',
          },
          {
            name: 'fecha_fin', in: 'query', required: false,
            schema: { type: 'string', format: 'date', example: '2026-06-30' },
            description: 'Obligatorio cuando agrupacion=custom. Formato YYYY-MM-DD.',
          },
          {
            name: 'curso_id', in: 'query', required: false,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'Filtra las inscripciones a un único curso.',
          },
        ],
        responses: {
          200: { description: 'Inscripciones agrupadas por período.' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          503: { description: 'Vista de BD no disponible.' },
        },
      },
    },

    '/api/reportes/intentos-por-modulo': {
      get: {
        tags: ['Reportes'],
        summary: 'Promedio de intentos para aprobar por módulo',
        description: `Muestra el promedio de intentos que los estudiantes necesitan para aprobar cada módulo.\n\n**Roles permitidos:** Admin, SuperAdmin`,
        parameters: [
          {
            name: 'curso_id', in: 'query', required: false,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'Filtra los módulos pertenecientes a ese curso.',
          },
          {
            name: 'fecha_inicio', in: 'query', required: false,
            schema: { type: 'string', format: 'date', example: '2026-01-01' },
            description: 'Filtra módulos cuyo último intento sea igual o posterior a esta fecha. Formato YYYY-MM-DD.',
          },
          {
            name: 'fecha_fin', in: 'query', required: false,
            schema: { type: 'string', format: 'date', example: '2026-06-30' },
            description: 'Filtra módulos cuyo último intento sea igual o anterior a esta fecha. Formato YYYY-MM-DD.',
          },
        ],
        responses: {
          200: { description: 'Promedio de intentos por módulo.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          503: { description: 'Vista de BD no disponible.' },
        },
      },
    },

    '/api/reportes/tasa-aprobacion': {
      get: {
        tags: ['Reportes'],
        summary: 'Tasa de completitud por curso',
        description: `Muestra cuántos estudiantes completaron y no completaron cada curso, junto con el porcentaje de completitud.\n\n**Roles permitidos:** Admin, SuperAdmin`,
        parameters: [
          {
            name: 'curso_id', in: 'query', required: false,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'Filtra la respuesta a un único curso.',
          },
          {
            name: 'fecha_inicio', in: 'query', required: false,
            schema: { type: 'string', format: 'date', example: '2026-01-01' },
            description: 'Filtra cursos cuya inscripción más reciente sea igual o posterior a esta fecha. Formato YYYY-MM-DD.',
          },
          {
            name: 'fecha_fin', in: 'query', required: false,
            schema: { type: 'string', format: 'date', example: '2026-06-30' },
            description: 'Filtra cursos cuya inscripción más reciente sea igual o anterior a esta fecha. Formato YYYY-MM-DD.',
          },
        ],
        responses: {
          200: { description: 'Tasa de completitud por curso.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          503: { description: 'Vista de BD no disponible.' },
        },
      },
    },

    '/api/reportes/cursos-activos-vs-inactivos': {
      get: {
        tags: ['Reportes'],
        summary: 'Cursos activos vs inactivos',
        description: `Resumen global: total de cursos no eliminados, cuántos están activos y cuántos inactivos.\n\n**Roles permitidos:** Admin, SuperAdmin`,
        responses: {
          200: { description: 'Comparativo de cursos activos vs inactivos.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          503: { description: 'Vista de BD no disponible.' },
        },
      },
    },

    '/api/reportes/certificados': {
      get: {
        tags: ['Reportes'],
        summary: 'Certificados emitidos vs descargados',
        description: `Resumen global: total de certificados emitidos, cuántos fueron descargados y el porcentaje de descarga.\n\n**Roles permitidos:** Admin, SuperAdmin`,
        responses: {
          200: { description: 'Comparativo de certificados emitidos vs descargados.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          503: { description: 'Vista de BD no disponible.' },
        },
      },
    },

    '/evaluaciones/contenido/{id_contenido}/resultado/{userId}': {
      get: {
        tags: ['Evaluaciones'],
        summary: 'Resultado de evaluación de un estudiante',
        description: `Retorna el detalle del resultado de un estudiante en la evaluación de un contenido, incluyendo puntaje y calificación.

**Roles permitidos:** Admin, SuperAdmin, Docente (cualquier estudiante) · Estudiante (solo el propio)`,
        parameters: [
          {
            name: 'id_contenido', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: CONTENT_ID },
            description: 'UUID del contenido.',
          },
          {
            name: 'userId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: STUDENT_ID },
            description: 'UUID del estudiante.',
          },
        ],
        responses: {
          200: {
            description: 'Resultado de la evaluación.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    userId:          STUDENT_ID,
                    idContenido:     CONTENT_ID,
                    calificacion:    75,
                    puntajeObtenido: 15,
                    puntajeTotal:    20,
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition,
  apis: [
    './src/routes/teacher.routes.js',
    './src/routes/curso.routes.js',
    './src/routes/authRoutes.js',
    './src/routes/superadminRoutes.js',
    './src/routes/modulo.routes.js',
    './src/routes/contenido.routes.js',
    './src/routes/adminDashboardRoutes.js',
    './src/routes/institucionRoutes.js',
    './src/routes/certificateRoutes.js',
    './src/routes/progresoRoutes.js',
    './src/routes/validacionRoutes.js',
    './src/routes/archivos/documentosRouter.js'
  ],
});
export default swaggerSpec;