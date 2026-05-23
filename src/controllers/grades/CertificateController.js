import * as certificateService from '../../services/CertificateService.js';
import { ROLES } from '../../config/constants.js';

export const registrarPlantilla = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { htmlTemplate } = req.body;
    const plantilla = await certificateService.registrarPlantilla(courseId, htmlTemplate);
    res.status(201).json({ success: true, data: plantilla });
  } catch (err) { next(err); }
};

export const generarCertificado = async (req, res, next) => {
  try {
    const cert = await certificateService.generarCertificado(req.body);
    res.status(201).json({ success: true, data: cert });
  } catch (err) { next(err); }
};

export const getCertificadosByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.role === ROLES.ESTUDIANTE && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo puedes consultar tus propios certificados.' });
    }
    const certs = await certificateService.getCertificadosByUser(userId);
    res.json({ success: true, data: certs });
  } catch (err) { next(err); }
};

export const verificarCertificado = async (req, res, next) => {
  try {
    const cert = await certificateService.verificarCertificado(req.params.codigo);

    if (cert.htmlRenderizado) {
      return res.setHeader('Content-Type', 'text/html; charset=utf-8').send(cert.htmlRenderizado);
    }

    res.json({
      success: true,
      data: {
        nombreEstudiante: cert.nombreEstudiante,
        nombreCurso:      cert.nombreCurso,
        emitidoEn:        cert.issuedAt,
        url:              cert.url,
      },
    });
  } catch (err) { next(err); }
};

export const previewCertificado = async (req, res, next) => {
  try {
    const cert = await certificateService.previewCertificado(req.params.id);

    if (req.user.role === ROLES.ESTUDIANTE && req.user.userId !== cert.userId) {
      return res.status(403).json({ success: false, message: 'Solo puedes ver tus propios certificados.' });
    }

    if (!cert.htmlRenderizado) {
      return res.status(404).json({ success: false, message: 'Este certificado no tiene contenido HTML generado.' });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8').send(cert.htmlRenderizado);
  } catch (err) { next(err); }
};

export const descargarCertificado = async (req, res, next) => {
  try {
    const cert = await certificateService.marcarDescargado(req.params.id);

    if (req.user.role === ROLES.ESTUDIANTE && req.user.userId !== cert.userId) {
      return res.status(403).json({ success: false, message: 'Solo puedes descargar tus propios certificados.' });
    }

    if (!cert.htmlRenderizado) {
      return res.json({
        success:  true,
        message:  'Certificado registrado. Accede a la URL para obtener el documento.',
        data: { url: cert.url, descargado: cert.descargado, descargadoEn: cert.descargadoEn },
      });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
       .setHeader('Content-Disposition', `attachment; filename="certificado-${req.params.id}.html"`)
       .send(cert.htmlRenderizado);
  } catch (err) { next(err); }
};
