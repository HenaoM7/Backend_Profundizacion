import { obtenerResumenTotalesDocente } from '../services/teacher.service.js';

export const estadoVistaDocente = async (req, res, next) => {
  try {
    res.json({ status: 'OK', modulo: 'Vista Docente' });
  } catch (error) {
    next(error);
  }
};

export const obtenerResumenDashboard = async (req, res, next) => {
  try {
    const teacher_id = req.query.teacher_id;
    if (teacher_id === undefined || teacher_id === null || String(teacher_id).trim() === '') {
      return res.status(400).json({
        message: 'Query teacher_id es obligatorio',
      });
    }
    const datos = await obtenerResumenTotalesDocente(teacher_id);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};
