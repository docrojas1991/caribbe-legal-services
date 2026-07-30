import { ROLE_PERMISSIONS } from '../../config/constants.js';

export function authorizePermissions(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Rol de usuario no identificado.'
      });
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado. El rol '${userRole}' no posee los permisos suficientes (${requiredPermissions.join(', ')}).`
      });
    }

    next();
  };
}
