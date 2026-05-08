export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN:       'Admin',
  DOCENTE:     'Docente',
  ESTUDIANTE:  'Estudiante',
});

export const MIN_PASSING_SCORE = 60;

// Tokens de prueba mapeados a usuarios reales de la BD
export const MOCK_TOKENS = Object.freeze({
  'token-superadmin-001': {
    userId: '0b36846d-c1e9-4d67-a7b6-043638b3112d',
    name:   'Super Admin',
    role:   ROLES.SUPER_ADMIN,
  },
  'token-admin-001': {
    userId: 'f821425b-0e37-47d4-898e-c47d7ff98658',
    name:   'Administrador Base',
    role:   ROLES.ADMIN,
  },
  'token-docente-001': {
    userId: 'c98d3456-0899-4ce7-ad4d-ed3f69095c77',
    name:   'Docente Base',
    role:   ROLES.DOCENTE,
  },
  'token-estudiante-001': {
    userId: 'fdb51787-747c-4c2c-8ed7-2bc9ebc62145',
    name:   'Estudiante Base',
    role:   ROLES.ESTUDIANTE,
  },
});
