import bcrypt from 'bcryptjs';

import pool, { getClient } from '../src/database/db.js';
import { getPermissionsForRoles } from '../src/security/accessControl.js';

const roles = [
    { id: 'ROL001', nombre: 'SuperAdmin' },
    { id: 'ROL002', nombre: 'Admin' },
    { id: 'ROL003', nombre: 'Docente' },
    { id: 'ROL004', nombre: 'Estudiante' },
];

const defaultUsers = [
    {
        id: 'USR001',
        nombre: 'Super Admin',
        correo: 'superadmin@demo.edu',
        contrasena: 'Demo12345!',
        roleId: 'ROL001',
        roleName: 'SuperAdmin',
    },
    {
        id: 'USR002',
        nombre: 'Administrador Base',
        correo: 'admin@demo.edu',
        contrasena: 'Admin12345!',
        roleId: 'ROL002',
        roleName: 'Admin',
    },
    {
        id: 'USR003',
        nombre: 'Docente Base',
        correo: 'docente@demo.edu',
        contrasena: 'Docente12345!',
        roleId: 'ROL003',
        roleName: 'Docente',
    },
    {
        id: 'USR004',
        nombre: 'Estudiante Base',
        correo: 'estudiante@demo.edu',
        contrasena: 'Estudiante12345!',
        roleId: 'ROL004',
        roleName: 'Estudiante',
    },
];

const seed = async () => {
    const client = await getClient();

    try {
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

        for (const defaultUser of defaultUsers) {
            const hashedPassword = await bcrypt.hash(defaultUser.contrasena, 10);

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
                [defaultUser.id, defaultUser.roleId]
            );
        }

        await client.query('COMMIT');

        console.log('Seed de autenticacion completado correctamente.');

        for (const defaultUser of defaultUsers) {
            const permissions = getPermissionsForRoles([defaultUser.roleName]);

            console.log(`Usuario ${defaultUser.roleName}: ${defaultUser.correo}`);
            console.log(`Contrasena ${defaultUser.roleName}: ${defaultUser.contrasena}`);
            console.log(`Permisos ${defaultUser.roleName}: ${permissions.join(', ') || 'Sin permisos'}`);
        }
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