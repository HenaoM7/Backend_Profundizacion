// src/controllers/contenido.controller.js
import * as ContenidoModel from '../models/contenido.model.js';

const TIPOS_VALIDOS = ['video', 'texto', 'archivo', 'imagen'];

const fmt = (c) => ({
  idContenido:   c.id_contenido,
  idModulo:      c.id_modulo,
  titulo:        c.titulo,
  descripcion:   c.descripcion ?? null,
  tipo:          c.tipo,
  urlOTexto:     c.url_o_texto,
  orden:         c.orden,
  activo:        c.activo,
  creacion:      c.creacion,
  actualizacion: c.actualizacion,
});

// ── GET /api/modulos/:moduloId/contenidos ──────────────────
export const getAll = async (req, res, next) => {
  try {
    const { moduloId } = req.params;
    const { activo, tipo } = req.query;

    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ success: false, message: `El tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}.` });
    }
    if (activo !== undefined && activo !== 'true' && activo !== 'false') {
      return res.status(400).json({ success: false, message: 'El campo activo debe ser "true" o "false".' });
    }

    const moduloExiste = await ContenidoModel.moduloExists(moduloId);
    if (!moduloExiste) return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });

    const contenidos = await ContenidoModel.findAll({
      id_modulo: moduloId,
      activo:    activo !== undefined ? activo === 'true' : undefined,
      tipo,
    });

    return res.status(200).json({ success: true, data: contenidos.map(fmt) });
  } catch (err) { next(err); }
};

// ── GET /api/modulos/:moduloId/contenidos/:id ──────────────
export const getById = async (req, res, next) => {
  try {
    const contenido = await ContenidoModel.findById(req.params.id);
    if (!contenido) return res.status(404).json({ success: false, message: 'Contenido no encontrado.' });

    return res.status(200).json({ success: true, data: fmt(contenido) });
  } catch (err) { next(err); }
};

// ── POST /api/modulos/:moduloId/contenidos ─────────────────
export const create = async (req, res, next) => {
  try {
    const { moduloId } = req.params;
    const { titulo, descripcion, tipo, url_o_texto, orden } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({ success: false, message: 'El campo titulo es requerido.' });
    }
    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ success: false, message: `El campo tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}.` });
    }
    if (!url_o_texto || String(url_o_texto).trim() === '') {
      return res.status(400).json({ success: false, message: 'El campo url_o_texto es requerido.' });
    }
    if (orden === undefined || orden === null) {
      return res.status(400).json({ success: false, message: 'El campo orden es requerido.' });
    }
    if (!Number.isInteger(Number(orden)) || Number(orden) < 1) {
      return res.status(400).json({ success: false, message: 'El campo orden debe ser un entero mayor a 0.' });
    }

    const moduloExiste = await ContenidoModel.moduloExists(moduloId);
    if (!moduloExiste) return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });

    const ordenDup = await ContenidoModel.ordenExists(moduloId, Number(orden));
    if (ordenDup) {
      return res.status(409).json({ success: false, message: `Ya existe un contenido con orden ${orden} en este módulo.` });
    }

    const contenido = await ContenidoModel.create({
      id_modulo: moduloId, titulo: titulo.trim(), descripcion,
      tipo, url_o_texto: String(url_o_texto).trim(), orden: Number(orden),
    });

    return res.status(201).json({ success: true, data: fmt(contenido) });
  } catch (err) { next(err); }
};

// ── PUT /api/modulos/:moduloId/contenidos/:id ──────────────
export const update = async (req, res, next) => {
  try {
    const { moduloId, id } = req.params;
    const { titulo, descripcion, tipo, url_o_texto, orden, activo } = req.body;

    if ([titulo, descripcion, tipo, url_o_texto, orden, activo].every(v => v === undefined)) {
      return res.status(400).json({ success: false, message: 'Envíe al menos un campo para actualizar.' });
    }
    if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim() === '')) {
      return res.status(400).json({ success: false, message: 'El campo titulo no puede estar vacío.' });
    }
    if (tipo !== undefined && !TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ success: false, message: `El tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}.` });
    }
    if (activo !== undefined && typeof activo !== 'boolean') {
      return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false.' });
    }
    if (orden !== undefined) {
      if (!Number.isInteger(Number(orden)) || Number(orden) < 1) {
        return res.status(400).json({ success: false, message: 'El campo orden debe ser un entero mayor a 0.' });
      }
      const ordenDup = await ContenidoModel.ordenExists(moduloId, Number(orden), id);
      if (ordenDup) {
        return res.status(409).json({ success: false, message: `Ya existe un contenido con orden ${orden} en este módulo.` });
      }
    }

    const contenido = await ContenidoModel.update(id, {
      titulo: titulo?.trim(), descripcion, tipo,
      url_o_texto: url_o_texto?.trim(), orden: orden !== undefined ? Number(orden) : undefined, activo,
    });

    if (!contenido) return res.status(404).json({ success: false, message: 'Contenido no encontrado.' });

    return res.status(200).json({ success: true, data: fmt(contenido) });
  } catch (err) { next(err); }
};

// ── PATCH /api/modulos/:moduloId/contenidos/reorder ────────
export const reorder = async (req, res, next) => {
  try {
    const { moduloId } = req.params;
    const { orden }    = req.body;

    if (!Array.isArray(orden) || orden.length === 0) {
      return res.status(400).json({ success: false, message: 'El campo orden debe ser un array de { id_contenido, orden }.' });
    }
    for (const item of orden) {
      if (!item.id_contenido) return res.status(400).json({ success: false, message: 'Cada item debe tener id_contenido.' });
      if (!Number.isInteger(Number(item.orden)) || Number(item.orden) < 1) {
        return res.status(400).json({ success: false, message: 'Cada item debe tener orden entero mayor a 0.' });
      }
    }

    const moduloExiste = await ContenidoModel.moduloExists(moduloId);
    if (!moduloExiste) return res.status(404).json({ success: false, message: 'Módulo no encontrado.' });

    const contenidos = await ContenidoModel.reorder(moduloId, orden);
    return res.status(200).json({
      success: true,
      message: 'Contenidos reordenados exitosamente.',
      data: contenidos.map(c => ({ idContenido: c.id_contenido, titulo: c.titulo, orden: c.orden })),
    });
  } catch (err) { next(err); }
};

// ── DELETE /api/modulos/:moduloId/contenidos/:id ───────────
export const remove = async (req, res, next) => {
  try {
    const exists = await ContenidoModel.findById(req.params.id);
    if (!exists) return res.status(404).json({ success: false, message: 'Contenido no encontrado.' });

    const deleted = await ContenidoModel.softDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Contenido no encontrado.' });

    return res.status(200).json({ success: true, message: 'Contenido eliminado exitosamente.', eliminacion: deleted.eliminacion });
  } catch (err) { next(err); }
};