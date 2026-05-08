export const ROLES = Object.freeze({
  ADMIN:      'ADMIN',
  DOCENTE:    'DOCENTE',
  ESTUDIANTE: 'ESTUDIANTE',
});

export const MIN_PASSING_SCORE = 60;

export const MOCK_TOKENS = Object.freeze({
  'token-admin-001':      { userId: 'usr-001', name: 'Admin Root',       role: ROLES.ADMIN },
  'token-docente-001':    { userId: 'usr-002', name: 'Prof. García',     role: ROLES.DOCENTE },
  'token-estudiante-001': { userId: 'usr-003', name: 'Juan Estudiante',  role: ROLES.ESTUDIANTE },
  'token-estudiante-002': { userId: 'usr-004', name: 'María López',      role: ROLES.ESTUDIANTE },
});
