import * as progresoRepo             from '../repositories/ProgresoRepository.js';
import * as gradeRepository          from '../repositories/GradeRepository.js';
import { generateCertificateAutomatico } from './CertificateService.js';
import { getClient }  from '../database/db.js';

/**
 * Marca un contenido como completado por el estudiante,
 * recalcula el progreso del curso y — si llega al 100% —
 * crea nota y certificado automáticamente.
 */
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

    // 1. Registrar contenido completado
    await progresoRepo.saveProgresoContenido(userId, idCurso, idContenido);

    // 2. Recalcular progreso
    const { total, completados } = await progresoRepo.contarContenidos(userId, idCurso);

    if (total === 0) {
      await client.query('ROLLBACK');
      throw { status: 422, message: 'El curso no tiene contenidos activos configurados.' };
    }

    const porcentaje = parseFloat(((completados / total) * 100).toFixed(2));
    const completado = porcentaje >= 100;

    // 3. Persistir progreso del curso
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

    // 4. Al llegar al 100%: crear nota y certificado automáticamente
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

/**
 * Retorna el progreso actual de un estudiante en un curso específico.
 */
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

/**
 * Retorna el progreso de TODOS los estudiantes en un curso.
 * Uso: DOCENTE (solo su curso) / ADMIN / SUPER_ADMIN.
 */
export const getProgresoCursoTodos = async (courseId) => {
  return progresoRepo.findProgresoCursoTodos(courseId);
};

/**
 * Retorna el progreso del estudiante en todos sus cursos.
 */
export const getMisCursos = async (userId) => {
  return progresoRepo.findMisCursos(userId);
};
