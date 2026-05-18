// src/repositories/adminDashboardRepository.js

import { query } from '../database/db.js';
import { UsuariosTotalStats } from '../models/UsuariosTotalStats.js';
import { UsuariosActivosStats } from '../models/UsuariosActivosStats.js';
import { UsuariosPorRolStats } from '../models/UsuariosPorRolStats.js';
import { EstudiantesInscritosStats } from '../models/EstudiantesInscritosStats.js';
import { EstudiantesCompletadosStats } from '../models/EstudiantesCompletadosStats.js';
import { CursoTopStats } from '../models/CursoTopStats.js';

export const getTotalUsuarios = async (adminId) => {
  const result = await query(
    `SELECT COUNT(*) AS total_usuarios
     FROM usuario
     WHERE creado_por = $1`,
    [adminId]
  );
  return result.rows[0] ? UsuariosTotalStats.fromRow(result.rows[0]) : null;
};

export const getUsuariosActivos = async (adminId) => {
  const result = await query(
    `SELECT COUNT(*) AS usuarios_activos
     FROM usuario
     WHERE creado_por = $1
       AND activo = true`,
    [adminId]
  );
  return result.rows[0] ? UsuariosActivosStats.fromRow(result.rows[0]) : null;
};

export const getUsuariosPorRol = async (adminId) => {
  const result = await query(
    `SELECT r.nombre AS rol, COUNT(*) AS total
     FROM usuario u
     JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
     JOIN rol r ON ur.id_rol = r.id_rol
     WHERE u.creado_por = $1
     GROUP BY r.nombre
     ORDER BY total DESC`,
    [adminId]
  );
  return result.rows.map(UsuariosPorRolStats.fromRow);
};

export const getEstudiantesInscritos = async (adminId) => {
  const result = await query(
    `SELECT COUNT(DISTINCT pc.id_usuario) AS total_inscritos
     FROM progreso_curso pc
     JOIN curso c ON pc.id_curso = c.id_curso
     WHERE c.id_usuario = $1
        OR c.id_usuario IN (
          SELECT u.id_usuario
          FROM usuario u
          JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
          JOIN rol r ON ur.id_rol = r.id_rol
          WHERE u.creado_por = $1
            AND r.nombre = 'Docente'
        )`,
    [adminId]
  );
  return result.rows[0] ? EstudiantesInscritosStats.fromRow(result.rows[0]) : null;
};

export const getEstudiantesCompletados = async (adminId) => {
  const result = await query(
    `SELECT COUNT(DISTINCT pc.id_usuario) AS total_completados
     FROM progreso_curso pc
     JOIN curso c ON pc.id_curso = c.id_curso
     WHERE pc.completado = true
       AND (
         c.id_usuario = $1
         OR c.id_usuario IN (
           SELECT u.id_usuario
           FROM usuario u
           JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
           JOIN rol r ON ur.id_rol = r.id_rol
           WHERE u.creado_por = $1
             AND r.nombre = 'Docente'
         )
       )`,
    [adminId]
  );
  return result.rows[0] ? EstudiantesCompletadosStats.fromRow(result.rows[0]) : null;
};

export const getTopCursosInscritos = async (adminId) => {
  const result = await query(
    `SELECT c.id_curso, c.titulo, COUNT(DISTINCT pc.id_usuario) AS total
     FROM curso c
     JOIN progreso_curso pc ON c.id_curso = pc.id_curso
     WHERE c.id_usuario = $1
        OR c.id_usuario IN (
          SELECT u.id_usuario
          FROM usuario u
          JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
          JOIN rol r ON ur.id_rol = r.id_rol
          WHERE u.creado_por = $1
            AND r.nombre = 'Docente'
        )
     GROUP BY c.id_curso, c.titulo
     ORDER BY total DESC
     LIMIT 5`,
    [adminId]
  );
  return result.rows.map(CursoTopStats.fromRow);
};

export const getTopCursosCompletados = async (adminId) => {
  const result = await query(
    `SELECT c.id_curso, c.titulo, COUNT(DISTINCT pc.id_usuario) AS total
     FROM curso c
     JOIN progreso_curso pc ON c.id_curso = pc.id_curso
     WHERE pc.completado = true
       AND (
         c.id_usuario = $1
         OR c.id_usuario IN (
           SELECT u.id_usuario
           FROM usuario u
           JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
           JOIN rol r ON ur.id_rol = r.id_rol
           WHERE u.creado_por = $1
             AND r.nombre = 'Docente'
         )
       )
     GROUP BY c.id_curso, c.titulo
     ORDER BY total DESC
     LIMIT 5`,
    [adminId]
  );
  return result.rows.map(CursoTopStats.fromRow);
};