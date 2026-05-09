import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Profundización software 2',
      version: '1.0.0',
      description: 'Documentación de la API REST',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Documento: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            nombre:    { type: 'string',  example: 'guia-laboratorio.pdf' },
            drive_id:  { type: 'string',  example: '1BxiMVs0XRA5nF...' },
            mime_type: { type: 'string',  example: 'application/pdf' },
            tamanio:   { type: 'integer', example: 204800 },
            creado_en: { type: 'string',  format: 'date-time' },
          },
          }
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);  // ✅ Debe ser el RESULTADO, no una función

export default swaggerSpec;  // ✅ Exportar el objeto, no una función