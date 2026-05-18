import swaggerJsdoc from 'swagger-jsdoc';

const STUDENT_ID  = 'fdb51787-747c-4c2c-8ed7-2bc9ebc62145';
const DOCENTE_ID  = 'c98d3456-0899-4ce7-ad4d-ed3f69095c77';
const ADMIN_ID    = 'f821425b-0e37-47d4-898e-c47d7ff98658';
const SA_ID       = '0b36846d-c1e9-4d67-a7b6-043638b3112d';
const COURSE_ID   = '2346196f-091b-4cb3-beb8-128bca3ad069';
const MODULE_ID   = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const CONTENT_ID  = 'c1111111-0000-0000-0000-000000000001';
const CERT_ID     = '626491ee-21ee-497e-a441-d35794c64ddc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'PlataformaIUSH — API REST',
    version: '1.0.0',
    description: `
## Plataforma Educativa IUSH · Backend — Equipo 5

API REST para el módulo de **Notas, Progreso y Certificaciones** del sistema educativo PlataformaIUSH.

### Módulos de este equipo
| Prefijo | Descripción |
|---------|-------------|
| \`/grades\` | Gestión de calificaciones por módulo |
| \`/progreso\` | Seguimiento de progreso por contenido y curso |
| \`/certificates\` | Generación y descarga de certificados |
| \`/evaluaciones\` | Respuesta de evaluaciones con calificación automática |

### Autenticación
Todos los endpoints requieren un **Bearer Token** en el header \`Authorization\`.

\`\`\`
Authorization: Bearer token-estudiante-001
\`\`\`

#### Tokens de prueba disponibles
| Token | Rol | userId |
|-------|-----|--------|
| \`token-superadmin-001\` | SuperAdmin | \`${SA_ID}\` |
| \`token-admin-001\` | Admin | \`${ADMIN_ID}\` |
| \`token-docente-001\` | Docente | \`${DOCENTE_ID}\` |
| \`token-estudiante-001\` | Estudiante | \`${STUDENT_ID}\` |

### Reglas de negocio — Equipo 5
- La nota de cada módulo se registra con **número de intento** automático (múltiples intentos permitidos)
- El promedio se calcula usando el **último intento** de cada módulo
- El **progreso de un curso** se actualiza automáticamente al completar cada contenido
- El **certificado** se emite automáticamente al alcanzar el **100 % de progreso** del curso
- No se duplican certificados por estudiante/curso
- Un **Estudiante** solo puede consultar su propia información
- Un **Docente** solo puede consultar información de sus propios cursos
    `,
    contact: { name: 'Equipo 5 — PlataformaIUSH', email: 'dev@plataformaiush.edu.co' },
    license: { name: 'ISC' },
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Desarrollo local' },
  ],
  tags: [
    { name: 'Sistema',      description: 'Estado y salud de la API' },
    { name: 'Cursos',       description: 'Gestión de cursos — Equipo 1' },
    { name: 'Modulos',      description: 'Gestión de módulos — Equipo 1' },
    { name: 'Contenidos',   description: 'Gestión de contenidos — Equipo 1' },
    { name: 'Notas',        description: 'Gestión de calificaciones por módulo y curso' },
    { name: 'Progreso',     description: 'Seguimiento de avance por contenido; al 100% genera nota y certificado automáticamente' },
    { name: 'Certificados', description: 'Generación, consulta y descarga de certificados de finalización' },
    { name: 'Evaluaciones', description: 'Envío de respuestas con corrección automática y creación de nota' },
    { name: 'Teacher', description: 'Orquestación Vista Docente (Equipo 6)' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa uno de los tokens de prueba listados en la descripción de la API.',
      },
    },
    schemas: {

      // ── Core entities ──────────────────────────────────────────────────────
      Grade: {
        type: 'object',
        description: 'Registro de nota de un estudiante en un módulo de un curso.',
        properties: {
          id:            { type: 'string', format: 'uuid',      example: CERT_ID },
          userId:        { type: 'string', format: 'uuid',      example: STUDENT_ID },
          courseId:      { type: 'string', format: 'uuid',      example: COURSE_ID },
          moduleId:      { type: 'string', format: 'uuid',      example: MODULE_ID },
          score:         { type: 'number', minimum: 0, maximum: 100, example: 88 },
          evaluacionId:  { type: 'integer', nullable: true,     example: null, description: 'Nulo cuando la nota se genera por progreso; entero cuando proviene de una evaluación.' },
          numeroIntento: { type: 'integer', minimum: 1,         example: 3, description: 'Se incrementa automáticamente por cada nota registrada en el mismo módulo/curso.' },
          createdAt:     { type: 'string', format: 'date-time', example: '2026-05-09T13:30:15.330Z' },
        },
      },

      Certificate: {
        type: 'object',
        description: 'Certificado de finalización de un curso.',
        properties: {
          id:               { type: 'string', format: 'uuid',      example: CERT_ID },
          userId:           { type: 'string', format: 'uuid',      example: STUDENT_ID },
          courseId:         { type: 'string', format: 'uuid',      example: COURSE_ID },
          issuedAt:         { type: 'string', format: 'date-time', example: '2026-05-08T04:42:32.443Z' },
          url:              { type: 'string', format: 'uri',       example: 'https://certs.eduplatform.com/verify/4fd91d4a-274b-46d7-85e8-9f7329f657ea' },
          idMaestroDocumento: { type: 'string', nullable: true,    example: null },
          imagenUrl:        { type: 'string',  nullable: true,     example: null, description: 'URL de la imagen/plantilla del certificado; null si el servicio externo no está disponible.' },
          nombreEstudiante: { type: 'string',  nullable: true,     example: 'Estudiante Base' },
          nombreCurso:      { type: 'string',  nullable: true,     example: 'React 2.0' },
          descargado:       { type: 'boolean',                     example: true },
          descargadoEn:     { type: 'string',  format: 'date-time', nullable: true, example: '2026-05-09T12:53:55.988Z' },
        },
      },

      ProgresoCurso: {
        type: 'object',
        description: 'Estado de progreso de un estudiante en un curso.',
        properties: {
          id:                    { type: 'string', format: 'uuid',      example: 'c7132421-c558-46b1-9edc-871643859181' },
          idUsuario:             { type: 'string', format: 'uuid',      example: STUDENT_ID },
          idCurso:               { type: 'string', format: 'uuid',      example: COURSE_ID },
          porcentaje:            { type: 'number', minimum: 0, maximum: 100, example: 100 },
          contenidosCompletados: { type: 'integer', example: 2 },
          totalContenidos:       { type: 'integer', example: 2 },
          completado:            { type: 'boolean', example: true },
          aprobado:              { type: 'boolean', example: true },
          fechaInicio:           { type: 'string', format: 'date-time', example: '2026-05-08T05:56:33.303Z' },
          fechaCompletado:       { type: 'string', format: 'date-time', nullable: true, example: '2026-05-08T05:56:36.067Z' },
        },
      },

      CompletarContenidoResponse: {
        type: 'object',
        description: 'Resultado de marcar un contenido como completado.',
        properties: {
          progreso:              { $ref: '#/components/schemas/ProgresoCurso' },
          contenido: {
            type: 'object',
            properties: {
              id:     { type: 'string', format: 'uuid', example: CONTENT_ID },
              modulo: { type: 'string', example: 'Módulo 1 — Fundamentos de React' },
              curso:  { type: 'string', example: 'React 2.0' },
            },
          },
          porcentaje:            { type: 'number', example: 100 },
          contenidosCompletados: { type: 'integer', example: 2 },
          totalContenidos:       { type: 'integer', example: 2 },
          completado:            { type: 'boolean', example: true },
          aprobado:              { type: 'boolean', example: true },
          nota:                  { $ref: '#/components/schemas/Grade', nullable: true, description: 'Nota automática generada si el curso se completó al 100 %. Null si aún no se completó.' },
          certificado:           { $ref: '#/components/schemas/Certificate', nullable: true, description: 'Certificado generado automáticamente al completar el 100 %. Null si aún no se completó.' },
        },
      },

      AverageResponse: {
        type: 'object',
        description: 'Promedio del estudiante en un curso (último intento por módulo).',
        properties: {
          userId:       { type: 'string', format: 'uuid', example: STUDENT_ID },
          courseId:     { type: 'string', format: 'uuid', example: COURSE_ID },
          average:      { type: 'number',  example: 81.5 },
          totalModules: { type: 'integer', example: 2 },
          minPassing:   { type: 'number',  example: 60 },
          isPassing:    { type: 'boolean', example: true },
        },
      },

      EstadisticasCurso: {
        type: 'object',
        description: 'Estadísticas globales y por módulo de un curso.',
        properties: {
          courseId:          { type: 'string', format: 'uuid', example: COURSE_ID },
          total_estudiantes: { type: 'integer', example: 1 },
          promedio_general:  { type: 'number',  example: 77.07 },
          total_aprobados:   { type: 'integer', example: 12 },
          total_reprobados:  { type: 'integer', example: 2 },
          nota_maxima:       { type: 'number',  example: 100 },
          nota_minima:       { type: 'number',  example: 45 },
          promedio_intentos: { type: 'number',  example: 3 },
          por_modulo: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id_modulo:         { type: 'string', format: 'uuid', example: MODULE_ID },
                total_estudiantes: { type: 'integer', example: 1 },
                promedio:          { type: 'number',  example: 73.5 },
                nota_maxima:       { type: 'number',  example: 100 },
                nota_minima:       { type: 'number',  example: 45 },
                promedio_intentos: { type: 'number',  example: 4.5 },
                max_intentos:      { type: 'integer', example: 8 },
              },
            },
          },
        },
      },

      DownloadResponse: {
        type: 'object',
        properties: {
          message:          { type: 'string', example: 'Descarga lista. Accede a la URL para obtener el PDF.' },
          downloadUrl:      { type: 'string', format: 'uri', example: 'https://certs.eduplatform.com/verify/4fd91d4a-274b-46d7-85e8-9f7329f657ea' },
          imagenUrl:        { type: 'string', nullable: true, example: null },
          nombreEstudiante: { type: 'string', nullable: true, example: 'Estudiante Base' },
          nombreCurso:      { type: 'string', nullable: true, example: 'React 2.0' },
          descargado:       { type: 'boolean', example: true },
          descargadoEn:     { type: 'string', format: 'date-time', nullable: true, example: '2026-05-09T12:53:55.988Z' },
          certificate:      { $ref: '#/components/schemas/Certificate' },
        },
      },

      // ── Request bodies ─────────────────────────────────────────────────────
      GradeRequest: {
        type: 'object',
        required: ['userId', 'courseId', 'moduleId', 'score'],
        properties: {
          userId:      { type: 'string', format: 'uuid', example: STUDENT_ID },
          courseId:    { type: 'string', format: 'uuid', example: COURSE_ID },
          moduleId:    { type: 'string', format: 'uuid', example: MODULE_ID },
          score:       { type: 'number', minimum: 0, maximum: 100, example: 88 },
          evaluacionId:{ type: 'integer', nullable: true, example: null, description: 'Opcional. ID de la evaluación asociada.' },
        },
      },

      CertificateRequest: {
        type: 'object',
        required: ['userId', 'courseId'],
        properties: {
          userId:   { type: 'string', format: 'uuid', example: STUDENT_ID },
          courseId: { type: 'string', format: 'uuid', example: COURSE_ID },
        },
      },

      EvaluacionRespuestaRequest: {
        type: 'object',
        required: ['respuestas'],
        properties: {
          respuestas: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['idEvaluacion', 'idOpcion'],
              properties: {
                idEvaluacion: { type: 'integer', example: 1, description: 'ID de la pregunta.' },
                idOpcion:     { type: 'integer', example: 3, description: 'ID de la opción seleccionada.' },
              },
            },
          },
        },
      },

      // ── Envelope responses ─────────────────────────────────────────────────
      SuccessGrade: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data:    { $ref: '#/components/schemas/Grade' },
        },
      },
      SuccessGradeList: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data:    { type: 'array', items: { $ref: '#/components/schemas/Grade' } },
        },
      },
      SuccessCertificate: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data:    { $ref: '#/components/schemas/Certificate' },
        },
      },
      SuccessCertificateList: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data:    { type: 'array', items: { $ref: '#/components/schemas/Certificate' } },
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
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Token de autenticación requerido. Formato: Bearer <token>' },
          },
        },
      },
      Forbidden: {
        description: 'El rol del usuario no tiene permiso para este endpoint.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Acceso denegado. Rol insuficiente.' },
          },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Recurso no encontrado.' },
          },
        },
      },
      Conflict: {
        description: 'Recurso ya existente (duplicado).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'El certificado ya fue emitido para este estudiante y curso.' },
          },
        },
      },
      BadRequest: {
        description: 'Datos de entrada inválidos.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'La nota debe ser un número entre 0 y 100.' },
          },
        },
      },
    },
  },

  security: [{ BearerAuth: [] }],

  paths: {

    // ── Sistema ───────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Estado de la API',
        description: 'Verifica que el servicio está activo. No requiere autenticación.',
        security: [],
        responses: {
          200: {
            description: 'Servicio operativo.',
            content: {
              'application/json': {
                example: { status: 'UP', service: 'PlataformaIUSH-Backend', version: '1.0.0' },
              },
            },
          },
        },
      },
    },

    // ── Notas ─────────────────────────────────────────────────────────────────
    '/grades': {
      post: {
        tags: ['Notas'],
        summary: 'Registrar nota manualmente',
        description: `Registra la nota de un estudiante en un módulo de un curso.

El campo **numeroIntento** se calcula automáticamente contando los intentos previos del mismo estudiante/módulo/curso.

**Roles permitidos:** Docente, Admin, SuperAdmin`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GradeRequest' },
              examples: {
                ejemplo1: {
                  summary: 'Nota 88 en módulo',
                  value: { userId: STUDENT_ID, courseId: COURSE_ID, moduleId: MODULE_ID, score: 88 },
                },
                ejemplo2: {
                  summary: 'Nota 72 con evaluación',
                  value: { userId: STUDENT_ID, courseId: COURSE_ID, moduleId: MODULE_ID, score: 72, evaluacionId: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Nota registrada correctamente.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessGrade' } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/grades/student/{userId}': {
      get: {
        tags: ['Notas'],
        summary: 'Notas de un estudiante',
        description: `Lista todas las notas de un estudiante en todos sus cursos (todos los intentos).

**Roles permitidos:**
- Admin / SuperAdmin / Docente → cualquier estudiante
- Estudiante → solo sus propias notas`,
        parameters: [
          {
            name: 'userId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: STUDENT_ID },
            description: 'UUID del estudiante.',
          },
        ],
        responses: {
          200: {
            description: 'Lista de notas.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessGradeList' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/grades/course/{courseId}': {
      get: {
        tags: ['Notas'],
        summary: 'Todas las notas de un curso',
        description: `Retorna todas las notas registradas en un curso (todos los estudiantes y todos los intentos).

**Roles permitidos:** Admin, SuperAdmin, Docente (solo sus cursos)`,
        parameters: [
          {
            name: 'courseId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'UUID del curso.',
          },
        ],
        responses: {
          200: {
            description: 'Lista de notas.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessGradeList' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/grades/course/{courseId}/average/{userId}': {
      get: {
        tags: ['Notas'],
        summary: 'Promedio de un estudiante en un curso',
        description: `Calcula el promedio usando el **último intento** de cada módulo.

Indica si el estudiante supera la nota mínima aprobatoria (60).

**Roles permitidos:**
- Admin / SuperAdmin / Docente → cualquier estudiante
- Estudiante → solo su propio promedio`,
        parameters: [
          {
            name: 'courseId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'UUID del curso.',
          },
          {
            name: 'userId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: STUDENT_ID },
            description: 'UUID del estudiante.',
          },
        ],
        responses: {
          200: {
            description: 'Promedio calculado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data:    { $ref: '#/components/schemas/AverageResponse' },
                  },
                },
                example: {
                  success: true,
                  data: {
                    userId:       STUDENT_ID,
                    courseId:     COURSE_ID,
                    average:      81.5,
                    totalModules: 2,
                    minPassing:   60,
                    isPassing:    true,
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

    '/grades/course/{courseId}/estadisticas': {
      get: {
        tags: ['Notas'],
        summary: 'Estadísticas completas de un curso',
        description: `Retorna métricas globales y por módulo del curso: promedios, aprobados/reprobados, intentos, etc.

**Roles permitidos:** Admin, SuperAdmin`,
        parameters: [
          {
            name: 'courseId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'UUID del curso.',
          },
        ],
        responses: {
          200: {
            description: 'Estadísticas del curso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data:    { $ref: '#/components/schemas/EstadisticasCurso' },
                  },
                },
                example: {
                  success: true,
                  data: {
                    courseId:          COURSE_ID,
                    total_estudiantes: 1,
                    promedio_general:  77.07,
                    total_aprobados:   12,
                    total_reprobados:  2,
                    nota_maxima:       100,
                    nota_minima:       45,
                    promedio_intentos: 3,
                    por_modulo: [
                      { id_modulo: MODULE_ID, total_estudiantes: 1, promedio: 73.5, nota_maxima: 100, nota_minima: 45, promedio_intentos: 4.5, max_intentos: 8 },
                    ],
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

    // ── Progreso ──────────────────────────────────────────────────────────────
    '/progreso/contenido/{id_contenido}/completar': {
      post: {
        tags: ['Progreso'],
        summary: 'Marcar contenido como completado',
        description: `El estudiante marca un contenido como completado. El sistema:

1. Valida que el contenido existe y está activo
2. Verifica que no haya sido completado ya (idempotente: error 409)
3. Registra el progreso en la tabla \`progreso_estudiante\`
4. Recalcula el **porcentaje del curso** = *(completados / total activos) × 100*
5. Si llega al **100%** automáticamente:
   - Crea una **nota de 100** en el módulo
   - Genera el **certificado del curso**

**Roles permitidos:** Estudiante, Admin, SuperAdmin`,
        parameters: [
          {
            name: 'id_contenido', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: CONTENT_ID },
            description: 'UUID del contenido a completar.',
          },
        ],
        requestBody: { required: false, content: {} },
        responses: {
          200: {
            description: 'Progreso actualizado. Si el curso se completó al 100%, incluye nota y certificado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string',  example: '¡Curso completado! Certificado generado automáticamente.' },
                    data:    { $ref: '#/components/schemas/CompletarContenidoResponse' },
                  },
                },
                examples: {
                  enProgreso: {
                    summary: 'Contenido completado — curso en progreso',
                    value: {
                      success: true,
                      message: 'Progreso actualizado: 50%',
                      data: {
                        porcentaje: 50,
                        contenidosCompletados: 1,
                        totalContenidos: 2,
                        completado: false,
                        aprobado: false,
                        nota: null,
                        certificado: null,
                      },
                    },
                  },
                  cursoCompletado: {
                    summary: 'Último contenido — curso completado al 100%',
                    value: {
                      success: true,
                      message: '¡Curso completado! Certificado generado automáticamente.',
                      data: {
                        porcentaje: 100,
                        contenidosCompletados: 2,
                        totalContenidos: 2,
                        completado: true,
                        aprobado: true,
                        nota: { id: 'uuid', score: 100, numeroIntento: 1 },
                        certificado: { id: CERT_ID, url: 'https://certs.eduplatform.com/verify/...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Contenido inactivo.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { success: false, message: 'El contenido no está activo.' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: 'Contenido no encontrado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { success: false, message: 'Contenido no encontrado.' },
              },
            },
          },
          409: {
            description: 'El estudiante ya completó este contenido.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { success: false, message: 'El estudiante ya completó este contenido.' },
              },
            },
          },
        },
      },
    },

    '/progreso/mis-cursos': {
      get: {
        tags: ['Progreso'],
        summary: 'Mis cursos con progreso',
        description: `Lista todos los cursos en los que el usuario autenticado tiene progreso registrado, con porcentaje y estado de completado.

**Roles permitidos:** Estudiante, Docente, Admin, SuperAdmin`,
        responses: {
          200: {
            description: 'Lista de cursos con progreso del usuario.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    {
                      id_progreso_curso:       'c7132421-c558-46b1-9edc-871643859181',
                      id_usuario:              STUDENT_ID,
                      id_curso:                COURSE_ID,
                      porcentaje:              '100.00',
                      contenidos_completados:  2,
                      total_contenidos:        2,
                      completado:              true,
                      aprobado:                true,
                      fecha_inicio:            '2026-05-08T05:56:33.303Z',
                      fecha_completado:        '2026-05-08T05:56:36.067Z',
                      titulo_curso:            'React 2.0',
                    },
                  ],
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
        summary: 'Progreso de un estudiante en un curso',
        description: `Retorna el estado de progreso del usuario autenticado (o el especificado en \`?userId=\`) en un curso.

Si el estudiante aún no tiene actividad en el curso, retorna un objeto con porcentaje 0.

**Query param opcional:** \`?userId=uuid\` — solo Admin/SuperAdmin/Docente pueden consultar el progreso de otros usuarios.

**Roles permitidos:** Estudiante (solo el propio), Docente, Admin, SuperAdmin`,
        parameters: [
          {
            name: 'id_curso', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'UUID del curso.',
          },
          {
            name: 'userId', in: 'query', required: false,
            schema: { type: 'string', format: 'uuid', example: STUDENT_ID },
            description: 'UUID del estudiante a consultar (solo Admin/Docente).',
          },
        ],
        responses: {
          200: {
            description: 'Progreso del estudiante en el curso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data:    { $ref: '#/components/schemas/ProgresoCurso' },
                  },
                },
                example: {
                  success: true,
                  data: {
                    id:                    'c7132421-c558-46b1-9edc-871643859181',
                    idUsuario:             STUDENT_ID,
                    idCurso:               COURSE_ID,
                    porcentaje:            100,
                    contenidosCompletados: 2,
                    totalContenidos:       2,
                    completado:            true,
                    aprobado:              true,
                    fechaInicio:           '2026-05-08T05:56:33.303Z',
                    fechaCompletado:       '2026-05-08T05:56:36.067Z',
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
        description: `Lista el progreso de todos los estudiantes que tienen actividad en el curso, ordenados por porcentaje descendente.

Útil para el panel del docente o administrador.

**Roles permitidos:** Admin, SuperAdmin, Docente`,
        parameters: [
          {
            name: 'id_curso', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'UUID del curso.',
          },
        ],
        responses: {
          200: {
            description: 'Lista de progreso por estudiante.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    {
                      id_progreso_curso:      'c7132421-c558-46b1-9edc-871643859181',
                      id_usuario:             STUDENT_ID,
                      id_curso:               COURSE_ID,
                      porcentaje:             '100.00',
                      contenidos_completados: 2,
                      total_contenidos:       2,
                      completado:             true,
                      aprobado:               true,
                      fecha_inicio:           '2026-05-08T05:56:33.303Z',
                      fecha_completado:       '2026-05-08T05:56:36.067Z',
                      nombre_estudiante:      null,
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ── Certificados ──────────────────────────────────────────────────────────
    '/certificates': {
      post: {
        tags: ['Certificados'],
        summary: 'Generar certificado manualmente',
        description: `Emite un certificado para un estudiante en un curso.

**Requisito:** el estudiante debe tener el 100 % del curso completado en \`progreso_curso\`.

- \`403\` si el progreso no es 100 %
- \`409\` si el certificado ya fue emitido

> El certificado también se genera **automáticamente** al completar el último contenido del curso.

**Roles permitidos:** Admin (no Docente, no SuperAdmin)`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CertificateRequest' },
              example: { userId: STUDENT_ID, courseId: COURSE_ID },
            },
          },
        },
        responses: {
          201: {
            description: 'Certificado generado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessCertificate' } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: {
            description: 'Sin permiso de rol o el curso no está completado al 100 %.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  rolForbidden: {
                    summary: 'Rol sin permiso',
                    value: { success: false, message: 'Acceso denegado. Rol insuficiente.' },
                  },
                  noCompletado: {
                    summary: 'Progreso menor al 100 %',
                    value: { success: false, message: 'El estudiante debe completar el 100% del curso para recibir el certificado.' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },

    '/certificates/{userId}': {
      get: {
        tags: ['Certificados'],
        summary: 'Certificados de un usuario',
        description: `Lista todos los certificados emitidos a un usuario.

**Roles permitidos:** Admin, SuperAdmin, Docente (cualquier usuario) · Estudiante (solo los propios)`,
        parameters: [
          {
            name: 'userId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: STUDENT_ID },
            description: 'UUID del usuario.',
          },
        ],
        responses: {
          200: {
            description: 'Lista de certificados.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessCertificateList' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/certificates/{userId}/course/{courseId}/download': {
      get: {
        tags: ['Certificados'],
        summary: 'Descargar certificado',
        description: `Devuelve la URL de verificación/descarga del PDF y marca el certificado como descargado.

El campo \`descargadoEn\` se registra solo la primera vez.

**Roles permitidos:** Admin, SuperAdmin, Docente · Estudiante (solo el propio)`,
        parameters: [
          {
            name: 'userId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: STUDENT_ID },
            description: 'UUID del usuario.',
          },
          {
            name: 'courseId', in: 'path', required: true,
            schema: { type: 'string', format: 'uuid', example: COURSE_ID },
            description: 'UUID del curso.',
          },
        ],
        responses: {
          200: {
            description: 'URL de descarga del certificado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data:    { $ref: '#/components/schemas/DownloadResponse' },
                  },
                },
                example: {
                  success: true,
                  data: {
                    message:          'Descarga lista. Accede a la URL para obtener el PDF.',
                    downloadUrl:      'https://certs.eduplatform.com/verify/4fd91d4a-274b-46d7-85e8-9f7329f657ea',
                    imagenUrl:        null,
                    nombreEstudiante: null,
                    nombreCurso:      null,
                    descargado:       true,
                    descargadoEn:     '2026-05-09T12:53:55.988Z',
                    certificate:      { id: CERT_ID, userId: STUDENT_ID, courseId: COURSE_ID },
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
    './src/routes/modulo.routes.js',
    './src/routes/contenido.routes.js'
  ],
});
export default swaggerSpec;
