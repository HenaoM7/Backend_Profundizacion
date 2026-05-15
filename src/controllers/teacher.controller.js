import { obtenerResumenTotalesDocente } from '../services/teacher.service.js';
import { ROLES } from '../config/constants.js';

export const estadoVistaDocente = async (req, res, next) => {
  try {
    res.json({ status: 'OK', modulo: 'Vista Docente' });
  } catch (error) {
    next(error);
  }
};

/** Identidad desde JWT (login): req.auth.sub y req.auth.roles */
export const obtenerResumenDashboard = async (req, res, next) => {
  try {
    const roles = Array.isArray(req.auth.roles) ? req.auth.roles : [];
    const esAdminOSuper =
      roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPER_ADMIN);

    let idDocente;
    if (esAdminOSuper) {
      const teacher_id = req.query.teacher_id;
      if (teacher_id === undefined || teacher_id === null || String(teacher_id).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Para administradores, query teacher_id es obligatorio.',
        });
      }
      idDocente = String(teacher_id).trim();
    } else if (roles.includes(ROLES.DOCENTE)) {
      idDocente = req.auth.sub;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado.',
      });
    }

    const datos = await obtenerResumenTotalesDocente(idDocente);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};
