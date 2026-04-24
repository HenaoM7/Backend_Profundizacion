import bcrypt from 'bcryptjs';

import pool, { getClient } from '../src/database/db.js';

const roles = [
  { id: 'ROL001', nombre: 'SuperAdmin' },
  { id: 'ROL002', nombre: 'Admin' },
  { id: 'ROL003', nombre: 'Docente' },
  { id: 'ROL004', nombre: 'Estudiante' },
];

const defaultUser = {
  id: 'USR001',
  nombre: 'Super Admin',
  correo: 'superadmin@demo.edu',
  contrasena: 'Demo12345!',
};

const seed = async () => {
  const client = await getClient();

  try {
    const hashedPassword = await bcrypt.hash(defaultUser.contrasena, 10);

    await client.query('BEGIN');

    for (const role of roles) {
      await client.query(
        `
          INSERT INTO roles (id, nombre, activo)
          VALUES ($1, $2, TRUE)
          ON CONFLICT (id) DO UPDATE
          SET nombre = EXCLUDED.nombre,
              activo = TRUE
        `,
        [role.id, role.nombre]
      );
    }

    await client.query(
      `
        INSERT INTO usuarios (id, nombre, correo, contrasena, activo)
        VALUES ($1, $2, $3, $4, TRUE)
        ON CONFLICT (id) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            correo = EXCLUDED.correo,
            contrasena = EXCLUDED.contrasena,
            activo = TRUE
      `,
      [defaultUser.id, defaultUser.nombre, defaultUser.correo, hashedPassword]
    );

    await client.query(
      `
        INSERT INTO usuarios_roles (id_usuario, id_rol)
        VALUES ($1, $2)
        ON CONFLICT (id_usuario, id_rol) DO NOTHING
      `,
      [defaultUser.id, 'ROL001']
    );

    await client.query('COMMIT');

    console.log('Seed de autenticacion completado correctamente.');
    console.log(`Usuario inicial: ${defaultUser.correo}`);
    console.log(`Contrasena inicial: ${defaultUser.contrasena}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('No fue posible cargar los datos iniciales.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();