import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import gradeRoutes from './routes/gradeRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'PlataformaIUSH · API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 2,
      docExpansion: 'list',
      filter: true,
    },
  })
);

app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.get('/health', (_req, res) =>
  res.json({ status: 'UP', service: 'PlataformaIUSH-Backend', version: '1.0.0' })
);

app.use('/grades',       gradeRoutes);
app.use('/certificates', certificateRoutes);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Ruta no encontrada.' })
);

app.use(errorHandler);

export default app;
