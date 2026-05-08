import swaggerJsdoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'PlataformaIUSH — API REST',
    version: '1.0.0',
    description: `
## Plataforma Educativa IUSH · Backend

API REST para el sistema educativo PlataformaIUSH.

### Módulos disponibles
| Módulo | Prefijo | Equipo |
|--------|---------|--------|
| Notas y Certificaciones | \`/grades\` \`/certificates\` | Equipo 5 |

### Autenticación
Todos los endpoints requieren un **Bearer Token** en el header \`Authorization\`.

#### Tokens de prueba:
| Token | Rol | userId |
|-------|-----|--------|
| \`token-admin-001\` | ADMIN | usr-001 |
| \`token-docente-001\` | DOCENTE | usr-002 |
| \`token-estudiante-001\` | ESTUDIANTE | usr-003 |
| \`token-estudiante-002\` | ESTUDIANTE | usr-004 |

### Reglas de negocio — Equipo 5
- Nota mínima aprobatoria: **60 / 100**
- Certificado solo se emite si el promedio ≥ 60
- No se duplican certificados por estudiante/curso
- ESTUDIANTE solo puede consultar su propia información
    `,
    contact: { name: 'PlataformaIUSH', email: 'dev@plataformaiush.edu.co' },
    license: { name: 'ISC' },
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Desarrollo local' },
  ],
  tags: [
    { name: 'Sistema',        description: 'Estado y salud de la API' },
    { name: 'Notas',          description: '[Equipo 5] Gestión de notas por módulos y cursos' },
    { name: 'Certificados',   description: '[Equipo 5] Generación y consulta de certificados' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        description: 'Ingresa uno de los tokens de prueba listados en la descripción.',
      },
    },
    schemas: {
      Grade: {
        type: 'object',
        properties: {
          id:        { type: 'string', format: 'uuid',      example: 'c3f2a1b4-9e8d-4c5f-a2b1-d3e4f5a6b7c8' },
          userId:    { type: 'string',                      example: 'usr-003' },
          courseId:  { type: 'string',                      example: 'CS101' },
          moduleId:  { type: 'string',                      example: 'mod-1' },
          score:     { type: 'number', minimum: 0, maximum: 100, example: 75 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-04-25T10:30:00.000Z' },
        },
      },
      Certificate: {
        type: 'object',
        properties: {
          id:       { type: 'string', format: 'uuid',      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          userId:   { type: 'string',                      example: 'usr-003' },
          courseId: { type: 'string',                      example: 'CS101' },
          issuedAt: { type: 'string', format: 'date-time', example: '2026-04-25T12:00:00.000Z' },
          url:      { type: 'string', format: 'uri',       example: 'https://certs.eduplatform.com/verify/f7e8d9...' },
        },
      },
      AverageResponse: {
        type: 'object',
        properties: {
          userId:       { type: 'string',  example: 'usr-003' },
          courseId:     { type: 'string',  example: 'CS101' },
          average:      { type: 'number',  example: 75.67 },
          totalModules: { type: 'integer', example: 3 },
          minPassing:   { type: 'number',  example: 60 },
          isPassing:    { type: 'boolean', example: true },
        },
      },
      DownloadResponse: {
        type: 'object',
        properties: {
          message:     { type: 'string', example: 'Descarga lista. Accede a la URL para obtener el PDF.' },
          downloadUrl: { type: 'string', format: 'uri' },
          certificate: { $ref: '#/components/schemas/Certificate' },
        },
      },
      GradeRequest: {
        type: 'object',
        required: ['userId', 'courseId', 'moduleId', 'score'],
        properties: {
          userId:   { type: 'string', example: 'usr-003' },
          courseId: { type: 'string', example: 'CS101' },
          moduleId: { type: 'string', example: 'mod-1' },
          score:    { type: 'number', minimum: 0, maximum: 100, example: 75 },
        },
      },
      CertificateRequest: {
        type: 'object',
        required: ['userId', 'courseId'],
        properties: {
          userId:   { type: 'string', example: 'usr-003' },
          courseId: { type: 'string', example: 'CS101' },
        },
      },
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
            example: { success: false, message: 'Acceso denegado. Rol requerido: DOCENTE o ADMIN.' },
          },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'No se encontraron notas para el estudiante usr-003.' },
          },
        },
      },
      Conflict: {
        description: 'Recurso duplicado.',
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

    '/grades': {
      post: {
        tags: ['Notas'],
        summary: 'Registrar nota',
        description: 'Registra la nota de un estudiante en un módulo de un curso.\n\n**Roles:** DOCENTE, ADMIN',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GradeRequest' },
              examples: {
                mod1: { summary: 'Módulo 1', value: { userId: 'usr-003', courseId: 'CS101', moduleId: 'mod-1', score: 75 } },
                mod2: { summary: 'Módulo 2', value: { userId: 'usr-003', courseId: 'CS101', moduleId: 'mod-2', score: 82 } },
                mod3: { summary: 'Módulo 3', value: { userId: 'usr-003', courseId: 'CS101', moduleId: 'mod-3', score: 70 } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Nota registrada.',  content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessGrade' } } } },
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
        description: 'Retorna todas las notas de un estudiante en todos sus cursos.\n\n**Roles:** ADMIN, DOCENTE (cualquier estudiante) · ESTUDIANTE (solo las propias)',
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string', example: 'usr-003' }, description: 'ID del estudiante.' },
        ],
        responses: {
          200: { description: 'Lista de notas.',   content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessGradeList' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/grades/course/{courseId}': {
      get: {
        tags: ['Notas'],
        summary: 'Notas de un curso',
        description: 'Retorna las notas de todos los estudiantes registrados en un curso.\n\n**Roles:** ADMIN, DOCENTE',
        parameters: [
          { name: 'courseId', in: 'path', required: true, schema: { type: 'string', example: 'CS101' }, description: 'ID del curso.' },
        ],
        responses: {
          200: { description: 'Lista de notas.',   content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessGradeList' } } } },
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
        description: 'Calcula el promedio sobre todos los módulos registrados e indica si el estudiante aprueba.\n\n**Roles:** ADMIN, DOCENTE (cualquier estudiante) · ESTUDIANTE (solo el propio)',
        parameters: [
          { name: 'courseId', in: 'path', required: true, schema: { type: 'string', example: 'CS101'  }, description: 'ID del curso.' },
          { name: 'userId',   in: 'path', required: true, schema: { type: 'string', example: 'usr-003' }, description: 'ID del estudiante.' },
        ],
        responses: {
          200: {
            description: 'Promedio calculado.',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/AverageResponse' } } },
                example: { success: true, data: { userId: 'usr-003', courseId: 'CS101', average: 75.67, totalModules: 3, minPassing: 60, isPassing: true } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/certificates': {
      post: {
        tags: ['Certificados'],
        summary: 'Generar certificado',
        description: 'Emite un certificado si el promedio del estudiante en el curso es ≥ 60.\n\n- `403` si no aprueba\n- `409` si ya existe el certificado\n\n**Roles:** DOCENTE, ADMIN',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CertificateRequest' },
              example: { userId: 'usr-003', courseId: 'CS101' },
            },
          },
        },
        responses: {
          201: { description: 'Certificado generado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessCertificate' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: {
            description: 'Sin permiso de rol o el estudiante no aprueba.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  rolForbidden: { summary: 'Rol sin permiso',     value: { success: false, message: 'Acceso denegado. Rol requerido: DOCENTE o ADMIN.' } },
                  noApproved:   { summary: 'No aprueba el curso', value: { success: false, message: 'El estudiante no cumple el promedio mínimo aprobatorio para recibir el certificado.' } },
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
        description: 'Lista todos los certificados emitidos a un usuario.\n\n**Roles:** ADMIN, DOCENTE (cualquier usuario) · ESTUDIANTE (solo los propios)',
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string', example: 'usr-003' }, description: 'ID del usuario.' },
        ],
        responses: {
          200: { description: 'Lista de certificados.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessCertificateList' } } } },
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
        description: 'Devuelve la URL de descarga/verificación del PDF del certificado.\n\n**Roles:** ADMIN, DOCENTE (cualquier usuario) · ESTUDIANTE (solo el propio)',
        parameters: [
          { name: 'userId',   in: 'path', required: true, schema: { type: 'string', example: 'usr-003' }, description: 'ID del usuario.' },
          { name: 'courseId', in: 'path', required: true, schema: { type: 'string', example: 'CS101'  }, description: 'ID del curso.' },
        ],
        responses: {
          200: {
            description: 'URL de descarga.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/DownloadResponse' } },
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

const swaggerSpec = swaggerJsdoc({ definition, apis: [] });
export default swaggerSpec;
