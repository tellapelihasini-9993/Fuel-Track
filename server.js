/**
 * ============================================================================
 * FuelTrack — Zero-Hidden-Fee Doorstep Fuel Delivery & Operations Center
 * Pure Node.js / Express Localhost Web Server
 * Serves: Login Portal • Customer Portal • Station Owner Cockpit • REST APIs
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const DEFAULT_PORT = 5000;
const FALLBACK_PORT = 8080;

app.use(cors());
app.use(express.json());

// In-Memory Real-Time Seed Database
const FUEL_RATES = [
  { id: 'rate-mum-petrol', city: 'Mumbai', fuelType: 'PETROL', ratePerLitre: 104.21, deliveryFee: 50.00, platformMarkup: 0.00, effectiveDate: '2026-09-13' },
  { id: 'rate-mum-diesel', city: 'Mumbai', fuelType: 'DIESEL', ratePerLitre: 92.15, deliveryFee: 50.00, platformMarkup: 0.00, effectiveDate: '2026-09-13' },
  { id: 'rate-mum-cng', city: 'Mumbai', fuelType: 'CNG', ratePerLitre: 86.50, deliveryFee: 50.00, platformMarkup: 0.00, effectiveDate: '2026-09-13' },
  { id: 'rate-pun-petrol', city: 'Pune', fuelType: 'PETROL', ratePerLitre: 103.95, deliveryFee: 50.00, platformMarkup: 0.00, effectiveDate: '2026-09-13' },
  { id: 'rate-pun-diesel', city: 'Pune', fuelType: 'DIESEL', ratePerLitre: 91.80, deliveryFee: 50.00, platformMarkup: 0.00, effectiveDate: '2026-09-13' },
  { id: 'rate-pun-cng', city: 'Pune', fuelType: 'CNG', ratePerLitre: 85.90, deliveryFee: 50.00, platformMarkup: 0.00, effectiveDate: '2026-09-13' }
];

const TANKERS = [
  { id: 'tnk-101', code: 'TK-101', name: 'TK-101 Mumbai Express', fuelType: 'DIESEL', capacityLitres: 4000, currentLitres: 3450, status: 'AVAILABLE', speedKmh: 0.0, latitude: 19.0820, longitude: 72.8830, currentZone: 'BKC Standby', etaMinutes: 0, tankTempC: 24.2, nozzleCalibrationPct: 99.99, driverId: 'usr-driv-01', depotId: 'depot-01' },
  { id: 'tnk-102', code: 'TK-102', name: 'TK-102 Pune Fleet', fuelType: 'PETROL', capacityLitres: 3500, currentLitres: 2800, status: 'IN_TRANSIT', speedKmh: 42.5, latitude: 18.5310, longitude: 73.8640, currentZone: 'Viman Nagar', etaMinutes: 14, tankTempC: 23.8, nozzleCalibrationPct: 99.98, driverId: 'usr-driv-01', depotId: 'depot-02' },
  { id: 'tnk-103', code: 'TK-103', name: 'TK-103 Highway Unit', fuelType: 'DIESEL', capacityLitres: 5000, currentLitres: 4200, status: 'AVAILABLE', speedKmh: 0.0, latitude: 19.1100, longitude: 72.9100, currentZone: 'Eastern Express', etaMinutes: 0, tankTempC: 24.5, nozzleCalibrationPct: 100.00, driverId: null, depotId: 'depot-01' }
];

const FUEL_TANKS = [
  { id: 'tank-mum-petrol', depotId: 'depot-01', fuelType: 'PETROL', maxCapacityLitres: 10000, currentQuantityLitres: 8450, minThresholdPct: 25.0, ullageLitres: 8450, status: 'ONLINE', lastAuditedAt: '2026-09-13 10:00' },
  { id: 'tank-mum-diesel', depotId: 'depot-01', fuelType: 'DIESEL', maxCapacityLitres: 15000, currentQuantityLitres: 12800, minThresholdPct: 25.0, ullageLitres: 12800, status: 'ONLINE', lastAuditedAt: '2026-09-13 11:30' },
  { id: 'tank-mum-cng', depotId: 'depot-01', fuelType: 'CNG', maxCapacityLitres: 8000, currentQuantityLitres: 6200, minThresholdPct: 25.0, ullageLitres: 6200, status: 'ONLINE', lastAuditedAt: '2026-09-13 09:15' },
  { id: 'tank-pun-diesel', depotId: 'depot-02', fuelType: 'DIESEL', maxCapacityLitres: 15000, currentQuantityLitres: 11400, minThresholdPct: 25.0, ullageLitres: 11400, status: 'ONLINE', lastAuditedAt: '2026-09-13 14:00' }
];

const DEPOTS = [
  { id: 'depot-01', name: 'Mumbai Central Hub', code: 'DEP-MUM-01', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777, address: 'Plot 42, Sion Petro Zone, Mumbai 400022' },
  { id: 'depot-02', name: 'Pune Fleet Terminal', code: 'DEP-PUN-01', city: 'Pune', latitude: 18.5204, longitude: 73.8567, address: 'Sector 18, Hadapsar Industrial Area, Pune 411028' }
];

const ORDERS = [
  { id: 'ord-1001', orderNumber: 'FT-ORD-2026-1001', customerId: 'usr-cust-01', depotId: 'depot-01', tankerId: 'tnk-101', driverId: 'usr-driv-01', fuelType: 'PETROL', quantityLitres: 35.0, fuelRateAtOrder: 104.21, fuelSubtotal: 3647.35, deliveryFee: 50.00, platformMarkup: 0.00, totalAmount: 3697.35, status: 'DISPATCHED', deliveryAddress: 'Flat 402, Palms Residency, Bandra West, Mumbai', vehiclePreset: 'CAR', vehicleRegNumber: 'MH-02-DZ-4040', estimatedDeliveryMinutes: 14, paymentMethod: 'UPI', paymentStatus: 'PAID', createdAt: '2026-09-13 15:00:00' },
  { id: 'ord-1002', orderNumber: 'FT-ORD-2026-1002', customerId: 'usr-demo-cust', depotId: 'depot-01', tankerId: 'tnk-102', driverId: 'usr-driv-01', fuelType: 'PETROL', quantityLitres: 45.0, fuelRateAtOrder: 104.21, fuelSubtotal: 4689.45, deliveryFee: 50.00, platformMarkup: 0.00, totalAmount: 4739.45, status: 'DISPATCHED', deliveryAddress: 'Penthouse 12B, Lodha Bellissimo, Mahalaxmi, Mumbai', vehiclePreset: 'LUXURY_CAR', vehicleRegNumber: 'MH-01-VIP-7777', estimatedDeliveryMinutes: 9, paymentMethod: 'UPI', paymentStatus: 'PAID', createdAt: '2026-09-13 15:30:00' }
];

const INVOICES = [
  { id: 'inv-1001', invoiceNumber: 'FT-INV-2026-001001', orderId: 'ord-1001', customerName: 'Ananya Deshmukh', customerAddress: 'Flat 402, Palms Residency, Bandra West, Mumbai', customerPhone: '+91 98201 12345', fuelType: 'PETROL', quantityRequested: 35.0, quantityDelivered: 35.0, ratePerLitre: 104.21, fuelSubtotal: 3647.35, deliveryFee: 50.00, platformMarkup: 0.00, totalAmount: 3697.35, tankerCode: 'TK-101', densityCertificateRef: 'PESO-CERT-MUM-2026-8831 (742.8 kg/m³ @ 15°C)', qrCodePayload: 'FT-QR-VERIFY:FT-ORD-2026-1001:TOTAL3697.35', status: 'PAID', deliveryTimestamp: '2026-09-13 15:00:00', createdAt: '2026-09-13 15:00:00' }
];

const COMPLAINTS = [
  { id: 'tkt-8812', ticketNumber: 'FT-TKT-2026-8812', customerId: 'usr-cust-01', customerName: 'Ananya Deshmukh', customerPhone: '+91 98201 12345', category: 'Density Verification', description: 'Requested secondary density retest on Flat 402 delivery to cross-verify temperature compensation.', priority: 'HIGH', status: 'INVESTIGATING', resolutionNotes: 'Inspector Rajesh Kumar assigned with portable hydrometer.', createdAt: '2026-09-13 14:30' },
  { id: 'tkt-8824', ticketNumber: 'FT-TKT-2026-8824', customerId: 'usr-cust-01', customerName: 'Rahul Sharma', customerPhone: '+91 98200 88219', category: 'Meter Dispute', description: 'Nozzle auto-cutoff occurred early at 34.2L instead of 35L. Inquired about ₹83.36 refund credit.', priority: 'MEDIUM', status: 'OPEN', resolutionNotes: 'Awaiting owner resolution.', createdAt: '2026-09-13 15:10' }
];

const FEEDBACKS = [
  { id: 'fb-01', orderNumber: 'FT-ORD-2026-1001', customerName: 'Ananya Deshmukh', rating: 5, driverName: 'Rajesh Kumar (TK-101)', comment: 'Super fast doorstep delivery! Rajesh showed me the PESO seal before opening the nozzle. Exactly 35.0 Litres dispensed with zero odor.', createdAt: '2026-09-13 15:20' }
];

const AUDIT_LOGS = [
  { id: 'aud-1', userId: 'system', action: 'SYSTEM_STARTUP', targetType: 'engine', targetId: 'all', details: 'Node.js Localhost Web Engine initialized with User, Owner & VIP Demo accounts', ipAddress: '127.0.0.1', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) }
];

// Telematics loop
setInterval(() => {
  TANKERS.forEach(t => {
    if (t.status === 'IN_TRANSIT') {
      t.speedKmh = Math.round((38.0 + Math.random() * 8.0) * 10) / 10;
      if (t.etaMinutes > 1) t.etaMinutes -= 1;
    }
    t.tankTempC = Math.round((24.0 + Math.random() * 1.0) * 10) / 10;
  });
}, 2000);

// Root redirect to Login Portal
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Dedicated Short Route Aliases
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/user', (req, res) => res.sendFile(path.join(__dirname, 'user-dashboard.html')));
app.get('/owner', (req, res) => res.sendFile(path.join(__dirname, 'owner-dashboard.html')));
app.get('/landing', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// REST API Endpoints
app.get(['/api/fuel-rates', '/api/rates'], (req, res) => res.json(FUEL_RATES));
app.get('/api/tankers', (req, res) => res.json(TANKERS));
app.get('/api/orders', (req, res) => res.json(ORDERS));
app.get('/api/invoices', (req, res) => res.json(INVOICES));
app.get('/api/complaints', (req, res) => res.json(COMPLAINTS));
app.get('/api/feedback', (req, res) => res.json(FEEDBACKS));
app.get(['/api/fuel-tanks', '/api/tanks'], (req, res) => res.json(FUEL_TANKS));
app.get('/api/depots', (req, res) => res.json(DEPOTS));
app.get('/api/audit-logs', (req, res) => res.json(AUDIT_LOGS));

// Static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// Guaranteed Browser Opener
function openSystemBrowser(url) {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  setTimeout(() => {
    if (isWin) {
      exec(`rundll32 url.dll,FileProtocolHandler "${url}"`, (err) => {
        if (err) exec(`powershell -NoProfile -Command "Start-Process '${url}'"`);
      });
    } else if (isMac) {
      exec(`open "${url}"`);
    } else {
      exec(`xdg-open "${url}"`);
    }
  }, 400);
}

// Start Server with Port Fallback
function startServer(port) {
  const server = app.listen(port, () => {
    console.log('============================================================================');
    console.log(`  FuelTrack Localhost Web Engine LIVE at: http://localhost:${port}`);
    console.log('============================================================================');
    console.log(`  [1] Login Portal:       http://localhost:${port}/login.html`);
    console.log(`  [2] Customer Dashboard: http://localhost:${port}/user-dashboard.html?demo=true`);
    console.log(`  [3] Station Owner Hub:  http://localhost:${port}/owner-dashboard.html?demo=true`);
    console.log(`  [4] Main Landing Page:  http://localhost:${port}/index.html`);
    console.log('============================================================================');
    console.log(`  >> Opening your default browser to: http://localhost:${port}/login.html ...`);
    console.log('============================================================================');

    openSystemBrowser(`http://localhost:${port}/login.html`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port === DEFAULT_PORT) {
      console.log(`Notice: Port ${DEFAULT_PORT} is in use. Falling back to port ${FALLBACK_PORT}...`);
      startServer(FALLBACK_PORT);
    } else {
      console.error('Server failed to start:', err.message);
    }
  });
}

startServer(DEFAULT_PORT);
