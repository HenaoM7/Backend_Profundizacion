import * as certificateService from '../../services/CertificateService.js';

export const generateCertificate = async (req, res, next) => {
  try {
    const cert = await certificateService.generateCertificate(req.body);
    res.status(201).json({ success: true, data: cert });
  } catch (err) { next(err); }
};

export const getCertificatesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.role === 'ESTUDIANTE' && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo puedes consultar tus propios certificados.' });
    }
    const certs = await certificateService.getCertificatesByUser(userId);
    res.json({ success: true, data: certs });
  } catch (err) { next(err); }
};

export const downloadCertificate = async (req, res, next) => {
  try {
    const { userId, courseId } = req.params;
    if (req.user.role === 'ESTUDIANTE' && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo puedes consultar tus propios certificados.' });
    }
    const result = await certificateService.downloadCertificate(userId, courseId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};
