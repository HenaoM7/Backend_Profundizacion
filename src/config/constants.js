export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN:       'Admin',
  DOCENTE:     'Docente',
  ESTUDIANTE:  'Estudiante',
});

// Tokens de prueba — UUIDs corresponden a usuarios reales en la tabla usuario
export const MOCK_TOKENS = Object.freeze({
  'token-superadmin-001': {
    userId: '7790af4d-5033-481d-988b-7a0a0c798622',
    name:   'Super Admin',
    role:   ROLES.SUPER_ADMIN,
  },
  'token-admin-001': {
    userId: 'f6937573-dec7-424a-8522-2c1a1cb3449e',
    name:   'Administrador Base',
    role:   ROLES.ADMIN,
  },
  'token-docente-001': {
    userId: 'af9b82dd-6565-4e2b-b672-930c1e1515ec',
    name:   'Docente Base',
    role:   ROLES.DOCENTE,
  },
  'token-estudiante-001': {
    userId: 'acd0de58-ae84-4d8f-b468-8818935fd382',
    name:   'Estudiante Base',
    role:   ROLES.ESTUDIANTE,
  },
});
