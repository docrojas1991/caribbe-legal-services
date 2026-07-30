import { saveAuditLog } from '../services/auditService.js';

export function auditLogger(actionDescription) {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;
      res.send(body);

      // Perform non-blocking background audit log recording
      saveAuditLog({
        userId: req.user ? req.user.id : 'ANONYMOUS',
        userName: req.user ? req.user.name : 'Invitado',
        role: req.user ? req.user.role : 'GUEST',
        action: actionDescription || `${req.method} ${req.originalUrl}`,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      }).catch(err => console.error("Audit Log Error:", err));
    };

    next();
  };
}
