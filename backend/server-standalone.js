import http from 'http';
import * as cmsService from './src/services/cmsService.js';
import * as passportService from './src/services/passportService.js';
import * as shipmentService from './src/services/shipmentService.js';
import * as auditService from './src/services/auditService.js';

const PORT = 4000;

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url;

  // 1. Health Check
  if (url === '/health' || url === '/api/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ONLINE',
      service: 'Caribbe Legal Services Backend API (Standalone)',
      timestamp: new Date().toISOString()
    }));
  }

  // 2. CMS Page Endpoint
  if (url.startsWith('/api/v1/cms/page/')) {
    const slug = url.split('/')[5] || 'inicio';
    try {
      const content = await cmsService.getPageContent(slug);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, data: content }));
    } catch (e) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  // 3. Passports GET / POST
  if (url === '/api/v1/passports') {
    if (req.method === 'GET') {
      const list = await passportService.getAllPassportApplications();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: list.length, data: list }));
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const payload = JSON.parse(body || '{}');
        const created = await passportService.createPassportApplication(payload);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, data: created }));
      });
      return;
    }
  }

  // 4. Track Cuba Shipment
  if (url.startsWith('/api/v1/shipments/track/')) {
    const trackNum = url.split('/')[5] || 'CLS-CUBA-90124';
    try {
      const shipment = await shipmentService.trackShipment(trackNum);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, data: shipment }));
    } catch (e) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Endpoint no encontrado' }));
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Backend Standalone Activo en Puerto ${PORT}`);
  console.log(`🌐 Probando: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
