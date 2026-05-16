import crypto from 'node:crypto';

export const generateEntityId = (prefix) => {
  return crypto.randomUUID();
};