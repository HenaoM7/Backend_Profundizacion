import * as gradeRepository from '../repositories/GradeRepository.js';
import { MIN_PASSING_SCORE } from '../config/constants.js';

export const createGrade = async ({ userId, courseId, moduleId, score }) => {
  if (!userId || !courseId || !moduleId) {
    throw { status: 400, message: 'userId, courseId y moduleId son requeridos.' };
  }
  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw { status: 400, message: 'La nota debe ser un número entre 0 y 100.' };
  }
  return gradeRepository.save({ userId, courseId, moduleId, score });
};

export const getGradesByStudent = async (userId) => {
  const grades = await gradeRepository.findByUserId(userId);
  if (!grades.length) {
    throw { status: 404, message: `No se encontraron notas para el estudiante ${userId}.` };
  }
  return grades;
};

export const getGradesByCourse = async (courseId) => {
  const grades = await gradeRepository.findByCourseId(courseId);
  if (!grades.length) {
    throw { status: 404, message: `No se encontraron notas para el curso ${courseId}.` };
  }
  return grades;
};

export const getAverageByUserAndCourse = async (userId, courseId) => {
  const grades = await gradeRepository.findByUserIdAndCourseId(userId, courseId);
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

export const isStudentPassing = async (userId, courseId) => {
  const result = await getAverageByUserAndCourse(userId, courseId);
  return result.isPassing;
};
