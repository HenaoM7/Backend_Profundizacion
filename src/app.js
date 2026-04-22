import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// rutas
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

//checkeamos el estado de la api
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

//controlamos error
app.use(errorHandler);

export default app;