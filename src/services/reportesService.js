import { query } from '../database/db.js';

// Checks if a view exists before querying it
const viewExists = async (viewName) => {
  const result = await query(
    `SELECT 1 FROM information_schema.views WHERE table_name = $1`,
    [viewName]
  );
  return result.rows.length > 0;
};

const ensureView = async (viewName) => {
  const exists = await viewExists(viewName);
  if (!exists) {
    throw { status: 503, message: `Report view "${viewName}" is not available yet.` };
  }
};

export const getCursosPopulares = async ({ cursoId } = {}) => {
  await ensureView('v_cursos_populares');

  const conditions = [];
  const values = [];

  if (cursoId) {
    values.push(cursoId);
    conditions.push(`curso_id = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(`SELECT * FROM v_cursos_populares ${where}`, values);

  return result.rows;
};

// Spanish month name from a series alias column (s.period_key)
const MONTH_LABEL_SERIES = `CASE EXTRACT(MONTH FROM s.period_key)::int
  WHEN 1  THEN 'Enero'      WHEN 2  THEN 'Febrero'   WHEN 3  THEN 'Marzo'
  WHEN 4  THEN 'Abril'      WHEN 5  THEN 'Mayo'       WHEN 6  THEN 'Junio'
  WHEN 7  THEN 'Julio'      WHEN 8  THEN 'Agosto'     WHEN 9  THEN 'Septiembre'
  WHEN 10 THEN 'Octubre'    WHEN 11 THEN 'Noviembre'  WHEN 12 THEN 'Diciembre'
END || ' ' || EXTRACT(YEAR FROM s.period_key)::TEXT`;

// Spanish month name from a plain CTE column named period_key (custom mode)
const MONTH_LABEL_CTE = `CASE EXTRACT(MONTH FROM period_key)::int
  WHEN 1  THEN 'Enero'      WHEN 2  THEN 'Febrero'   WHEN 3  THEN 'Marzo'
  WHEN 4  THEN 'Abril'      WHEN 5  THEN 'Mayo'       WHEN 6  THEN 'Junio'
  WHEN 7  THEN 'Julio'      WHEN 8  THEN 'Agosto'     WHEN 9  THEN 'Septiembre'
  WHEN 10 THEN 'Octubre'    WHEN 11 THEN 'Noviembre'  WHEN 12 THEN 'Diciembre'
END || ' ' || EXTRACT(YEAR FROM period_key)::TEXT`;

// Shared year-bounds CTE — always current year, no params needed
const YEAR_BOUNDS_CTE = `year_bounds AS (
  SELECT
    DATE_TRUNC('year', CURRENT_DATE)::DATE                                      AS year_start,
    (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')::DATE AS year_end
)`;

// Date filter that references year_bounds — used inside keyword-mode counts CTEs
const YEAR_DATE_FILTER = `fecha_inscripcion >= (SELECT year_start FROM year_bounds)
         AND fecha_inscripcion <= (SELECT year_end FROM year_bounds)`;

// Builds a complete generate_series query for keyword agrupacion modes.
// cursoFilter is '' or 'AND curso_id = $1'.
const buildSeriesQuery = (agrupacion, cursoFilter) => {
  switch (agrupacion) {
    case 'trimestral':
      return `
        WITH ${YEAR_BOUNDS_CTE},
        series AS (
          SELECT generate_series(year_start, year_end, '3 months'::interval) AS period_key
          FROM year_bounds
        ),
        counts AS (
          SELECT DATE_TRUNC('quarter', fecha_inscripcion) AS period_key, COUNT(*) AS total
          FROM v_inscripciones_por_periodo
          WHERE ${YEAR_DATE_FILTER} ${cursoFilter}
          GROUP BY DATE_TRUNC('quarter', fecha_inscripcion)
        )
        SELECT 'T' || EXTRACT(QUARTER FROM s.period_key)::TEXT
               || ' ' || EXTRACT(YEAR FROM s.period_key)::TEXT  AS periodo,
               COALESCE(c.total, 0)                              AS total_inscripciones
        FROM series s
        LEFT JOIN counts c ON c.period_key = s.period_key
        ORDER BY s.period_key`;

    case 'semestral': {
      const semKey = `MAKE_DATE(
        EXTRACT(YEAR  FROM fecha_inscripcion)::INT,
        CASE WHEN EXTRACT(MONTH FROM fecha_inscripcion)::INT <= 6 THEN 1 ELSE 7 END,
        1)`;
      return `
        WITH ${YEAR_BOUNDS_CTE},
        series AS (
          SELECT generate_series(year_start, year_end, '6 months'::interval) AS period_key
          FROM year_bounds
        ),
        counts AS (
          SELECT ${semKey} AS period_key, COUNT(*) AS total
          FROM v_inscripciones_por_periodo
          WHERE ${YEAR_DATE_FILTER} ${cursoFilter}
          GROUP BY ${semKey}
        )
        SELECT CASE WHEN EXTRACT(MONTH FROM s.period_key) = 1 THEN '1S' ELSE '2S' END
               || ' ' || EXTRACT(YEAR FROM s.period_key)::TEXT  AS periodo,
               COALESCE(c.total, 0)                              AS total_inscripciones
        FROM series s
        LEFT JOIN counts c ON c.period_key = s.period_key
        ORDER BY s.period_key`;
    }

    case 'anual':
      // Always 1 row — COUNT(*) with no GROUP BY returns 0 when no data
      return `
        WITH ${YEAR_BOUNDS_CTE}
        SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT AS periodo,
               COUNT(*)                              AS total_inscripciones
        FROM v_inscripciones_por_periodo
        WHERE ${YEAR_DATE_FILTER} ${cursoFilter}`;

    default: // mensual — 12 rows, one per month of the current year
      return `
        WITH ${YEAR_BOUNDS_CTE},
        series AS (
          SELECT generate_series(year_start, year_end, '1 month'::interval) AS period_key
          FROM year_bounds
        ),
        counts AS (
          SELECT DATE_TRUNC('month', fecha_inscripcion) AS period_key, COUNT(*) AS total
          FROM v_inscripciones_por_periodo
          WHERE ${YEAR_DATE_FILTER} ${cursoFilter}
          GROUP BY DATE_TRUNC('month', fecha_inscripcion)
        )
        SELECT ${MONTH_LABEL_SERIES}   AS periodo,
               COALESCE(c.total, 0)   AS total_inscripciones
        FROM series s
        LEFT JOIN counts c ON c.period_key = s.period_key
        ORDER BY s.period_key`;
  }
};

export const getInscripcionesPorPeriodo = async ({ agrupacion, fechaInicio, fechaFin, cursoId } = {}) => {
  await ensureView('v_inscripciones_por_periodo');

  const isCustom = !agrupacion || agrupacion === 'custom';
  const values   = [];
  let sql;

  if (isCustom) {
    // Custom: caller provides the exact date range; group by month, no generate_series
    values.push(fechaInicio, fechaFin);
    if (cursoId) values.push(cursoId);
    const cursoFilter = cursoId ? `AND curso_id = $3` : '';

    sql = `
      WITH base AS (
        SELECT DATE_TRUNC('month', fecha_inscripcion) AS period_key,
               COUNT(*)                               AS total_inscripciones
        FROM v_inscripciones_por_periodo
        WHERE fecha_inscripcion >= $1 AND fecha_inscripcion <= $2
        ${cursoFilter}
        GROUP BY DATE_TRUNC('month', fecha_inscripcion)
      )
      SELECT ${MONTH_LABEL_CTE} AS periodo, total_inscripciones
      FROM base
      ORDER BY period_key`;
  } else {
    // Keyword modes: always scoped to the current year via CURRENT_DATE in SQL
    if (cursoId) values.push(cursoId);
    const cursoFilter = cursoId ? `AND curso_id = $1` : '';
    sql = buildSeriesQuery(agrupacion, cursoFilter);
  }

  const result = await query(sql, values);
  return result.rows;
};

export const getIntentosPorModulo = async ({ cursoId, fechaInicio, fechaFin } = {}) => {
  await ensureView('v_intentos_por_modulo');

  const conditions = [];
  const values = [];

  if (cursoId) {
    values.push(cursoId);
    conditions.push(`curso_id = $${values.length}`);
  }

  if (fechaInicio) {
    values.push(fechaInicio);
    conditions.push(`fecha >= $${values.length}`);
  }

  if (fechaFin) {
    values.push(fechaFin);
    conditions.push(`fecha <= $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(`SELECT * FROM v_intentos_por_modulo ${where}`, values);

  return result.rows;
};

export const getTasaAprobacion = async ({ cursoId, fechaInicio, fechaFin } = {}) => {
  await ensureView('v_tasa_aprobacion');

  const conditions = [];
  const values = [];

  if (cursoId) {
    values.push(cursoId);
    conditions.push(`curso_id = $${values.length}`);
  }

  if (fechaInicio) {
    values.push(fechaInicio);
    conditions.push(`fecha >= $${values.length}`);
  }

  if (fechaFin) {
    values.push(fechaFin);
    conditions.push(`fecha <= $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(`SELECT * FROM v_tasa_aprobacion ${where}`, values);

  return result.rows;
};

export const getCursosActivosVsInactivos = async () => {
  await ensureView('v_cursos_activos_inactivos');
  const result = await query('SELECT * FROM v_cursos_activos_inactivos');
  return result.rows[0] ?? null;
};

export const getCertificados = async () => {
  await ensureView('v_certificados_emitidos_vs_descargados');
  const result = await query('SELECT * FROM v_certificados_emitidos_vs_descargados');
  return result.rows[0] ?? null;
};
