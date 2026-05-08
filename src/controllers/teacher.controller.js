import {
  obtenerMisEstudiantes as obtenerMisEstudiantesService,
  obtenerResumenDashboard as obtenerResumenDashboardService,
  validarNotaDocente,
} from '../services/teacher.service.js';

export const obtenerResumenDashboard = async (req, res, next) => {
  try {
    const { teacher_id } = req.query;

    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id es requerido' });
    }

    const resumen = await obtenerResumenDashboardService(teacher_id);

    res.json(resumen);
  } catch (error) {
    next(error);
  }
};

export const obtenerMisEstudiantes = async (req, res, next) => {
  try {
    const { teacher_id } = req.query;

    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id es requerido' });
    }

    const estudiantes = await obtenerMisEstudiantesService(teacher_id);

    res.json({ estudiantes });
  } catch (error) {
    next(error);
  }
};

export const validarNota = async (req, res, next) => {
  try {
    const { score } = req.body;

    if (score === undefined) {
      return res.status(400).json({
        valid: false,
        message: 'score es requerido',
      });
    }

    const resultado = await validarNotaDocente(score);

    if (!resultado.valid) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};
