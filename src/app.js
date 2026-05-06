import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import cursosRoutes from './routes/cursos.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/', cursosRoutes);

//checkeamos el estado de la api
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

//controlamos error
app.use(errorHandler);

export default app;