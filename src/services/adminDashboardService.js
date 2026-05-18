import {
  getTotalUsuarios,
  getUsuariosActivos,
  getUsuariosPorRol,
  getEstudiantesInscritos,
  getEstudiantesCompletados,
  getTopCursosInscritos,
  getTopCursosCompletados,
} from '../repositories/adminDashboardRepository.js';

export const getTotalUsuariosService = async (adminId) => {
  const stats = await getTotalUsuarios(adminId);
  if (!stats) {
    const error = new Error('No se pudo obtener el total de usuarios.');
    error.statusCode = 500;
    throw error;
  }
  return { totalUsuarios: stats.totalUsuarios };
};

export const getUsuariosActivosService = async (adminId) => {
  const stats = await getUsuariosActivos(adminId);
  if (!stats) {
    const error = new Error('No se pudo obtener el total de usuarios activos.');
    error.statusCode = 500;
    throw error;
  }
  return { usuariosActivos: stats.usuariosActivos };
};

export const getUsuariosPorRolService = async (adminId) => {
  const stats = await getUsuariosPorRol(adminId);
  return { distribucion: stats };
};

export const getEstudiantesInscritosService = async (adminId) => {
  const stats = await getEstudiantesInscritos(adminId);
  if (!stats) {
    const error = new Error('No se pudo obtener el total de estudiantes inscritos.');
    error.statusCode = 500;
    throw error;
  }
  return { totalInscritos: stats.totalInscritos };
};

export const getEstudiantesCompletadosService = async (adminId) => {
  const stats = await getEstudiantesCompletados(adminId);
  if (!stats) {
    const error = new Error('No se pudo obtener el total de estudiantes completados.');
    error.statusCode = 500;
    throw error;
  }
  return { totalCompletados: stats.totalCompletados };
};

export const getTopCursosInscritosService = async (adminId) => {
  const cursos = await getTopCursosInscritos(adminId);
  return { topCursos: cursos };
};

export const getTopCursosCompletadosService = async (adminId) => {
  const cursos = await getTopCursosCompletados(adminId);
  return { topCursos: cursos };
};