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
    tags: [{ name: 'Teacher', description: 'Orquestación Vista Docente (Equipo 6)' }],
    components: {
      schemas: {
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;