import * as validacionService from '../../services/ValidacionService.js';
import { ROLES } from '../../config/constants.js';

export const crearOActualizarValidacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pregunta, respuestaCorrecta } = req.body;

    if (!pregunta || typeof respuestaCorrecta !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los campos pregunta (string) y respuestaCorrecta (boolean).',
      });
    }

    const validacion = await validacionService.crearOActualizarValidacion(id, { pregunta, respuestaCorrecta });
    const { respuestaCorrecta: _, ...datos } = validacion;
    res.status(201).json({ success: true, data: datos });
  } catch (err) { next(err); }
};

export const getValidacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validacion = await validacionService.getValidacion(id);

    const esEstudiante = req.user.role === ROLES.ESTUDIANTE;
    const { respuestaCorrecta: _, ...datos } = validacion;
    const respuesta = esEstudiante ? datos : validacion;

    res.json({ success: true, data: respuesta });
  } catch (err) { next(err); }
};

export const validarRespuesta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;
    const userId = req.user.userId;

    if (typeof respuesta !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo respuesta debe ser un valor booleano (true o false).',
      });
    }

    const resultado = await validacionService.validarRespuesta(id, userId, respuesta);

    res.json({
      success: true,
      message: resultado.correcto
        ? (resultado.completado ? '¡Curso completado! Certificado generado automáticamente.' : 'Respuesta correcta. Progreso actualizado.')
        : 'Respuesta incorrecta. Inténtalo de nuevo.',
      data: resultado,
    });
  } catch (err) { next(err); }
};
