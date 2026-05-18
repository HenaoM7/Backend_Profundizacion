// src/controllers/modulo.controller.js
import * as ModuloModel from '../models/modulo.model.js';

const MAX_MODULOS = 10;

const fmt = (m) => ({
  idModulo:        m.id_modulo,
  idCurso:         m.id_curso,
  titulo:          m.titulo,
  descripcion:     m.descripcion ?? null,
  activo:          m.activo,
  orden:           m.orden,
  contenidosCount: parseInt(m.contenidos_count ?? '0', 10),
  creacion:        m.creacion,
  actualizacion:   m.actualizacion,
});

const fmtContenido = (c) => ({
  idContenido:  c.id_contenido,
  titulo:       c.titulo,
  descripcion:  c.descripcion ?? null,
  tipo:         c.tipo,
  orden:        c.orden,
  activo:       c.activo,
  creacion:     c.creacion,
});

// ── GET /api/cursos/:cursoId/modulos ───────────────────────
export const getAll = async (req, res, next) => {
  try {
    const { cursoId } = req.params;
    const { activo }  = req.query;

    if (activo !== undefined && activo !== 'true' && activo !== 'false') {
      return res.status(400).json({ success: false, message: 'El campo activo debe ser "true" o "false".' });
    }

    const cursoExiste = await ModuloModel.cursoExists(cursoId);
    if (!cursoExiste) return res.status(404).json({ success: false, message: 'Curso no encontrado.' });

    const modulos = await ModuloModel.findAll({
      id_curso: cursoId,
      activo:   activo !== undefined ? activo === 'true' : undefined,
    });

    return res.status(200).json({ success: true, data: modulos.map(fmt) });
  } catch (err) { next(err); }
};

// ── GET /api/cursos/:cursoId/modulos/:id ───────────────────
export const getById = async (req, res, next) => {
  try {
    const modulo = await ModuloModel.findById(req.params.id);
    if (!modulo) return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });

    return res.status(200).json({
      success: true,
      data: {
        ...fmt({ ...modulo, contenidos_count: String(modulo.contenidos?.length ?? 0) }),
        contenidos: (modulo.contenidos ?? []).map(fmtContenido),
      },
    });
  } catch (err) { next(err); }
};

// ── POST /api/cursos/:cursoId/modulos ──────────────────────
export const create = async (req, res, next) => {
  try {
    const { cursoId }             = req.params;
    const { titulo, descripcion, orden } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({ success: false, message: 'El campo titulo es requerido.' });
    }
    if (orden === undefined || orden === null) {
      return res.status(400).json({ success: false, message: 'El campo orden es requerido.' });
    }
    if (!Number.isInteger(Number(orden)) || Number(orden) < 1) {
      return res.status(400).json({ success: false, message: 'El campo orden debe ser un entero mayor a 0.' });
    }

    const cursoExiste = await ModuloModel.cursoExists(cursoId);
    if (!cursoExiste) return res.status(404).json({ success: false, message: 'Curso no encontrado.' });

    const total = await ModuloModel.countByCurso(cursoId);
    if (total >= MAX_MODULOS) {
      return res.status(409).json({ success: false, message: `El curso ya tiene el máximo de ${MAX_MODULOS} módulos permitidos.` });
    }

    const ordenDup = await ModuloModel.ordenExists(cursoId, Number(orden));
    if (ordenDup) {
      return res.status(409).json({ success: false, message: `Ya existe un módulo con orden ${orden} en este curso.` });
    }

    const modulo = await ModuloModel.create({ id_curso: cursoId, titulo: titulo.trim(), descripcion, orden: Number(orden) });
    return res.status(201).json({ success: true, data: fmt({ ...modulo, contenidos_count: '0' }) });
  } catch (err) { next(err); }
};

// ── PUT /api/cursos/:cursoId/modulos/:id ───────────────────
export const update = async (req, res, next) => {
  try {
    const { cursoId, id } = req.params;
    const { titulo, descripcion, orden } = req.body;

    if (titulo === undefined && descripcion === undefined && orden === undefined) {
      return res.status(400).json({ success: false, message: 'Envíe al menos un campo: titulo, descripcion u orden.' });
    }
    if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim() === '')) {
      return res.status(400).json({ success: false, message: 'El campo titulo no puede estar vacío.' });
    }
    if (orden !== undefined) {
      if (!Number.isInteger(Number(orden)) || Number(orden) < 1) {
        return res.status(400).json({ success: false, message: 'El campo orden debe ser un entero mayor a 0.' });
      }
      const ordenDup = await ModuloModel.ordenExists(cursoId, Number(orden), id);
      if (ordenDup) {
        return res.status(409).json({ success: false, message: `Ya existe un módulo con orden ${orden} en este curso.` });
      }
    }

    const modulo = await ModuloModel.update(id, { titulo: titulo?.trim(), descripcion, orden: orden !== undefined ? Number(orden) : undefined });
    if (!modulo) return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });

    return res.status(200).json({ success: true, data: fmt({ ...modulo, contenidos_count: '0' }) });
  } catch (err) { next(err); }
};

// ── PATCH /api/cursos/:cursoId/modulos/:id/activo ──────────
export const toggleActivo = async (req, res, next) => {
  try {
    const { activo } = req.body;

    if (activo === undefined || activo === null) {
      return res.status(400).json({ success: false, message: 'El campo activo es requerido.' });
    }
    if (typeof activo !== 'boolean') {
      return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false.' });
    }

    const modulo = await ModuloModel.findById(req.params.id);
    if (!modulo) return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });

    if (modulo.activo === activo) {
      return res.status(409).json({ success: false, message: `El módulo ya se encuentra ${activo ? 'activo' : 'inactivo'}.` });
    }

    const updated = await ModuloModel.toggleActivo(req.params.id, activo);
    return res.status(200).json({
      success: true,
      message: `Módulo ${activo ? 'activado' : 'desactivado'} exitosamente.`,
      data: { idModulo: updated.id_modulo, activo: updated.activo, actualizacion: updated.actualizacion },
    });
  } catch (err) { next(err); }
};

// ── PATCH /api/cursos/:cursoId/modulos/reorder ─────────────
export const reorder = async (req, res, next) => {
  try {
    const { cursoId } = req.params;
    const { orden }   = req.body;

    if (!Array.isArray(orden) || orden.length === 0) {
      return res.status(400).json({ success: false, message: 'El campo orden debe ser un array de { id_modulo, orden }.' });
    }
    for (const item of orden) {
      if (!item.id_modulo) return res.status(400).json({ success: false, message: 'Cada item debe tener id_modulo.' });
      if (!Number.isInteger(Number(item.orden)) || Number(item.orden) < 1) {
        return res.status(400).json({ success: false, message: 'Cada item debe tener orden entero mayor a 0.' });
      }
    }

    const cursoExiste = await ModuloModel.cursoExists(cursoId);
    if (!cursoExiste) return res.status(404).json({ success: false, message: 'Curso no encontrado.' });

    const modulos = await ModuloModel.reorder(cursoId, orden);
    return res.status(200).json({
      success: true,
      message: 'Módulos reordenados exitosamente.',
      data: modulos.map(m => ({ idModulo: m.id_modulo, titulo: m.titulo, orden: m.orden })),
    });
  } catch (err) { next(err); }
};

// ── DELETE /api/cursos/:cursoId/modulos/:id ────────────────
export const remove = async (req, res, next) => {
  try {
    const exists = await ModuloModel.findById(req.params.id);
    if (!exists) return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });

    const deleted = await ModuloModel.softDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });

    return res.status(200).json({ success: true, message: 'Módulo eliminado exitosamente.', eliminacion: deleted.eliminacion });
  } catch (err) { next(err); }
};