import * as evaluacionService from '../../services/EvaluacionService.js';
import { ROLES } from '../../config/constants.js';

export const responderEvaluacion = async (req, res, next) => {
  try {
    const { id_contenido } = req.params;
    const { respuestas }   = req.body;
    const userId           = req.user.userId;

    const resultado = await evaluacionService.responderEvaluacion({
      userId,
      idContenido: id_contenido,
      respuestas,
    });

    res.status(201).json({ success: true, data: resultado });
  } catch (err) { next(err); }
};

export const getResultado = async (req, res, next) => {
  try {
    const { id_contenido, userId } = req.params;

    if (req.user.role === ROLES.ESTUDIANTE && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo puedes consultar tu propio resultado.' });
    }

    const resultado = await evaluacionService.getResultado(userId, id_contenido);
    res.json({ success: true, data: resultado });
  } catch (err) { next(err); }
};
