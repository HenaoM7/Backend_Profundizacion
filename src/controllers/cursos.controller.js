import { query } from '../database/db.js';

export const listarCursosPorDocente = async (req, res, next) => {
  try {
    const { teacher_id } = req.query;

    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id es requerido' });
    }

    const resultado = await query(
      `SELECT id_curso, id_usuario, titulo, descripcion, activo, creacion, actualizacion
       FROM curso
       WHERE id_usuario = $1
         AND eliminacion IS NULL
       ORDER BY creacion DESC`,
      [teacher_id]
    );

    const cursos = resultado.rows.map((curso) => ({
      id: curso.id_curso,
      teacher_id: curso.id_usuario,
      title: curso.titulo,
      description: curso.descripcion,
      active: curso.activo,
      created_at: curso.creacion,
      updated_at: curso.actualizacion,
    }));

    res.json({ courses: cursos });
  } catch (error) {
    next(error);
  }
};

export const crearCurso = async (req, res, next) => {
  try {
    const { teacher_id, title, description } = req.body;

    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id es requerido' });
    }

    if (!title) {
      return res.status(400).json({ error: 'title es requerido' });
    }

    const resultado = await query(
      `INSERT INTO curso (id_usuario, titulo, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id_curso, id_usuario, titulo, descripcion, activo, creacion, actualizacion`,
      [teacher_id, title, description || null]
    );

    const curso = resultado.rows[0];

    res.status(201).json({
      id: curso.id_curso,
      teacher_id: curso.id_usuario,
      title: curso.titulo,
      description: curso.descripcion,
      active: curso.activo,
      created_at: curso.creacion,
      updated_at: curso.actualizacion,
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id del curso es requerido' });
    }

    if (!title) {
      return res.status(400).json({ error: 'title es requerido' });
    }

    const resultado = await query(
      `UPDATE curso
       SET titulo = $1,
           descripcion = $2,
           actualizacion = now()
       WHERE id_curso = $3
         AND eliminacion IS NULL
       RETURNING id_curso, id_usuario, titulo, descripcion, activo, creacion, actualizacion`,
      [title, description || null, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const curso = resultado.rows[0];

    res.json({
      id: curso.id_curso,
      teacher_id: curso.id_usuario,
      title: curso.titulo,
      description: curso.descripcion,
      active: curso.activo,
      created_at: curso.creacion,
      updated_at: curso.actualizacion,
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarCurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'id del curso es requerido' });
    }

    const resultado = await query(
      `DELETE FROM curso
       WHERE id_curso = $1
       RETURNING id_curso`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listarModulosPorCurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'id del curso es requerido' });
    }

    const resultado = await query(
      `SELECT id_modulo, id_curso, titulo, descripcion, activo, orden, creacion, actualizacion
       FROM modulo
       WHERE id_curso = $1
         AND eliminacion IS NULL
       ORDER BY orden ASC`,
      [id]
    );

    const modulos = resultado.rows.map((modulo) => ({
      id: modulo.id_modulo,
      course_id: modulo.id_curso,
      title: modulo.titulo,
      description: modulo.descripcion,
      active: modulo.activo,
      order: modulo.orden,
      created_at: modulo.creacion,
      updated_at: modulo.actualizacion,
    }));

    res.json({ modules: modulos });
  } catch (error) {
    next(error);
  }
};

export const crearModuloEnCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id del curso es requerido' });
    }

    if (!title) {
      return res.status(400).json({ error: 'title es requerido' });
    }

    const resultado = await query(
      `INSERT INTO modulo (id_curso, titulo, descripcion, orden)
       VALUES ($1, $2, $3, $4)
       RETURNING id_modulo, id_curso, titulo, descripcion, activo, orden, creacion, actualizacion`,
      [id, title, description || null, order || 0]
    );

    const modulo = resultado.rows[0];

    res.status(201).json({
      id: modulo.id_modulo,
      course_id: modulo.id_curso,
      title: modulo.titulo,
      description: modulo.descripcion,
      active: modulo.activo,
      order: modulo.orden,
      created_at: modulo.creacion,
      updated_at: modulo.actualizacion,
    });
  } catch (error) {
    next(error);
  }
};
