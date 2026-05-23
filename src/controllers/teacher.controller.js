import {
  obtenerResumenTotalesDocente,
  obtenerCursosEnConstruccionDocente,
  obtenerTotalEstudiantesMatriculados,
  obtenerCursosConMasCompletados,
  obtenerCursosConMasInscritos,
  obtenerCursosConMenosInscritos,
  obtenerUltimosEstudiantesInscritos,
} from '../services/teacher.service.js';
import { ROLES } from '../config/constants.js';

const resolverIdDocenteDashboard = (req) => {
  const roles = Array.isArray(req.auth?.roles) ? req.auth.roles : [];
  const esAdminOSuper =
    roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPER_ADMIN);
  const esDocente = roles.includes(ROLES.DOCENTE);

  if (esAdminOSuper) {
    const idDocente = String(req.query.teacher_id ?? '').trim();
    if (!idDocente) {
      return {
        ok: false,
        status: 400,
        body: {
          success: false,
          message: 'Para administradores, query teacher_id es obligatorio.',
        },
      };
    }
    return { ok: true, idDocente };
  }

  if (esDocente) {
    return { ok: true, idDocente: req.auth.sub };
  }

  return {
    ok: false,
    status: 403,
    body: { success: false, message: 'Acceso denegado.' },
  };
};

export const estadoVistaDocente = async (req, res, next) => {
  try {
    res.json({ status: 'OK', modulo: 'Vista Docente' });
  } catch (error) {
    next(error);
  }
};

export const obtenerResumenDashboard = async (req, res, next) => {
  try {
    const r = resolverIdDocenteDashboard(req);
    if (!r.ok) {
      return res.status(r.status).json(r.body);
    }

    const datos = await obtenerResumenTotalesDocente(r.idDocente);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};

export const obtenerCursosEnConstruccion = async (req, res, next) => {
  try {
    const r = resolverIdDocenteDashboard(req);
    if (!r.ok) {
      return res.status(r.status).json(r.body);
    }

    const datos = await obtenerCursosEnConstruccionDocente(r.idDocente);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};

export const obtenerTotalEstudiantes = async (req, res, next) => {
  try {
    const r = resolverIdDocenteDashboard(req);
    if (!r.ok) {
      return res.status(r.status).json(r.body);
    }

    const datos = await obtenerTotalEstudiantesMatriculados(r.idDocente);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};

export const obtenerTopCursosCompletados = async (req, res, next) => {
  try {
    const r = resolverIdDocenteDashboard(req);
    if (!r.ok) {
      return res.status(r.status).json(r.body);
    }

    const datos = await obtenerCursosConMasCompletados(r.idDocente);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};

export const obtenerTopCursosPorInscritos = async (req, res, next) => {
  try {
    const r = resolverIdDocenteDashboard(req);
    if (!r.ok) {
      return res.status(r.status).json(r.body);
    }

    const datos = await obtenerCursosConMasInscritos(r.idDocente);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};

export const obtenerCursosConMenosInscritosHandler = async (req, res, next) => {
  try {
    const r = resolverIdDocenteDashboard(req);
    if (!r.ok) {
      return res.status(r.status).json(r.body);
    }

    const datos = await obtenerCursosConMenosInscritos(r.idDocente);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};

export const obtenerUltimosEstudiantesInscritosHandler = async (req, res, next) => {
  try {
    const r = resolverIdDocenteDashboard(req);
    if (!r.ok) {
      return res.status(r.status).json(r.body);
    }

    const datos = await obtenerUltimosEstudiantesInscritos(r.idDocente);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};
