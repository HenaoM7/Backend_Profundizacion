import * as certificateRepository from '../repositories/CertificateRepository.js';
import * as progresoRepository    from '../repositories/ProgresoRepository.js';
import { fetchImageUrl }          from './CertificateImageService.js';

const _buildCertificado = async (userId, courseId) => {
  const datos     = await progresoRepository.findDatosParaCertificado(userId, courseId);
  const imagenUrl = await fetchImageUrl(courseId);

  return certificateRepository.save({
    userId,
    courseId,
    imagenUrl,
    nombreEstudiante: datos?.nombre_estudiante ?? null,
    nombreCurso:      datos?.nombre_curso      ?? null,
  });
};

export const generateCertificate = async ({ userId, courseId }) => {
  if (!userId || !courseId) {
    throw { status: 400, message: 'userId y courseId son requeridos.' };
  }

  const existing = await certificateRepository.findByUserIdAndCourseId(userId, courseId);
  if (existing) {
    throw { status: 409, message: 'El certificado ya fue emitido para este estudiante y curso.' };
  }

  const progreso = await progresoRepository.findProgresoCurso(userId, courseId);
  if (!progreso || !progreso.completado) {
    throw {
      status: 403,
      message: 'El estudiante debe completar el 100% del curso para recibir el certificado.',
    };
  }

  return _buildCertificado(userId, courseId);
};

export const generateCertificateAutomatico = async (userId, courseId) => {
  const existing = await certificateRepository.findByUserIdAndCourseId(userId, courseId);
  if (existing) return existing;
  return _buildCertificado(userId, courseId);
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
  if (!cert) throw { status: 404, message: 'Certificado no encontrado.' };

  if (!cert.descargado) {
    await certificateRepository.marcarDescargado(userId, courseId);
    cert.descargado   = true;
    cert.descargadoEn = new Date().toISOString();
  }

  return {
    message          : 'Descarga lista. Accede a la URL para obtener el PDF.',
    downloadUrl      : cert.url,
    imagenUrl        : cert.imagenUrl,
    nombreEstudiante : cert.nombreEstudiante,
    nombreCurso      : cert.nombreCurso,
    descargado       : cert.descargado,
    descargadoEn     : cert.descargadoEn,
    certificate      : cert,
  };
};
