import * as certificateRepository from '../repositories/CertificateRepository.js';
import { isStudentPassing } from './GradeService.js';

export const generateCertificate = async ({ userId, courseId }) => {
  if (!userId || !courseId) {
    throw { status: 400, message: 'userId y courseId son requeridos.' };
  }

  const existing = await certificateRepository.findByUserIdAndCourseId(userId, courseId);
  if (existing) {
    throw {
      status: 409,
      message: 'El certificado ya fue emitido para este estudiante y curso.',
    };
  }

  const passing = await isStudentPassing(userId, courseId);
  if (!passing) {
    throw {
      status: 403,
      message: 'El estudiante no cumple el promedio mínimo aprobatorio para recibir el certificado.',
    };
  }

  return certificateRepository.save({ userId, courseId });
};

export const getCertificatesByUser = async (userId) => {
  const certs = await certificateRepository.findByUserId(userId);
  if (!certs.length) {
    throw { status: 404, message: `No se encontraron certificados para el usuario ${userId}.` };
  }
  return certs;
};

export const downloadCertificate = async (userId, courseId) => {
  const cert = await certificateRepository.findByUserIdAndCourseId(userId, courseId);
  if (!cert) {
    throw { status: 404, message: 'Certificado no encontrado.' };
  }
  return {
    message     : 'Descarga lista. Accede a la URL para obtener el PDF.',
    downloadUrl : cert.url,
    certificate : cert,
  };
};
