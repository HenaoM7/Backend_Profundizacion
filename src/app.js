import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import driveService from './services/archivos/driveService.js';
import documentosRouter from './routes/archivos/documentosRouter.js';

const app = express();

app.use(cors());
app.use(express.json());

// Inicializamos apis
await driveService.init();

// Swagger — spec JSON disponible antes del UI
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/api-docs.json',
  },
}));

// Rutas
app.use('/api/documentos', documentosRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handler
app.use(errorHandler);

export default app;