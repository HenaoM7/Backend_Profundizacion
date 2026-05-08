import * as certificateRepository from '../repositories/CertificateRepository.js';
import * as progresoRepository    from '../repositories/ProgresoRepository.js';
import { fetchImageUrl }          from './CertificateImageService.js';
import { isStudentPassing }       from './GradeService.js';

/**
 * Generación interna de certificado.
 * Obtiene nombres del estudiante y del curso, imagen del servicio externo,
 * crea maestro_documento y persiste el certificado.
 */
const _buildCertificado = async (userId, courseId) => {
  const datos = await progresoRepository.findDatosParaCertificado(userId, courseId);
  const imagenUrl = await fetchImageUrl(courseId);

  return certificateRepository.save({
    userId,
    courseId,
    imagenUrl,
    nombreEstudiante: datos?.nombre_estudiante ?? null,
    nombreCurso:      datos?.nombre_curso      ?? null,
  });
};

/**
 * Generación manual — el docente/admin lo solicita explícitamente.
 * Valida que el estudiante tenga promedio aprobatorio en las notas registradas.
 */
export const generateCertificate = async ({ userId, courseId }) => {
  if (!userId || !courseId) {
    throw { status: 400, message: 'userId y courseId son requeridos.' };
  }

  const existing = await certificateRepository.findByUserIdAndCourseId(userId, courseId);
  if (existing) {
    throw { status: 409, message: 'El certificado ya fue emitido para este estudiante y curso.' };
  }

  const isPassing = await isStudentPassing(userId, courseId);
  if (!isPassing) {
    throw {
      status: 403,
      message: 'El estudiante no cumple el promedio mínimo aprobatorio para recibir el certificado.',
    };
  }

  return _buildCertificado(userId, courseId);
};

/**
 * Generación automática — disparada cuando el progreso llega al 100%.
 * No requiere verificación de notas: el 100% de progreso ES la aprobación.
 */
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

  return {
    message          : 'Descarga lista. Accede a la URL para obtener el PDF.',
    downloadUrl      : cert.url,
    imagenUrl        : cert.imagenUrl,
    nombreEstudiante : cert.nombreEstudiante,
    nombreCurso      : cert.nombreCurso,
    certificate      : cert,
  };
};
