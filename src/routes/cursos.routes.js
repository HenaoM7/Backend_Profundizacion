import { Router } from 'express';
import {
  actualizarCurso,
  crearCurso,
  crearModuloEnCurso,
  eliminarCurso,
  listarCursosPorDocente,
  listarModulosPorCurso,
} from '../controllers/cursos.controller.js';

const router = Router();

router.get('/courses', listarCursosPorDocente);
router.post('/courses', crearCurso);
router.get('/courses/:id/modules', listarModulosPorCurso);
router.post('/courses/:id/modules', crearModuloEnCurso);
router.put('/courses/:id', actualizarCurso);
router.delete('/courses/:id', eliminarCurso);

export default router;
