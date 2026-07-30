import express from 'express';

// Middlewares
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizePermissions } from '../middlewares/rbacMiddleware.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { PERMISSIONS } from '../../config/constants.js';

// Services & Controllers
import * as cmsController from '../controllers/cmsController.js';
import * as passportService from '../services/passportService.js';
import * as shipmentService from '../services/shipmentService.js';
import * as integrationService from '../services/integrationService.js';
import * as auditService from '../services/auditService.js';

const router = express.Router();

// ----------------------------------------------------
// A. AUTENTICACIÓN
// ----------------------------------------------------
router.post('/auth/login', auditLogger('Inicio de sesión notarial'), (req, res) => {
  const { email, password } = req.body;
  if (password === 'notaria2026' || password.length >= 6) {
    res.json({
      success: true,
      token: 'jwt_token_example_caribbe_legal_services_2026',
      user: {
        id: 'usr_alianet',
        name: 'Lic. Alianet Roque Garcia',
        email: email || 'notarias@caribbelegalservices.com',
        role: 'NOTARIO'
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
  }
});

// ----------------------------------------------------
// B. CMS (MOTOR DE CONTENIDOS DINÁMICOS)
// ----------------------------------------------------
router.get('/cms/page/:slug', cmsController.getPage);
router.put('/cms/page/:slug', authenticateToken, authorizePermissions(PERMISSIONS.CMS_WRITE), auditLogger('Edición de contenido CMS'), cmsController.updatePage);
router.post('/cms/page/:slug/section', authenticateToken, authorizePermissions(PERMISSIONS.CMS_WRITE), cmsController.addSection);
router.get('/cms/page/:slug/versions', authenticateToken, cmsController.getVersions);

// ----------------------------------------------------
// C. PASAPORTES & EXPEDIENTES CONSULARES
// ----------------------------------------------------
router.post('/passports', auditLogger('Creación de expediente de pasaporte'), async (req, res) => {
  try {
    const result = await passportService.createPassportApplication(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/passports', authenticateToken, authorizePermissions(PERMISSIONS.PASSPORT_READ), async (req, res) => {
  try {
    const list = await passportService.getAllPassportApplications(req.query);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/passports/:refNumber', async (req, res) => {
  try {
    const result = await passportService.getPassportApplicationByRef(req.params.refNumber);
    if (!result) return res.status(404).json({ success: false, error: 'Expediente no encontrado.' });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/passports/:refNumber/status', authenticateToken, authorizePermissions(PERMISSIONS.PASSPORT_UPDATE_STATUS), auditLogger('Actualización de estado de pasaporte'), async (req, res) => {
  try {
    const updated = await passportService.updatePassportStatus(req.params.refNumber, req.body.status);
    res.json({ success: true, message: 'Estado notarial actualizado.', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// D. ENVÍOS A CUBA
// ----------------------------------------------------
router.post('/shipments', authenticateToken, authorizePermissions(PERMISSIONS.SHIPMENTS_WRITE), auditLogger('Registro de paquete a Cuba'), async (req, res) => {
  try {
    const result = await shipmentService.createShipment(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/shipments/track/:trackingNumber', async (req, res) => {
  try {
    const result = await shipmentService.trackShipment(req.params.trackingNumber);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// E. INTEGRACIONES EXTERNAS (STRIPE, WHATSAPP, USPS)
// ----------------------------------------------------
router.post('/integrations/stripe/charge', authenticateToken, async (req, res) => {
  const { amountUSD, paymentMethodId } = req.body;
  const result = await integrationService.processStripePayment(amountUSD, 'usd', paymentMethodId);
  res.json({ success: true, data: result });
});

router.post('/integrations/whatsapp/send', authenticateToken, async (req, res) => {
  const { phone, text } = req.body;
  const result = await integrationService.sendWhatsAppNotification(phone, text);
  res.json({ success: true, data: result });
});

// ----------------------------------------------------
// F. AUDITORÍA & LOGS DE SEGURIDAD
// ----------------------------------------------------
router.get('/security/audit-logs', authenticateToken, authorizePermissions(PERMISSIONS.SECURITY_AUDIT), async (req, res) => {
  const logs = await auditService.getAuditLogs(req.query);
  res.json({ success: true, count: logs.length, data: logs });
});

export default router;
