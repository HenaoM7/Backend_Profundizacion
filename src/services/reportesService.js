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

// Label is derived from period_key (already-grouped date), not from raw fecha_inscripcion.
// This avoids the GROUP BY issue: the CTE groups first, outer query just formats the label.
const MONTH_LABEL_FROM_KEY = `CASE EXTRACT(MONTH FROM period_key)::int
    WHEN 1 THEN 'Enero'    WHEN 2 THEN 'Febrero'   WHEN 3 THEN 'Marzo'
    WHEN 4 THEN 'Abril'    WHEN 5 THEN 'Mayo'       WHEN 6 THEN 'Junio'
    WHEN 7 THEN 'Julio'    WHEN 8 THEN 'Agosto'     WHEN 9 THEN 'Septiembre'
    WHEN 10 THEN 'Octubre' WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre'
  END || ' ' || EXTRACT(YEAR FROM period_key)::TEXT`;

const buildPeriodExpressions = (agrupacion) => {
  switch (agrupacion) {
    case 'trimestral':
      return {
        periodKey: `DATE_TRUNC('quarter', fecha_inscripcion)`,
        label:     `'T' || EXTRACT(QUARTER FROM period_key)::TEXT || ' ' || EXTRACT(YEAR FROM period_key)::TEXT`,
      };
    case 'semestral':
      return {
        periodKey: `MAKE_DATE(EXTRACT(YEAR FROM fecha_inscripcion)::INT, CASE WHEN EXTRACT(MONTH FROM fecha_inscripcion)::INT <= 6 THEN 1 ELSE 7 END, 1)`,
        label:     `CASE WHEN EXTRACT(MONTH FROM period_key) = 1 THEN '1S' ELSE '2S' END || ' ' || EXTRACT(YEAR FROM period_key)::TEXT`,
      };
    case 'anual':
      return {
        periodKey: `DATE_TRUNC('year', fecha_inscripcion)`,
        label:     `EXTRACT(YEAR FROM period_key)::TEXT`,
      };
    default: // mensual and custom both group by month
      return {
        periodKey: `DATE_TRUNC('month', fecha_inscripcion)`,
        label:     MONTH_LABEL_FROM_KEY,
      };
  }
};

export const getInscripcionesPorPeriodo = async ({ agrupacion, fechaInicio, fechaFin, cursoId } = {}) => {
  await ensureView('v_inscripciones_por_periodo');

  const isCustom = !agrupacion || agrupacion === 'custom';

  // For keyword agrupacion, infer date range from the current year
  let startDate = fechaInicio;
  let endDate   = fechaFin;

  if (!isCustom) {
    const year = new Date().getFullYear();
    startDate = `${year}-01-01`;
    endDate   = `${year}-12-31`;
  }

  const values = [startDate, endDate];
  let cursoFilter = '';

  if (cursoId) {
    values.push(cursoId);
    cursoFilter = `AND curso_id = $${values.length}`;
  }

  const { periodKey, label } = buildPeriodExpressions(isCustom ? 'mensual' : agrupacion);

  // CTE groups by period_key first; outer query derives the display label from that key.
  const result = await query(
    `WITH base AS (
       SELECT ${periodKey} AS period_key, COUNT(*) AS total_inscripciones
       FROM v_inscripciones_por_periodo
       WHERE fecha_inscripcion >= $1 AND fecha_inscripcion <= $2
       ${cursoFilter}
       GROUP BY ${periodKey}
     )
     SELECT ${label} AS periodo, total_inscripciones
     FROM base
     ORDER BY period_key`,
    values
  );

  return result.rows;
};

export const getIntentosPorModulo = async ({ cursoId, docenteId, fechaInicio, fechaFin } = {}) => {
  await ensureView('v_intentos_por_modulo');

  const conditions = [];
  const values = [];

  if (cursoId) {
    values.push(cursoId);
    conditions.push(`curso_id = $${values.length}`);
  }

  if (docenteId) {
    values.push(docenteId);
    conditions.push(`docente_id = $${values.length}`);
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
  await ensureView('v_certificados_por_periodo');
  const result = await query('SELECT * FROM v_certificados_por_periodo');
  return result.rows[0] ?? null;
};
