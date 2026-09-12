import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import { initDatabase } from './db';
import { initSocketIO } from './services/socketService';
import { startGpsSimulator } from './services/gpsSimulator';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth';
import fuelRatesRoutes from './routes/fuelRates';
import ordersRoutes from './routes/orders';
import tankersRoutes from './routes/tankers';
import depotsRoutes from './routes/depots';
import dispensingRoutes from './routes/dispensing';
import paymentsRoutes from './routes/payments';
import invoicesRoutes from './routes/invoices';
import analyticsRoutes from './routes/analytics';
import auditRoutes from './routes/audit';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '5000', 10);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Real-time WebSocket Server
initSocketIO(server);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/fuel-rates', fuelRatesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/tankers', tankersRoutes);
app.use('/api/depots', depotsRoutes);
app.use('/api/inventory', depotsRoutes);
app.use('/api/dispensing', dispensingRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/dashboard/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'FuelTrack Doorstep Logistics Core',
    timestamp: new Date().toISOString(),
    zeroMarkupFormula: 'Total = (Litres × Official Rate) + ₹50 Delivery Fee + ₹0 Platform Markup'
  });
});

// Serve frontend in production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA Fallback Handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('FuelTrack API Server is running. Vite Dev Server is available at http://localhost:5173');
    }
  });
});

// Global Error Handler
app.use(errorHandler);

// Boot function
export async function startServer() {
  try {
    await initDatabase();
    startGpsSimulator();

    server.listen(PORT, () => {
      console.log(`\n=======================================================`);
      console.log(`🚀 FuelTrack Real-Time Operations Core is LIVE!`);
      console.log(`📡 Backend API: http://localhost:${PORT}`);
      console.log(`⚡ WebSocket & Telematics Radar: Active on port ${PORT}`);
      console.log(`💰 Pricing Formula: Litres × Official Rate + ₹50 Fee + ₹0 Markup`);
      console.log(`=======================================================\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start FuelTrack backend:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export { app, server };
