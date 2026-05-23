import * as progresoService from '../../services/ProgresoService.js';
import { ROLES } from '../../config/constants.js';

export const getProgresoCurso = async (req, res, next) => {
  try {
    const { id_curso }  = req.params;
    const targetUserId  = req.query.userId ?? req.user.userId;

    if (req.user.role === ROLES.ESTUDIANTE && req.user.userId !== targetUserId) {
      return res.status(403).json({ success: false, message: 'Solo puedes consultar tu propio progreso.' });
    }

    const progreso = await progresoService.getProgresoCurso(targetUserId, id_curso);
    res.json({ success: true, data: progreso });
  } catch (err) { next(err); }
};

export const getProgresoCursoTodos = async (req, res, next) => {
  try {
    const lista = await progresoService.getProgresoCursoTodos(req.params.id_curso);
    res.json({ success: true, data: lista });
  } catch (err) { next(err); }
};

export const getMisCursos = async (req, res, next) => {
  try {
    const cursos = await progresoService.getMisCursos(req.user.userId);
    res.json({ success: true, data: cursos });
  } catch (err) { next(err); }
};

export const getProgresoDetalleModulos = async (req, res, next) => {
  try {
    const { id_curso }  = req.params;
    const targetUserId  = req.query.userId ?? req.user.userId;

    if (req.user.role === ROLES.ESTUDIANTE && req.user.userId !== targetUserId) {
      return res.status(403).json({ success: false, message: 'Solo puedes consultar tu propio progreso.' });
    }

    const detalle = await progresoService.getProgresoDetalleModulos(targetUserId, id_curso);
    res.json({ success: true, data: detalle });
  } catch (err) { next(err); }
};

export const getEstadisticasCurso = async (req, res, next) => {
  try {
    const stats = await progresoService.getEstadisticasCurso(req.params.id);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

export const getEstadisticasGlobal = async (req, res, next) => {
  try {
    const stats = await progresoService.getEstadisticasGlobal();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};
