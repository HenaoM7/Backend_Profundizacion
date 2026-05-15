import { obtenerResumenTotalesDocente } from '../services/teacher.service.js';
import { ROLES } from '../config/constants.js';

export const estadoVistaDocente = async (req, res, next) => {
  try {
    res.json({ status: 'OK', modulo: 'Vista Docente' });
  } catch (error) {
    next(error);
  }
};

export const obtenerResumenDashboard = async (req, res, next) => {
  try {
    const roles = Array.isArray(req.auth?.roles) ? req.auth.roles : [];
    const esAdminOSuper =
      roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPER_ADMIN);
    const esDocente = roles.includes(ROLES.DOCENTE);

    let idDocente;
    if (esAdminOSuper) {
      idDocente = String(req.query.teacher_id ?? '').trim();
      if (!idDocente) {
        return res.status(400).json({
          success: false,
          message: 'Para administradores, query teacher_id es obligatorio.',
        });
      }
    } else if (esDocente) {
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
