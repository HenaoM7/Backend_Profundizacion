

import {
  getTotalUsuariosService,
  getUsuariosActivosService,
  getUsuariosPorRolService,
  getEstudiantesInscritosService,
  getEstudiantesCompletadosService,
  getTopCursosInscritosService,
  getTopCursosCompletadosService,
} from '../services/adminDashboardService.js';

export const getTotalUsuarios = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const data = await getTotalUsuariosService(adminId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getUsuariosActivos = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const data = await getUsuariosActivosService(adminId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getUsuariosPorRol = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const data = await getUsuariosPorRolService(adminId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getEstudiantesInscritos = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const data = await getEstudiantesInscritosService(adminId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getEstudiantesCompletados = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const data = await getEstudiantesCompletadosService(adminId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getTopCursosInscritos = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const data = await getTopCursosInscritosService(adminId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getTopCursosCompletados = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const data = await getTopCursosCompletadosService(adminId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
};