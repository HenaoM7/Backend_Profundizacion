import * as progresoService from '../../services/ProgresoService.js';
import { ROLES } from '../../config/constants.js';

export const completarContenido = async (req, res, next) => {
  try {
    const { id_contenido } = req.params;
    const userId           = req.user.userId;

    const resultado = await progresoService.completarContenido(userId, id_contenido);
    const status    = resultado.completado ? 200 : 200;

    res.status(status).json({
      success : true,
      message : resultado.completado
        ? '¡Curso completado! Certificado generado automáticamente.'
        : `Progreso actualizado: ${resultado.porcentaje}%`,
      data: resultado,
    });
  } catch (err) { next(err); }
};

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
