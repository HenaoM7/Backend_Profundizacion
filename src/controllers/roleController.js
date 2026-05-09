import { listRoles } from '../services/roleService.js';

export const listAvailableRoles = async (req, res, next) => {
  try {
    const roles = await listRoles(req.auth.roles || []);
    return res.status(200).json({ roles });
  } catch (error) {
    return next(error);
  }
};