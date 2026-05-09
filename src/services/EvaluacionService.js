import * as evaluacionRepo  from '../repositories/EvaluacionRepository.js';
import * as respuestaRepo   from '../repositories/RespuestaRepository.js';
import * as gradeRepository from '../repositories/GradeRepository.js';

export const responderEvaluacion = async ({ userId, idContenido, respuestas }) => {
  if (!userId || !idContenido || !Array.isArray(respuestas) || !respuestas.length) {
    throw { status: 400, message: 'userId, idContenido y respuestas son requeridos.' };
  }

  const preguntas = await evaluacionRepo.findByContenido(idContenido);
  if (!preguntas.length) {
    throw { status: 404, message: 'El contenido no tiene evaluaciones configuradas.' };
  }

  const idsPreguntas = preguntas.map(p => p.id_evaluacion);

  for (const idPregunta of idsPreguntas) {
    const yaRespondio = await respuestaRepo.yaRespondio(idPregunta, userId);
    if (yaRespondio) {
      throw { status: 409, message: 'El estudiante ya respondió esta evaluación.' };
    }
  }

  const mapaRespuestas = new Map(respuestas.map(r => [r.idEvaluacion, r.idOpcion]));
  for (const pregunta of preguntas) {
    if (!mapaRespuestas.has(pregunta.id_evaluacion)) {
      throw {
        status: 400,
        message: `Falta la respuesta para la pregunta ${pregunta.id_evaluacion}: "${pregunta.enunciado}"`,
      };
    }
  }

  let puntajeObtenido = 0;
  let puntajeTotal    = 0;
  const detalleRespuestas = [];

  for (const pregunta of preguntas) {
    const idOpcionSeleccionada = mapaRespuestas.get(pregunta.id_evaluacion);
    const opcion = await evaluacionRepo.findOpcionById(idOpcionSeleccionada);

    if (!opcion || opcion.id_evaluacion !== pregunta.id_evaluacion) {
      throw {
        status: 400,
        message: `La opción ${idOpcionSeleccionada} no corresponde a la pregunta ${pregunta.id_evaluacion}.`,
      };
    }

    puntajeTotal += parseFloat(pregunta.puntaje);
    if (opcion.es_correcta) puntajeObtenido += parseFloat(pregunta.puntaje);

    detalleRespuestas.push({
      idEvaluacion : pregunta.id_evaluacion,
      enunciado    : pregunta.enunciado,
      idOpcion     : idOpcionSeleccionada,
      opcionTexto  : opcion.texto,
      esCorrecta   : opcion.es_correcta,
      puntaje      : parseFloat(pregunta.puntaje),
    });
  }

  const calificacion = puntajeTotal > 0
    ? parseFloat(((puntajeObtenido / puntajeTotal) * 100).toFixed(2))
    : 0;

  
  const contexto = await evaluacionRepo.findContextoByContenido(idContenido);
  if (!contexto) {
    throw { status: 404, message: 'No se encontró el módulo/curso asociado al contenido.' };
  }

  await respuestaRepo.saveMany(
    respuestas.map(r => ({ idEvaluacion: r.idEvaluacion, idUsuario: userId, idOpcion: r.idOpcion }))
  );

  const nota = await gradeRepository.save({
    userId,
    courseId:    contexto.id_curso,
    moduleId:    contexto.id_modulo,
    score:       calificacion,
    evaluacionId: null,
  });

  return {
    nota,
    calificacion,
    puntajeObtenido,
    puntajeTotal,
    detalle: detalleRespuestas,
  };
};

export const getResultado = async (userId, idContenido) => {
  const preguntas = await evaluacionRepo.findByContenido(idContenido);
  if (!preguntas.length) {
    throw { status: 404, message: 'El contenido no tiene evaluaciones.' };
  }

  const idsPreguntas = preguntas.map(p => p.id_evaluacion);
  const respuestas   = await respuestaRepo.findByUsuarioAndEvaluaciones(userId, idsPreguntas);

  if (!respuestas.length) {
    throw { status: 404, message: 'El estudiante aún no ha respondido esta evaluación.' };
  }

  const puntajeTotal    = preguntas.reduce((s, p) => s + parseFloat(p.puntaje), 0);
  const puntajeObtenido = respuestas.filter(r => r.es_correcta).reduce((s, r) => s + parseFloat(r.puntaje), 0);
  const calificacion    = puntajeTotal > 0
    ? parseFloat(((puntajeObtenido / puntajeTotal) * 100).toFixed(2))
    : 0;

  return { userId, idContenido, calificacion, puntajeObtenido, puntajeTotal, respuestas };
};
