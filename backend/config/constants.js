/**
 * Caribbe Legal Services - System Constants & Enums
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  NOTARIO: 'NOTARIO',
  ASISTENTE: 'ASISTENTE',
  CONTADOR: 'CONTADOR',
  CLIENTE: 'CLIENTE'
};

export const PERMISSIONS = {
  // CMS Permissions
  CMS_READ: 'cms:read',
  CMS_WRITE: 'cms:write',
  CMS_PUBLISH: 'cms:publish',

  // Passport & Notary Permissions
  PASSPORT_READ: 'passport:read',
  PASSPORT_WRITE: 'passport:write',
  PASSPORT_UPDATE_STATUS: 'passport:update_status',

  // Appointments Permissions
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_WRITE: 'appointments:write',
  APPOINTMENTS_DELETE: 'appointments:delete',

  // Shipments Permissions
  SHIPMENTS_READ: 'shipments:read',
  SHIPMENTS_WRITE: 'shipments:write',
  SHIPMENTS_TRACK: 'shipments:track',

  // Finance Permissions
  FINANCE_READ: 'finance:read',
  FINANCE_WRITE: 'finance:write',
  FINANCE_REPORTS: 'finance:reports',

  // Security & Audit Logs
  SECURITY_AUDIT: 'security:audit',
  SECURITY_ROLES: 'security:roles'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.NOTARIO]: [
    PERMISSIONS.CMS_READ,
    PERMISSIONS.PASSPORT_READ,
    PERMISSIONS.PASSPORT_WRITE,
    PERMISSIONS.PASSPORT_UPDATE_STATUS,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.SHIPMENTS_READ,
    PERMISSIONS.SHIPMENTS_WRITE,
    PERMISSIONS.FINANCE_READ
  ],
  [ROLES.ASISTENTE]: [
    PERMISSIONS.CMS_READ,
    PERMISSIONS.PASSPORT_READ,
    PERMISSIONS.PASSPORT_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.SHIPMENTS_READ,
    PERMISSIONS.SHIPMENTS_WRITE
  ],
  [ROLES.CONTADOR]: [
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.FINANCE_REPORTS
  ],
  [ROLES.CLIENTE]: [
    PERMISSIONS.CMS_READ
  ]
};

export const PASSPORT_STATUSES = {
  RECIBIDO: 'Recibido',
  EN_REVISION: 'En Revisión Notarial',
  CONFECCIONADO: 'Confeccionado',
  ENVIADO_CONSULADO: 'Enviado a Consulado',
  LISTO_PARA_RECOGER: 'Listo para Recoger',
  ENTREGADO: 'Entregado'
};
