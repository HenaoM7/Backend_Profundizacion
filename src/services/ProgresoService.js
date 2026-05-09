import * as progresoRepo             from '../repositories/ProgresoRepository.js';
import * as gradeRepository          from '../repositories/GradeRepository.js';
import { generateCertificateAutomatico } from './CertificateService.js';
import { getClient }  from '../database/db.js';

export const completarContenido = async (userId, idContenido) => {
  const contenido = await progresoRepo.findContenidoConContexto(idContenido);

  if (!contenido) {
    throw { status: 404, message: 'Contenido no encontrado.' };
  }
  if (!contenido.activo) {
    throw { status: 400, message: 'El contenido no está activo.' };
  }

  const yaCompleto = await progresoRepo.yaCompleto(userId, idContenido);
  if (yaCompleto) {
    throw { status: 409, message: 'El estudiante ya completó este contenido.' };
  }

  const idCurso = contenido.id_curso;
  const client  = await getClient();

  try {
    await client.query('BEGIN');

    await progresoRepo.saveProgresoContenido(userId, idCurso, idContenido);

    const { total, completados } = await progresoRepo.contarContenidos(userId, idCurso);

    if (total === 0) {
      await client.query('ROLLBACK');
      throw { status: 422, message: 'El curso no tiene contenidos activos configurados.' };
    }

    const porcentaje = parseFloat(((completados / total) * 100).toFixed(2));
    const completado = porcentaje >= 100;

    const progreso = await progresoRepo.upsertProgresoCurso(client, {
      idUsuario:  userId,
      idCurso,
      porcentaje,
      completados,
      total,
      completado,
      aprobado: completado,
    });

    await client.query('COMMIT');

    let nota        = null;
    let certificado = null;

    if (completado) {
      nota = await gradeRepository.save({
        userId,
        courseId:    idCurso,
        moduleId:    contenido.id_modulo,
        score:       100,
        evaluacionId: null,
      });

      certificado = await generateCertificateAutomatico(userId, idCurso);
    }

    return {
      progreso,
      contenido: {
        id:           contenido.id_contenido,
        modulo:       contenido.titulo_modulo,
        curso:        contenido.titulo_curso,
      },
      porcentaje,
      contenidosCompletados: completados,
      totalContenidos:       total,
      completado,
      aprobado: completado,
      nota,
      certificado,
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};

export const getProgresoCurso = async (userId, courseId) => {
  const progreso = await progresoRepo.findProgresoCurso(userId, courseId);

  if (!progreso) {
    const { total } = await progresoRepo.contarContenidos(userId, courseId);
    return {
      idUsuario:             userId,
      idCurso:               courseId,
      porcentaje:            0,
      contenidosCompletados: 0,
      totalContenidos:       total,
      completado:            false,
      aprobado:              false,
    };
  }

  return progreso;
};


export const getProgresoCursoTodos = async (courseId) => {
  return progresoRepo.findProgresoCursoTodos(courseId);
};


export const getMisCursos = async (userId) => {
  return progresoRepo.findMisCursos(userId);
};
