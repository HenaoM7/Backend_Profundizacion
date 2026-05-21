import { query } from '../database/db.js';
import { calcularVariacion, validarValor, parseJsonArray, normalizarEstado, normalizarRol, formatearTiempo } from '../utils/calculations.js';

/**
 * Obtiene vista consolidada de usuarios y roles con estadísticas
 * (Optimizado con vista materializada)
 */
export const getUsersViewWithStats = async (filters = {}) => {
  try {
    const { estado: estadoRaw, rol: rolRaw } = filters;
    const estado = normalizarEstado(estadoRaw);
    const rol = normalizarRol(rolRaw);

    // Construir query usando la vista materializada
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filtro por estado (activo/inactivo)
    if (estado !== undefined) {
      conditions.push(`activo = $${paramIndex}`);
      params.push(estado);
      paramIndex += 1;
    }

    // Filtro por rol
    if (rol) {
      conditions.push(`LOWER(roles) LIKE $${paramIndex}`);
      params.push(`%${rol}%`);
      paramIndex += 1;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `
        WITH usuarios_filtrados AS (
          SELECT 
            id_usuario,
            nombre,
            correo,
            activo,
            ultimo_acceso,
            creacion,
            roles
          FROM v_usuarios_consolidado
          ${whereClause}
        ),
        estadisticas AS (
          SELECT
            COUNT(DISTINCT CASE WHEN activo = TRUE THEN id_usuario END)::int as usuarios_activos,
            COUNT(DISTINCT CASE 
              WHEN activo = TRUE AND LOWER(roles) LIKE '%estudiante%' THEN id_usuario 
            END)::int as estudiantes,
            COUNT(DISTINCT CASE 
              WHEN activo = TRUE AND LOWER(roles) LIKE '%docente%' THEN id_usuario 
            END)::int as docentes
          FROM v_usuarios_consolidado
        )
        SELECT 
          'usuarios' as tipo,
          json_agg(
            json_build_object(
              'id', id_usuario,
              'nombre', nombre,
              'correo', correo,
              'rol', COALESCE(roles, 'Sin rol'),
              'estado', CASE WHEN activo THEN 'Activo' ELSE 'Inactivo' END,
              'ultimoAcceso', ultimo_acceso
            )
            ORDER BY creacion DESC
          ) as data,
          (SELECT usuarios_activos FROM estadisticas) as usuarios_activos,
          (SELECT estudiantes FROM estadisticas) as estudiantes,
          (SELECT docentes FROM estadisticas) as docentes
        FROM usuarios_filtrados
      `,
      params
    );

    const resultData = result.rows[0];

    // Si no hay usuarios filtrados, asegurar que data sea un array vacío
    const usuarios = parseJsonArray(resultData?.data);

    return {
      estadisticas: {
        usuariosActivos: validarValor(resultData?.usuarios_activos),
        estudiantes: validarValor(resultData?.estudiantes),
        docentes: validarValor(resultData?.docentes),
      },
      usuarios,
    };
  } catch (error) {
    console.error('Error en getUsersViewWithStats:', error);
    throw error;
  }
};

/**
 * Obtiene resumen y métricas del dashboard
 * (Optimizado con vista materializada)
 */
export const getResumenViewData = async () => {
  try {
    // Usar la vista materializada que precalcula todas las métricas
    const metricasResult = await query(`
      SELECT 
        sesiones_este_mes,
        sesiones_mes_anterior,
        tiempo_este_mes,
        tiempo_mes_anterior,
        cert_este_mes,
        cert_mes_anterior,
        cursos_este_mes,
        cursos_mes_anterior,
        usuarios_este_mes,
        usuarios_mes_anterior,
        sin_insc_este_mes,
        sin_insc_mes_anterior,
        tendencias_dias,
        tendencias_semana
      FROM v_dashboard_metricas_mensuales
      LIMIT 1
    `);

    const metricas = metricasResult.rows[0] || {};

    // Extraer valores con validación de nulos
    const sesionesTotales = validarValor(metricas.sesiones_este_mes);
    const sesionesTotalesMesAnterior = validarValor(metricas.sesiones_mes_anterior);
    const tiempoPromedio = validarValor(metricas.tiempo_este_mes);
    const tiempoPromedioMesAnterior = validarValor(metricas.tiempo_mes_anterior);
    const certificadosEmitidos = validarValor(metricas.cert_este_mes);
    const certificadosMesAnterior = validarValor(metricas.cert_mes_anterior);
    const cursosCompletados = validarValor(metricas.cursos_este_mes);
    const cursosCompletadosMesAnterior = validarValor(metricas.cursos_mes_anterior);
    const nuevosUsuarios = validarValor(metricas.usuarios_este_mes);
    const nuevosUsuariosMesAnterior = validarValor(metricas.usuarios_mes_anterior);
    const cursosSinInscripcion = validarValor(metricas.sin_insc_este_mes);
    const cursosSinInscripcionMesAnterior = validarValor(metricas.sin_insc_mes_anterior);

    // Calcular variaciones usando helper
    const variacionSesiones = calcularVariacion(sesionesTotales, sesionesTotalesMesAnterior);
    const variacionTiempo = calcularVariacion(tiempoPromedio, tiempoPromedioMesAnterior);
    const variacionCertificados = calcularVariacion(certificadosEmitidos, certificadosMesAnterior);
    const variacionCursos = calcularVariacion(cursosCompletados, cursosCompletadosMesAnterior);
    const variacionUsuarios = calcularVariacion(nuevosUsuarios, nuevosUsuariosMesAnterior);
    const variacionCursosSinInscripcion = calcularVariacion(cursosSinInscripcion, cursosSinInscripcionMesAnterior);

    // Parsear datos de tendencias
    const tendenciaSesionesDias = parseJsonArray(metricas.tendencias_dias);
    const sesionesxDia = parseJsonArray(metricas.tendencias_semana);

    return {
        metricasActuales: {
          sesionesTotales,
          tiempoPromedioTerminacion: formatearTiempo(tiempoPromedio),
          certificadosEmitidos,
          cursosCompletados,
          nuevosUsuarios,
          cursosSinInscripcion,
        },
        tendenciaSesionesDias,
        sesionesxDia,
        comparativasMensual: {
          sesionesTotales: {
            estesMes: sesionesTotales,
            mesAnterior: sesionesTotalesMesAnterior,
            variacion: variacionSesiones,
          },
          tiempoPromedioTerminacion: {
            estesMes: formatearTiempo(tiempoPromedio),
            mesAnterior: formatearTiempo(tiempoPromedioMesAnterior),
            variacion: variacionTiempo,
          },
          cursosCompletados: {
            estesMes: cursosCompletados,
            mesAnterior: cursosCompletadosMesAnterior,
            variacion: variacionCursos,
          },
          certificadosEmitidos: {
            estesMes: certificadosEmitidos,
            mesAnterior: certificadosMesAnterior,
            variacion: variacionCertificados,
          },
          nuevosUsuarios: {
            estesMes: nuevosUsuarios,
            mesAnterior: nuevosUsuariosMesAnterior,
            variacion: variacionUsuarios,
          },
          cursosSinInscripcion: {
            estesMes: cursosSinInscripcion,
            mesAnterior: cursosSinInscripcionMesAnterior,
            variacion: variacionCursosSinInscripcion,
          },
        },
      };
  } catch (error) {
    console.error('Error en getResumenViewData:', error);
    throw error;
  }
};

/**
 * Obtiene vista consolidada de cursos con estadísticas
 * (Optimizado con vista materializada)
 */
export const getCoursesViewWithStats = async (filters = {}) => {
  const { estado, contenido, inscripciones } = filters;

  try {
    // Construir query usando la vista materializada
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filtro por estado (activo/inactivo)
    if (estado === 'activo' || estado === 'inactivo') {
      conditions.push(`activo = $${paramIndex}`);
      params.push(estado === 'activo');
      paramIndex += 1;
    }

    // Filtro por contenido
    if (contenido === 'con_contenido' || contenido === 'sin_contenido') {
      const tieneContenido = contenido === 'con_contenido' ? 'Con contenido' : 'Sin contenido';
      conditions.push(`tiene_contenido = $${paramIndex}`);
      params.push(tieneContenido);
      paramIndex += 1;
    }

    // Filtro por inscripciones
    if (inscripciones === 'con_inscripciones' || inscripciones === 'sin_inscripciones') {
      const tieneInscripciones = inscripciones === 'con_inscripciones' ? 'Con inscripciones' : 'Sin inscripciones';
      conditions.push(`tiene_inscripciones = $${paramIndex}`);
      params.push(tieneInscripciones);
      paramIndex += 1;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `
        WITH cursos_filtered AS (
          SELECT 
            id_curso,
            titulo,
            nombre_docente,
            total_modulos,
            total_estudiantes,
            tiene_contenido,
            tiene_inscripciones,
            activo,
            creacion
          FROM v_cursos_estadisticas
          ${whereClause}
        ),
        estadisticas AS (
          SELECT
            COUNT(DISTINCT CASE WHEN activo = TRUE THEN id_curso END)::int as cursos_activos,
            COUNT(DISTINCT CASE 
              WHEN activo = TRUE AND tiene_contenido = 'Con contenido' THEN id_curso 
            END)::int as con_contenido,
            COUNT(DISTINCT CASE 
              WHEN activo = TRUE AND tiene_contenido = 'Sin contenido' THEN id_curso 
            END)::int as sin_contenido,
            COUNT(DISTINCT CASE 
              WHEN activo = TRUE AND tiene_inscripciones = 'Sin inscripciones' THEN id_curso 
            END)::int as sin_inscripciones
          FROM v_cursos_estadisticas
          WHERE activo = TRUE
        )
        SELECT 
          'cursos' as tipo,
          json_agg(
            json_build_object(
              'id', id_curso,
              'titulo', titulo,
              'docente', COALESCE(nombre_docente, 'Sin asignar'),
              'modulos', total_modulos,
              'estudiantes', total_estudiantes,
              'estado', CASE WHEN activo THEN 'Activo' ELSE 'Inactivo' END,
              'contenido', tiene_contenido,
              'inscripciones', tiene_inscripciones
            )
            ORDER BY creacion DESC
          ) as data,
          (SELECT cursos_activos FROM estadisticas) as cursos_activos,
          (SELECT con_contenido FROM estadisticas) as con_contenido,
          (SELECT sin_contenido FROM estadisticas) as sin_contenido,
          (SELECT sin_inscripciones FROM estadisticas) as sin_inscripciones
        FROM cursos_filtered
      `,
      params
    );

    const resultData = result.rows[0];

    // Si no hay cursos filtrados, asegurar que data sea un array vacío
    const cursos = parseJsonArray(resultData?.data);

    return {
      estadisticas: {
        cursosActivos: validarValor(resultData?.cursos_activos),
        conContenido: validarValor(resultData?.con_contenido),
        sinContenido: validarValor(resultData?.sin_contenido),
        sinInscripciones: validarValor(resultData?.sin_inscripciones),
      },
      cursos,
    };
  } catch (error) {
    console.error('Error en getCoursesViewWithStats:', error);
    throw error;
  }
};

/**
 * Obtiene datos para el Panel de Control del SuperAdmin
 * (Optimizado usando vistas materializadas)
 */
export const getDashboardControlData = async () => {
  try {
    // Query optimizada que reutiliza datos precalculados de vistas materializadas
    const result = await query(`
      WITH estadisticas_usuarios AS (
        SELECT
          COUNT(DISTINCT CASE WHEN activo = TRUE AND LOWER(roles) LIKE '%estudiante%' THEN id_usuario END)::int as estudiantes_total,
          COUNT(DISTINCT CASE WHEN activo = FALSE AND LOWER(roles) LIKE '%docente%' THEN id_usuario END)::int as docentes_inactivos
        FROM v_usuarios_consolidado
      ),
      estadisticas_cursos AS (
        SELECT
          COUNT(DISTINCT CASE WHEN activo = TRUE THEN id_curso END)::int as cursos_activos,
          COUNT(DISTINCT CASE WHEN activo = TRUE AND tiene_inscripciones = 'Sin inscripciones' THEN id_curso END)::int as cursos_sin_insc,
          COUNT(DISTINCT CASE WHEN activo = TRUE AND tiene_contenido = 'Sin contenido' THEN id_curso END)::int as cursos_sin_contenido
        FROM v_cursos_estadisticas
      ),
      contenidos_total AS (
        SELECT COUNT(*)::int as contenidos_total
        FROM contenido
        WHERE eliminacion IS NULL
      )
      SELECT
        (SELECT estudiantes_total FROM estadisticas_usuarios)::int as estudiantes_total,
        (SELECT docentes_inactivos FROM estadisticas_usuarios)::int as docentes_inactivos,
        (SELECT cursos_activos FROM estadisticas_cursos)::int as cursos_activos,
        (SELECT contenidos_total FROM contenidos_total)::int as contenidos_total,
        (SELECT cursos_sin_insc FROM estadisticas_cursos)::int as cursos_sin_insc,
        (SELECT cursos_sin_contenido FROM estadisticas_cursos)::int as cursos_sin_contenido,
        COALESCE(
          (SELECT json_agg(json_build_object('dia', dia, 'sesiones', sesiones) ORDER BY dia)
           FROM v_sesiones_ultimos_7dias),
          '[]'::json
        ) as sesiones_semana,
        COALESCE(
          (SELECT json_agg(json_build_object('tipo', tipo, 'cantidad', cantidad, 'porcentaje', porcentaje) ORDER BY cantidad DESC)
           FROM v_contenido_por_tipo),
          '[]'::json
        ) as contenido_tipos,
        COALESCE(
          (SELECT json_agg(json_build_object('id', id_curso, 'titulo', titulo, 'docente', nombre_docente, 'completitud', promedio_completitud, 'estudiantes', estudiantes_inscritos))
           FROM v_top_cursos_completitud),
          '[]'::json
        ) as top_cursos,
        COALESCE(
          (SELECT json_agg(json_build_object('id', id_usuario, 'nombre', nombre, 'estudiantes', estudiantes_inscritos, 'cursos', cursos_creados))
           FROM v_top_docentes_ranking),
          '[]'::json
        ) as top_docentes
      FROM (SELECT 1) dummy
    `);

    const data = result.rows[0] || {};

    // Calcular variaciones usando helper (asumiendo que no hay comparación con mes anterior en esta función)
    const variacionEstudiantes = 0;
    const variacionCursos = 0;
    const variacionContenidos = 0;

    return {
      tarjetas: {
        estudiantes: {
          total: validarValor(data.estudiantes_total),
          variacion: variacionEstudiantes,
        },
        docentes: {
          total: validarValor(data.docentes_inactivos),
          inactivos: validarValor(data.docentes_inactivos),
        },
        cursos: {
          total: validarValor(data.cursos_activos),
          variacion: variacionCursos,
        },
        contenidos: {
          total: validarValor(data.contenidos_total),
          variacion: variacionContenidos,
        },
      },
      elementosAtencion: {
        docentesInactivos: validarValor(data.docentes_inactivos),
        cursosSinInscripciones: validarValor(data.cursos_sin_insc),
        cursosSinContenido: validarValor(data.cursos_sin_contenido),
      },
      graficos: {
        sesionesSemana: parseJsonArray(data.sesiones_semana),
        contenidoPorTipo: parseJsonArray(data.contenido_tipos),
        topCursos: parseJsonArray(data.top_cursos),
        topDocentes: parseJsonArray(data.top_docentes),
      },
    };
  } catch (error) {
    console.error('Error en getDashboardControlData:', error);
    throw error;
  }
};

