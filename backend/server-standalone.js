import http from 'http';
import * as cmsService from './src/services/cmsService.js';
import * as shipmentService from './src/services/shipmentService.js';
import * as dbStore from './src/services/dbStoreService.js';

const PORT = 8090;

const server = http.createServer(async (req, res) => {
  // CORS Headers for cross-origin sync across any port or file protocol
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
      service: 'Caribbe Legal Services Backend API (Disk Store Sync)',
      timestamp: new Date().toISOString()
    }));
  }

  // 2. Full Dashboard Sync Endpoint
  if (url === '/api/v1/dashboard') {
    const data = dbStore.getFullDashboard();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, data }));
  }

  // 3. Appointments GET & POST (/api/v1/citas)
  if (url === '/api/v1/citas') {
    if (req.method === 'GET') {
      const list = dbStore.getAppointments();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: list.length, data: list }));
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const saved = dbStore.saveAppointment(payload);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, data: saved }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }
  }

  // 4. Passports GET & POST (/api/v1/pasaportes and /api/v1/passports)
  if (url === '/api/v1/pasaportes' || url === '/api/v1/passports') {
    if (req.method === 'GET') {
      const list = dbStore.getPassportApplications();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: list.length, data: list }));
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const saved = dbStore.savePassportApplication(payload);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, data: saved }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }
  }

  // 5. CMS Page Endpoint
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

  // 6. Track Cuba Shipment
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

server.listen(PORT, '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Backend Standalone Activo en Puerto ${PORT}`);
  console.log(`🌐 Dashboard Sync: http://localhost:${PORT}/api/v1/dashboard`);
  console.log(`====================================================`);
});
