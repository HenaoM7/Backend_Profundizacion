import * as reportesService from '../services/reportesService.js';

export const getCursosPopulares = async (req, res, next) => {
  try {
    const { curso_id } = req.query;
    const data = await reportesService.getCursosPopulares({ cursoId: curso_id });

    res.json({
      success: true,
      data,
      meta: { total: data.length, filtros_aplicados: { curso_id: curso_id ?? null } },
    });
  } catch (err) { next(err); }
};

const VALID_AGRUPACIONES = ['mensual', 'trimestral', 'semestral', 'anual', 'custom'];

export const getInscripcionesPorPeriodo = async (req, res, next) => {
  try {
    const { agrupacion, fecha_inicio, fecha_fin, curso_id } = req.query;

    if (agrupacion && !VALID_AGRUPACIONES.includes(agrupacion)) {
      return res.status(400).json({
        success: false,
        message: `agrupacion must be one of: ${VALID_AGRUPACIONES.join(', ')}.`,
      });
    }

    const isCustom = !agrupacion || agrupacion === 'custom';

    if (isCustom && (!fecha_inicio || !fecha_fin)) {
      return res.status(400).json({
        success: false,
        message: 'Custom range requires fecha_inicio and fecha_fin.',
      });
    }

    const data = await reportesService.getInscripcionesPorPeriodo({
      agrupacion,
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin,
      cursoId: curso_id,
    });

    res.json({
      success: true,
      data,
      meta: {
        total: data.length,
        filtros_aplicados: {
          agrupacion: agrupacion ?? 'custom',
          fecha_inicio: fecha_inicio ?? null,
          fecha_fin: fecha_fin ?? null,
          curso_id: curso_id ?? null,
        },
      },
    });
  } catch (err) { next(err); }
};

export const getIntentosPorModulo = async (req, res, next) => {
  try {
    const { curso_id, docente_id, fecha_inicio, fecha_fin } = req.query;
    const data = await reportesService.getIntentosPorModulo({
      cursoId: curso_id,
      docenteId: docente_id,
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin,
    });

    res.json({
      success: true,
      data,
      meta: {
        total: data.length,
        filtros_aplicados: {
          curso_id: curso_id ?? null,
          docente_id: docente_id ?? null,
          fecha_inicio: fecha_inicio ?? null,
          fecha_fin: fecha_fin ?? null,
        },
      },
    });
  } catch (err) { next(err); }
};

export const getTasaAprobacion = async (req, res, next) => {
  try {
    const { curso_id, fecha_inicio, fecha_fin } = req.query;
    const data = await reportesService.getTasaAprobacion({
      cursoId: curso_id,
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin,
    });

    res.json({
      success: true,
      data,
      meta: {
        total: data.length,
        filtros_aplicados: {
          curso_id: curso_id ?? null,
          fecha_inicio: fecha_inicio ?? null,
          fecha_fin: fecha_fin ?? null,
        },
      },
    });
  } catch (err) { next(err); }
};

export const getCursosActivosVsInactivos = async (req, res, next) => {
  try {
    const data = await reportesService.getCursosActivosVsInactivos();

    res.json({
      success: true,
      data,
      meta: { filtros_aplicados: {} },
    });
  } catch (err) { next(err); }
};

export const getCertificados = async (req, res, next) => {
  try {
    const data = await reportesService.getCertificados();

    res.json({
      success: true,
      data,
      meta: { filtros_aplicados: {} },
    });
  } catch (err) { next(err); }
};
