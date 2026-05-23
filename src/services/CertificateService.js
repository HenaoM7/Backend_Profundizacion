import * as certRepo    from '../repositories/CertificateRepository.js';
import * as progresoRepo from '../repositories/ProgresoRepository.js';
import { randomUUID }    from 'crypto';

const BASE_URL = process.env.BASE_URL ?? 'https://plataformaiush.edu.co';

const renderHtml = (template, { nombreEstudiante, nombreCurso, fecha, codigoVerificacion }) =>
  template
    .replace(/\{\{NOMBRE_ESTUDIANTE\}\}/g, nombreEstudiante ?? '')
    .replace(/\{\{NOMBRE_CURSO\}\}/g,      nombreCurso      ?? '')
    .replace(/\{\{FECHA\}\}/g,             fecha)
    .replace(/\{\{CODIGO_VERIFICACION\}\}/g, codigoVerificacion);

const _buildCertificado = async (userId, courseId) => {
  const datos     = await certRepo.findDatosParaCertificado(userId, courseId);
  const plantilla = await certRepo.findPlantillaByCurso(courseId);

  const codigoVerificacion = randomUUID();
  const url = `${BASE_URL}/certificates/verificar/${codigoVerificacion}`;

  const htmlRenderizado = plantilla
    ? renderHtml(plantilla.htmlTemplate, {
        nombreEstudiante: datos?.nombre_estudiante ?? 'Estudiante',
        nombreCurso:      datos?.nombre_curso      ?? 'Curso',
        fecha:            new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
        codigoVerificacion,
      })
    : null;

  return certRepo.save({
    userId,
    courseId,
    url,
    nombreEstudiante: datos?.nombre_estudiante ?? null,
    nombreCurso:      datos?.nombre_curso      ?? null,
    htmlRenderizado,
  });
};

export const registrarPlantilla = async (idCurso, htmlTemplate) => {
  if (!htmlTemplate || typeof htmlTemplate !== 'string' || !htmlTemplate.trim()) {
    throw { status: 400, message: 'El campo htmlTemplate es requerido y debe ser un string.' };
  }
  return certRepo.upsertPlantilla(idCurso, htmlTemplate.trim());
};

export const generarCertificado = async ({ userId, courseId }) => {
  if (!userId || !courseId) {
    throw { status: 400, message: 'userId y courseId son requeridos.' };
  }

  const existing = await certRepo.findByUserIdAndCourseId(userId, courseId);
  if (existing) {
    throw { status: 409, message: 'El certificado ya fue emitido para este estudiante y curso.' };
  }

  const progreso = await progresoRepo.findProgresoCurso(userId, courseId);
  if (!progreso || !progreso.completado) {
    throw { status: 403, message: 'El estudiante debe completar el 100% del curso para recibir el certificado.' };
  }

  return _buildCertificado(userId, courseId);
};

export const generateCertificadoAutomatico = async (userId, courseId) => {
  const existing = await certRepo.findByUserIdAndCourseId(userId, courseId);
  if (existing) return existing;
  return _buildCertificado(userId, courseId);
};

export const getCertificadosByUser = async (userId) => {
  const certs = await certRepo.findByUserId(userId);
  if (!certs.length) {
    throw { status: 404, message: `No se encontraron certificados para el usuario ${userId}.` };
  }
  return certs;
};

export const previewCertificado = async (idCertificado) => {
  const cert = await certRepo.findById(idCertificado);
  if (!cert) throw { status: 404, message: 'Certificado no encontrado.' };
  return cert;
};

export const marcarDescargado = async (idCertificado) => {
  const cert = await certRepo.findById(idCertificado);
  if (!cert) throw { status: 404, message: 'Certificado no encontrado.' };

  if (!cert.descargado) {
    const actualizado = await certRepo.marcarDescargado(idCertificado);
    return actualizado ?? cert;
  }
  return cert;
};

export const verificarCertificado = async (codigoVerificacion) => {
  const cert = await certRepo.findByCodigoVerificacion(codigoVerificacion);
  if (!cert) throw { status: 404, message: 'Certificado no encontrado.' };
  return cert;
};
