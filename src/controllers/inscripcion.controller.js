// src/controllers/inscripcion.controller.js
import * as InscripcionModel from '../models/inscripcion.model.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fmt = (i) => ({
  idInscripcion: i.id_inscripcion,
  idCurso:       i.id_curso,
  idUsuario:     i.id_usuario,
  fechaInicio:   i.fecha_inicio ?? null,
  fechaFinalizacion: i.fecha_finalizacion ?? null,
});

export const getAll = async (req, res, next) => {
  try {
    const { id_curso, id_usuario, page, limit } = req.query;

    if (id_curso !== undefined && !UUID_REGEX.test(id_curso)) {
      return res.status(400).json({ success: false, message: 'El campo id_curso debe ser un UUID válido.' });
    }
    if (id_usuario !== undefined && !UUID_REGEX.test(id_usuario)) {
      return res.status(400).json({ success: false, message: 'El campo id_usuario debe ser un UUID válido.' });
    }

    const result = await InscripcionModel.findAll({ id_curso, id_usuario, page: page ?? 1, limit: limit ?? 10 });

    return res.status(200).json({
      success: true,
      data: result.data.map(fmt),
      meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
    });
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) return res.status(400).json({ success: false, message: 'ID inválido.' });

    const ins = await InscripcionModel.findById(id);
    if (!ins) return res.status(404).json({ success: false, message: 'Inscripción no encontrada.' });

    return res.status(200).json({ success: true, data: fmt(ins) });
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { id_curso, id_usuario, fecha_inicio, fecha_finalizacion } = req.body;

    if (!id_curso || !UUID_REGEX.test(id_curso)) return res.status(400).json({ success: false, message: 'El campo id_curso es requerido y debe ser UUID.' });
    if (!id_usuario || !UUID_REGEX.test(id_usuario)) return res.status(400).json({ success: false, message: 'El campo id_usuario es requerido y debe ser UUID.' });

    const created = await InscripcionModel.create({ id_curso, id_usuario, fecha_inicio, fecha_finalizacion });
    return res.status(201).json({ success: true, data: fmt(created) });
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) return res.status(400).json({ success: false, message: 'ID inválido.' });

    const { fecha_inicio, fecha_finalizacion } = req.body;
    if (fecha_inicio === undefined && fecha_finalizacion === undefined) {
      return res.status(400).json({ success: false, message: 'Envíe al menos fecha_inicio o fecha_finalizacion.' });
    }

    const updated = await InscripcionModel.update(id, { fecha_inicio, fecha_finalizacion });
    if (!updated) return res.status(404).json({ success: false, message: 'Inscripción no encontrada.' });

    return res.status(200).json({ success: true, data: fmt(updated) });
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) return res.status(400).json({ success: false, message: 'ID inválido.' });

    const deleted = await InscripcionModel.remove(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Inscripción no encontrada.' });

    return res.status(200).json({ success: true, message: 'Inscripción eliminada.', idInscripcion: deleted.id_inscripcion });
  } catch (err) { next(err); }
};

