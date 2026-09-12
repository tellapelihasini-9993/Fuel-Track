# ⛽ FuelTrack — Doorstep Fuel Delivery & Operations Command Center

A zero-hidden-fee doorstep fuel delivery and central operations command platform featuring 100% Pure Java SE multi-page architecture, separated customer & station owner dashboards, live GPS tracking, IoT dispensing simulation, and a 16-slide PowerPoint presentation (`FuelTrack_Complete_Project_Presentation.pptx`).

[![Zero Hidden Fees](https://img.shields.io/badge/Platform%20Markup-₹0.00-10b981.svg)](https://github.com)
[![PESO-Ready Workflow](https://img.shields.io/badge/PESO-Ready%20Workflow-ff6b00.svg)](https://github.com)
[![100% Pure Java SE](https://img.shields.io/badge/Backend-100%25%20Pure%20Java%20SE-f59e0b.svg)](https://github.com)
[![Separated Cockpits](https://img.shields.io/badge/Architecture-Separated%20Cockpits-0ea5e9.svg)](https://github.com)

[![Zero Hidden Fees](https://img.shields.io/badge/Platform%20Markup-₹0.00-10b981.svg)](https://github.com)
[![PESO-Ready Workflow](https://img.shields.io/badge/PESO-Ready%20Workflow-ff6b00.svg)](https://github.com)
[![Full-Stack Real-Time](https://img.shields.io/badge/Tech-React%20%7C%20Node.js%20%7C%20PostgreSQL%20%7C%20Socket.IO-00f0ff.svg)](https://github.com)

**FuelTrack** is a production-grade full-stack real-time web application engineered for zero-hidden-fee on-demand doorstep fuel delivery and central operations command. Backed by a true relational PostgreSQL database with Socket.IO telemetry and 5 distinct role-based cockpits.

---

## 💎 Core Business Concept & Transparent Pricing

FuelTrack delivers certified Petrol (MS), Diesel (HSD), and CNG directly to private vehicles, logistics fleets, backup generators, agricultural harvesters, and construction machinery with **zero platform markup**.

### 📐 Deterministic Zero-Markup Formula:
$$\mathbf{Total\ Amount} = (\mathbf{Litres} \times \mathbf{Official\ Fuel\ Rate}) + \mathbf{₹50\ Flat\ Delivery\ Fee} + \mathbf{₹0\ Platform\ Markup}$$

#### Example (Standard 35L Car Top-Up):
- $35\text{ Litres} \times ₹104.21\text{ (Official Mumbai Petrol Rate)} = ₹3,647.35$
- Flat Doorstep Delivery Fee: $₹50.00$
- Platform Surge Markup: **$₹0.00$**
- **Final Payable Total = $₹3,697.35$**

> **Historical Rate Immutability**: The exact official government fuel rate active at the moment of order creation is permanently saved with the order record and never recalculates with future rate updates.

---

## 🚀 Quick Start (Single Command)

### 1. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

### 2. Run the Full-Stack Application:
```bash
npm run dev
```
- 🌐 **Frontend URL**: `http://localhost:5173` (or `http://localhost:5000`)
- 📡 **Backend API & WebSocket Server**: `http://localhost:5000`

### 3. Run Automated Test Suite:
```bash
npm test
```

---

## 👑 100% Pure Java SE Multi-Page Engine & VIP Demo Accounts

The project includes an embedded **Pure Java SE Engine (`FuelTrackApp.java`)** with completely separated web dashboards and desktop GUI, featuring **All-Inclusive VIP Demo Accounts**:

### 🌟 VIP All-Access Demo Accounts (1-Click Instant Launch)

| Demo Account | Login Email | Password | What's Included in the Demo Account |
| :--- | :--- | :--- | :--- |
| **⭐ VIP Demo Customer**<br>*(Vikram Malhotra)* | `demo@fueltrack.io` | `demo123` | • **Live In-Transit GPS Radar**: Active order `FT-ORD-2026-9901` (45L Petrol) with live moving tanker, ETA counter, driver info, and emergency cancel.<br>• **Doorstep Recurring Subscription**: 40L Petrol every Monday 07:30 AM for Mercedes GLS 450.<br>• **Fuel Spend & Savings Analytics**: 180L delivered, ₹17,842.50 spent, ₹1,250 net savings.<br>• **Complete Order History**: 4 diverse past orders with downloadable GST tax invoices & QR codes.<br>• **Direct-to-Owner Grievance Redressal**: 3 active/resolved tickets with real-time station owner notes & timestamps.<br>• **Verified Customer Reviews**: Rate deliveries and view published verified reviews. |
| **👑 Master Station Owner Demo**<br>*(Rajeshwar Singhania)* | `demo.owner@fueltrack.io` | `demo123` | • **Full Station Command Access**: Manage fuel stock, underground tank gauges, and PESO alerts.<br>• **Live Customer Grievance Desk**: Real-time customer tickets with 1-click actions (*Call Customer, Schedule Purity Retest, Approve Credit/Refund, Reroute Tanker*).<br>• **Live Fleet Telematics**: Active mobile tanker units, driver status, speed, and GPS coordinates.<br>• **Customer Satisfaction (CSAT) Wall**: Real-time customer ratings and feedback feed.<br>• **Rate Control & Settings**: Instant adjustments for rates, delivery fees, and emergency bypass. |

### 🚀 Instant Access URLs

- **Login Page with 1-Click VIP Launchers**: [http://localhost:5000/login.html](http://localhost:5000/login.html)
- **Direct VIP Customer Dashboard**: [http://localhost:5000/user-dashboard.html?demo=true](http://localhost:5000/user-dashboard.html?demo=true)
- **Direct VIP Master Owner Cockpit**: [http://localhost:5000/owner-dashboard.html?demo=true](http://localhost:5000/owner-dashboard.html?demo=true)

---

## 🛠️ Technology Architecture

- **Frontend**: React 19 with TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas / CSS Radar Grid.
- **Backend**: Node.js, Express, Socket.IO.
- **Database**: PostgreSQL (backed by `@electric-sql/pglite` embedded pure-Postgres engine for immediate zero-config setup with seamless `DATABASE_URL` / standard Postgres support).
- **Security & Validation**: JWT Authentication, bcrypt password hashing, Zod schema validation on every API endpoint.
- **Real-Time Engine**: Socket.IO WebSocket channels for GPS telemetry, order state updates, dispensing ticks, inventory deductions, and safety alerts.
- **Compliance**: PESO-ready workflow with digital density/purity test certificate reference attached to every generated invoice.

---

## 🗄️ Database Schema (17 Relational Tables)

1. `users`: Operator profiles and authentication (`customer`, `driver`, `station_owner`, `dispatcher`, `admin`).
2. `vehicles`: Saved vehicles with fuel type and tank capacities.
3. `depots`: Petro depots with coordinates and addresses.
4. `tankers`: Mobile refuelling units with telematics, coordinates, capacity, and temp readings.
5. `drivers`: Driver licensing, assignment, and ratings.
6. `fuel_tanks`: Bulk storage tanks with ultrasonic sensor statuses and $<25\%$ low-stock thresholds.
7. `fuel_rates`: Official daily government rates with zero platform markup.
8. `orders`: Order transactions with immutable snapshot of fuel rate, fee breakdown, and status.
9. `order_status_history`: Linear 6-stage lifecycle timeline.
10. `dispatches`: Tanker dispatch assignments.
11. `gps_locations`: GPS coordinate telematics history stream.
12. `dispensing_records`: IoT hardware dispensing records with flow rate and $\pm 0.01\%$ accuracy.
13. `inventory_transactions`: Double-entry depot inventory accounting ledger.
14. `payments`: Mock payment records (UPI QR, Card, POD).
15. `invoices`: Sequential tax invoices (`FT-INV-YYYY-XXXX`) with density purity certificate.
16. `safety_checks`: Emergency shut-off and SOS incident logs.
17. `audit_logs`: Immutable PESO-ready audit trail with before/after details.

---

## 📡 Main API Endpoints

- `POST /api/auth/login` - Authenticate user & issue JWT
- `POST /api/auth/register` - Create new customer profile
- `POST /api/auth/quick-login` - 1-Click zero-friction demo login for any role
- `GET /api/fuel-rates` - List official rates with zero-markup formula
- `GET /api/fuel-rates/calculate` - Calculate exact price for volume & grade
- `POST /api/orders` - Place order using server-side rate calculation
- `GET /api/orders` - Retrieve role-filtered or all orders
- `PATCH /api/orders/:id/status` - Transition delivery lifecycle state
- `POST /api/orders/:id/assign-tanker` - Assign nearest mobile tanker unit
- `GET /api/tankers` - List tankers with live GPS coordinates and speed
- `POST /api/tankers/:id/location` - Push manual/simulated GPS coordinates
- `POST /api/tankers/:id/safety-alert` - Trigger emergency SOS alert
- `GET /api/depots` - List depots with storage tank liquid levels
- `POST /api/inventory/refill` - Create bulk procurement refill batch
- `POST /api/inventory/demo-action` - Trigger demo tests (Dispense 500L, Auto Top-Up >95%, Low-Stock <25%)
- `POST /api/dispensing/start` - Connect IoT hardware nozzle
- `POST /api/dispensing/tick` - Stream live litres & amount counter (~45 L/min)
- `POST /api/dispensing/complete` - Complete dispensing, deduct inventory, generate invoice
- `GET /api/invoices/:id` - Fetch printable tax invoice with density cert
- `GET /api/dashboard/analytics` - Fetch KPI metrics and Recharts datasets
- `GET /api/audit-logs` - Query immutable PESO compliance audit trail

---

## 🧪 Testing & Verification Checklist

- [x] **Zero-Markup Formula**: Tested with 35L ($35 \times 104.21 + 50 = ₹3,697.35$) and volume limits (5L–200L).
- [x] **6-Stage Order Progression**: Verified linear lifecycle (`Order Verified` $\rightarrow$ `Tanker Assigned` $\rightarrow$ `In Transit` $\rightarrow$ `Arrived` $\rightarrow$ `Dispensing` $\rightarrow$ `Completed`).
- [x] **Real-time GPS Fleet Radar**: Simulated background broadcaster pulses location updates every 3 seconds.
- [x] **IoT Dispensing Simulator**: Calibrated $\sim 45\text{ L/min}$ flow with digital LED screen, temperature readout, and auto inventory update.
- [x] **Multi-Depot Inventory & Low-Stock Alerts**: Automatic $<25\%$ safety alert and interactive demo triggers.
- [x] **PESO Compliance & Invoicing**: Downloadable tax invoice with density cert and tamper-evident audit logs.
