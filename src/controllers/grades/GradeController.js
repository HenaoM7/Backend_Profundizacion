import * as gradeService from '../../services/GradeService.js';
import { ROLES } from '../../config/constants.js';

export const createGrade = async (req, res, next) => {
  try {
    const grade = await gradeService.createGrade(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (err) { next(err); }
};

export const getGradesByStudent = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // ESTUDIANTE: solo puede ver sus propias notas
    if (req.user.role === ROLES.ESTUDIANTE && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo puedes consultar tus propias notas.' });
    }

    // El servicio aplica el filtro por cursos propios si el rol es DOCENTE
    const grades = await gradeService.getGradesByStudent(userId, req.user);
    res.json({ success: true, data: grades });
  } catch (err) { next(err); }
};

export const getGradesByCourse = async (req, res, next) => {
  try {
    // El servicio valida que el DOCENTE sea propietario del curso
    const grades = await gradeService.getGradesByCourse(req.params.courseId, req.user);
    res.json({ success: true, data: grades });
  } catch (err) { next(err); }
};

export const getAverageByUserAndCourse = async (req, res, next) => {
  try {
    const { courseId, userId } = req.params;

    // ESTUDIANTE: solo puede ver su propio promedio
    if (req.user.role === ROLES.ESTUDIANTE && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo puedes consultar tu propio promedio.' });
    }

    // El servicio valida que el DOCENTE sea propietario del curso
    const result = await gradeService.getAverageByUserAndCourse(userId, courseId, req.user);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getEstadisticasByCourse = async (req, res, next) => {
  try {
    const stats = await gradeService.getEstadisticasByCourse(req.params.courseId);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};
