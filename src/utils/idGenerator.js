import crypto from 'node:crypto';

export const generateEntityId = (prefix) => {
  return `${prefix}${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
};