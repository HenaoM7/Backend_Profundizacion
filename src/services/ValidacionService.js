import * as validacionRepo from '../repositories/ValidacionRepository.js';
import * as progresoService from './ProgresoService.js';
import { query }            from '../database/db.js';

export const crearOActualizarValidacion = async (idContenido, { pregunta, respuestaCorrecta }) => {
  const contenido = await query(
    'SELECT id_contenido FROM contenido WHERE id_contenido = $1',
    [idContenido]
  );
  if (!contenido.rows.length) {
    throw { status: 404, message: 'Contenido no encontrado.' };
  }
  return validacionRepo.upsert(idContenido, { pregunta, respuestaCorrecta });
};

export const getValidacion = async (idContenido) => {
  const validacion = await validacionRepo.findByContenido(idContenido);
  if (!validacion) {
    throw { status: 404, message: 'Este contenido no tiene pregunta de validación configurada.' };
  }
  return validacion;
};

export const validarRespuesta = async (idContenido, idUsuario, respuesta) => {
  if (typeof respuesta !== 'boolean') {
    throw { status: 400, message: 'La respuesta debe ser un valor booleano (true o false).' };
  }

  const validacion = await validacionRepo.findByContenido(idContenido);
  if (!validacion) {
    throw { status: 404, message: 'Este contenido no tiene pregunta de validación configurada.' };
  }

  const fueCorrector = respuesta === validacion.respuestaCorrecta;

  await validacionRepo.saveIntento({ idContenido, idUsuario, respuesta, fueCorrector });

  if (!fueCorrector) {
    return { correcto: false };
  }

  const resultado = await progresoService.completarContenidoValidado(idUsuario, idContenido);
  return { correcto: true, ...resultado };
};
