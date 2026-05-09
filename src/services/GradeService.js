import * as gradeRepository from '../repositories/GradeRepository.js';
import { MIN_PASSING_SCORE, ROLES } from '../config/constants.js';

// Verifica que el docente sea propietario del curso; lanza 403 si no lo es
const verificarCursoDocente = async (courseId, user) => {
  if (user.role !== ROLES.DOCENTE) return;
  const ownerId = await gradeRepository.findCursoOwner(courseId);
  if (ownerId !== user.userId) {
    throw { status: 403, message: 'Solo puedes consultar notas de tus propios cursos.' };
  }
};

export const createGrade = async ({ userId, courseId, moduleId, score, evaluacionId = null }) => {
  if (!userId || !courseId || !moduleId) {
    throw { status: 400, message: 'userId, courseId y moduleId son requeridos.' };
  }
  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw { status: 400, message: 'La nota debe ser un número entre 0 y 100.' };
  }
  return gradeRepository.save({ userId, courseId, moduleId, score, evaluacionId });
};

export const getGradesByStudent = async (userId, requestingUser) => {
  let grades;

  if (requestingUser.role === ROLES.DOCENTE) {
    // El docente solo ve las notas del estudiante en sus propios cursos
    const cursoIds = await gradeRepository.findCursosByDocente(requestingUser.userId);
    if (!cursoIds.length) {
      throw { status: 404, message: 'No tienes cursos asignados.' };
    }
    grades = await gradeRepository.findByUserIdAndCourseIds(userId, cursoIds);
  } else {
    grades = await gradeRepository.findByUserId(userId);
  }

  if (!grades.length) {
    throw { status: 404, message: `No se encontraron notas para el estudiante ${userId}.` };
  }
  return grades;
};

export const getGradesByCourse = async (courseId, requestingUser) => {
  await verificarCursoDocente(courseId, requestingUser);

  const grades = await gradeRepository.findByCourseId(courseId);
  if (!grades.length) {
    throw { status: 404, message: `No se encontraron notas para el curso ${courseId}.` };
  }
  return grades;
};

export const getAverageByUserAndCourse = async (userId, courseId, requestingUser) => {
  await verificarCursoDocente(courseId, requestingUser);

  const grades = await gradeRepository.findUltimoIntentoPorModulo(userId, courseId);
  if (!grades.length) {
    throw {
      status: 404,
      message: `No hay notas para el estudiante ${userId} en el curso ${courseId}.`,
    };
  }

  const total   = grades.reduce((sum, g) => sum + g.score, 0);
  const average = parseFloat((total / grades.length).toFixed(2));

  return {
    userId,
    courseId,
    average,
    totalModules : grades.length,
    minPassing   : MIN_PASSING_SCORE,
    isPassing    : average >= MIN_PASSING_SCORE,
  };
};

export const getEstadisticasByCourse = async (courseId) => {
  const stats = await gradeRepository.getEstadisticas(courseId);
  if (!stats.total_estudiantes) {
    throw { status: 404, message: `No hay notas registradas para el curso ${courseId}.` };
  }
  return stats;
};

export const isStudentPassing = async (userId, courseId) => {
  const grades = await gradeRepository.findUltimoIntentoPorModulo(userId, courseId);
  if (!grades.length) {
    throw {
      status: 404,
      message: `No hay notas para el estudiante ${userId} en el curso ${courseId}.`,
    };
  }
  const total   = grades.reduce((sum, g) => sum + g.score, 0);
  const average = parseFloat((total / grades.length).toFixed(2));
  return average >= MIN_PASSING_SCORE;
};
