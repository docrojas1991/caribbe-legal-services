import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import apiRouter from './src/routes/apiRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting Policy: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Demasiadas solicitudes enviadas desde esta dirección IP. Intente de nuevo en 15 minutos.'
  }
});

app.use('/api', apiLimiter);

// Mount Master REST API Router
app.use('/api/v1', apiRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Caribbe Legal Services Enterprise Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Error no controlado en servidor Backend:", err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor.',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Caribbe Legal Services Enterprise Backend Activo`);
  console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
