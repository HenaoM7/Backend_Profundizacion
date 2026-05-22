// src/controllers/curso.controller.js
import * as CursoModel from '../models/curso.model.js';
import { ROLES } from '../config/constants.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Formateador interno ───────────────────────────────────────
const fmt = (c) => ({
  idCurso:       c.id_curso,
  idUsuario:     c.id_usuario,
  titulo:        c.titulo,
  descripcion:   c.descripcion ?? null,
  activo:        c.activo,
  modulosCount:  parseInt(c.modulos_count ?? '0', 10),
  creacion:      c.creacion,
  actualizacion: c.actualizacion,
});

const fmtModulo = (m) => ({
  idModulo:        m.id_modulo,
  titulo:          m.titulo,
  descripcion:     m.descripcion ?? null,
  activo:          m.activo,
  orden:           m.orden,
  contenidosCount: parseInt(m.contenidos_count ?? '0', 10),
  creacion:        m.creacion,
});

// ── GET /api/cursos ────────────────────────────────────────
export const getAll = async (req, res, next) => {
  try {
    const { activo, id_usuario, page, limit } = req.query;

    if (activo !== undefined && activo !== 'true' && activo !== 'false') {
      return res.status(400).json({ success: false, message: 'El campo activo debe ser "true" o "false".' });
    }

    // Validar que page y limit sean números positivos si vienen
    if (page !== undefined && (isNaN(parseInt(page, 10)) || parseInt(page, 10) < 1)) {
      return res.status(400).json({ success: false, message: 'El campo page debe ser un número entero mayor a 0.' });
    }
    if (limit !== undefined && (isNaN(parseInt(limit, 10)) || parseInt(limit, 10) < 1)) {
      return res.status(400).json({ success: false, message: 'El campo limit debe ser un número entero mayor a 0.' });
    }

    const result = await CursoModel.findAll({
      activo:     activo !== undefined ? activo === 'true' : undefined,
      id_usuario,
      page:       page  ?? 1,
      limit:      limit ?? 10,
    });

    return res.status(200).json({
      success: true,
      data:    result.data.map(fmt),
      meta: {
        total:      result.total,
        page:       result.page,
        limit:      result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/cursos/:id ────────────────────────────────────
export const getById = async (req, res, next) => {
  try {
    const curso = await CursoModel.findById(req.params.id);

    if (!curso) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...fmt({ ...curso, modulos_count: String(curso.modulos?.length ?? 0) }),
        modulos: (curso.modulos ?? []).map(fmtModulo),
      },
    });
  } catch (err) { next(err); }
};

// ── POST /api/cursos ───────────────────────────────────────
export const create = async (req, res, next) => {
  try {
    const { titulo, descripcion, id_usuario } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({ success: false, message: 'El campo titulo es requerido.' });
    }
    if (!id_usuario) {
      return res.status(400).json({ success: false, message: 'El campo id_usuario es requerido.' });
    }
    if (!UUID_REGEX.test(id_usuario)) {
      return res.status(400).json({ success: false, message: 'El campo id_usuario debe ser un UUID válido.' });
    }

    const curso = await CursoModel.create({ id_usuario, titulo: titulo.trim(), descripcion });
    return res.status(201).json({ success: true, data: fmt({ ...curso, modulos_count: '0' }) });
  } catch (err) { next(err); }
};

// ── PUT /api/cursos/:id ────────────────────────────────────
export const update = async (req, res, next) => {
  try {
    const { titulo, descripcion, id_usuario } = req.body;

    if (titulo === undefined && descripcion === undefined && id_usuario === undefined) {
      return res.status(400).json({ success: false, message: 'Envíe al menos un campo: titulo, descripcion o id_usuario.' });
    }
    if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim() === '')) {
      return res.status(400).json({ success: false, message: 'El campo titulo no puede estar vacío.' });
    }
    if (id_usuario !== undefined && !UUID_REGEX.test(id_usuario)) {
      return res.status(400).json({ success: false, message: 'El campo id_usuario debe ser un UUID válido.' });
    }

    const curso = await CursoModel.update(req.params.id, { titulo: titulo?.trim(), descripcion, id_usuario });

    if (!curso) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado.' });
    }

    return res.status(200).json({ success: true, data: fmt({ ...curso, modulos_count: '0' }) });
  } catch (err) { next(err); }
};

// ── PATCH /api/cursos/:id/activo ──────────────────────────
export const toggleActivo = async (req, res, next) => {
  try {
    const { activo } = req.body;

    if (activo === undefined || activo === null) {
      return res.status(400).json({ success: false, message: 'El campo activo es requerido.' });
    }
    if (typeof activo !== 'boolean') {
      return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false.' });
    }

    const curso = await CursoModel.findById(req.params.id);
    if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado.' });

    if (curso.activo === activo) {
      return res.status(409).json({ success: false, message: `El curso ya se encuentra ${activo ? 'activo' : 'inactivo'}.` });
    }

    const updated = await CursoModel.toggleActivo(req.params.id, activo);
    return res.status(200).json({
      success: true,
      message: `Curso ${activo ? 'activado' : 'desactivado'} exitosamente.`,
      data: { idCurso: updated.id_curso, activo: updated.activo, actualizacion: updated.actualizacion },
    });
  } catch (err) { next(err); }
};

// ── DELETE /api/cursos/:id ─────────────────────────────────
export const remove = async (req, res, next) => {
  try {
    const exists = await CursoModel.findById(req.params.id);
    if (!exists) return res.status(404).json({ success: false, message: 'Curso no encontrado.' });

    const deleted = await CursoModel.softDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Curso no encontrado.' });

    return res.status(200).json({ success: true, message: 'Curso eliminado exitosamente.', eliminacion: deleted.eliminacion });
  } catch (err) { next(err); }
};