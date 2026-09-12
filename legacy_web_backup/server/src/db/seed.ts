import { PGlite } from '@electric-sql/pglite';
import bcrypt from 'bcryptjs';

export async function runSeed(db: PGlite): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Insert 5 Demo Users (one for each role) + extra drivers/customers
  await db.query(`
    INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
    ('usr-cust-01', 'Rahul Sharma', 'customer@fueltrack.io', $1, 'customer', '+91 98201 12345'),
    ('usr-driv-01', 'Vikram Singh', 'driver@fueltrack.io', $1, 'driver', '+91 98202 23456'),
    ('usr-stat-01', 'Anand Kulkarni', 'owner@fueltrack.io', $1, 'station_owner', '+91 98203 34567'),
    ('usr-disp-01', 'Priya Deshmukh', 'dispatcher@fueltrack.io', $1, 'dispatcher', '+91 98204 45678'),
    ('usr-admn-01', 'Super Administrator', 'admin@fueltrack.io', $1, 'admin', '+91 98205 56789'),
    ('usr-cust-02', 'Tata Logistics Fleet Mgr', 'fleet@tatamove.com', $1, 'customer', '+91 98206 67890'),
    ('usr-driv-02', 'Ramesh Jadhav', 'ramesh.driver@fueltrack.io', $1, 'driver', '+91 98207 78901')
    ON CONFLICT (id) DO NOTHING;
  `, [passwordHash]);

  // 2. Insert Depots
  await db.query(`
    INSERT INTO depots (id, name, code, city, latitude, longitude, address) VALUES
    ('depot-01', 'Mumbai Central Hub', 'DEP-MUM-01', 'Mumbai', 19.0760, 72.8777, 'Plot 42, Sion Petro Zone, Mumbai, Maharashtra 400022'),
    ('depot-02', 'Pune Fleet Terminal', 'DEP-PUN-01', 'Pune', 18.5204, 73.8567, 'Sector 18, Hadapsar Industrial Area, Pune, Maharashtra 411028')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 3. Insert 4 Tankers
  await db.query(`
    INSERT INTO tankers (id, code, name, fuel_type, capacity_litres, current_litres, status, speed_kmh, latitude, longitude, destination, eta_minutes, tank_temp_c, nozzle_calibration_pct, driver_id, depot_id) VALUES
    ('tnk-101', 'TK-101', 'TK-101 Mumbai Express', 'DIESEL', 4000.00, 3450.00, 'AVAILABLE', 0.00, 19.0820, 72.8830, 'BKC Tech Hub Standby DG', 0, 24.20, 99.99, 'usr-driv-01', 'depot-01'),
    ('tnk-102', 'TK-102', 'TK-102 Pune Fleet', 'PETROL', 3500.00, 2800.00, 'AVAILABLE', 0.00, 18.5310, 73.8640, 'Viman Nagar Residential Cluster', 0, 23.80, 99.99, 'usr-driv-02', 'depot-02'),
    ('tnk-103', 'TK-103', 'TK-103 Highway Unit', 'DIESEL', 5000.00, 4200.00, 'AVAILABLE', 0.00, 19.1100, 72.9100, 'Eastern Express Highway Fleet Yard', 0, 24.50, 99.98, NULL, 'depot-01'),
    ('tnk-104', 'TK-104', 'TK-104 Depot HQ', 'CNG', 3000.00, 2400.00, 'AVAILABLE', 0.00, 19.0700, 72.8600, 'Bandra Kurla Standby', 0, 22.90, 100.00, NULL, 'depot-01')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 4. Insert Driver Profiles
  await db.query(`
    INSERT INTO drivers (id, user_id, license_number, status, assigned_tanker_id, rating) VALUES
    ('drv-01', 'usr-driv-01', 'MH-03-2018009941', 'ACTIVE', 'tnk-101', 4.98),
    ('drv-02', 'usr-driv-02', 'MH-12-2020008812', 'ACTIVE', 'tnk-102', 4.92)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 5. Insert Depot Fuel Storage Tanks
  await db.query(`
    INSERT INTO fuel_tanks (id, depot_id, fuel_type, max_capacity_litres, current_quantity_litres, min_safety_threshold_pct, last_sensor_reading, sensor_status, last_refill_at) VALUES
    ('tank-mum-petrol', 'depot-01', 'PETROL', 10000.00, 8450.00, 25.00, 8450.00, 'ONLINE', NOW() - INTERVAL '2 days'),
    ('tank-mum-diesel', 'depot-01', 'DIESEL', 15000.00, 12800.00, 25.00, 12800.00, 'ONLINE', NOW() - INTERVAL '1 day'),
    ('tank-mum-cng', 'depot-01', 'CNG', 8000.00, 6200.00, 25.00, 6200.00, 'ONLINE', NOW() - INTERVAL '3 days'),
    ('tank-pun-diesel', 'depot-02', 'DIESEL', 15000.00, 11400.00, 25.00, 11400.00, 'ONLINE', NOW() - INTERVAL '2 days')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 6. Insert Official Fuel Rates (Zero Platform Markup Guaranteed)
  await db.query(`
    INSERT INTO fuel_rates (id, city, fuel_type, rate_per_litre, delivery_fee, platform_markup, effective_date) VALUES
    ('rate-mum-petrol', 'Mumbai', 'PETROL', 104.21, 50.00, 0.00, CURRENT_DATE),
    ('rate-mum-diesel', 'Mumbai', 'DIESEL', 92.15, 50.00, 0.00, CURRENT_DATE),
    ('rate-mum-cng', 'Mumbai', 'CNG', 86.50, 50.00, 0.00, CURRENT_DATE),
    ('rate-pun-petrol', 'Pune', 'PETROL', 103.95, 50.00, 0.00, CURRENT_DATE),
    ('rate-pun-diesel', 'Pune', 'DIESEL', 91.80, 50.00, 0.00, CURRENT_DATE),
    ('rate-pun-cng', 'Pune', 'CNG', 85.90, 50.00, 0.00, CURRENT_DATE)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 7. Insert Customer Vehicles
  await db.query(`
    INSERT INTO vehicles (id, user_id, vehicle_type, reg_number, fuel_type, tank_capacity_litres) VALUES
    ('veh-01', 'usr-cust-01', 'CAR', 'MH-02-DZ-4040', 'PETROL', 45.00),
    ('veh-02', 'usr-cust-01', 'BIKE', 'MH-01-BK-8822', 'PETROL', 12.00),
    ('veh-03', 'usr-cust-02', 'COMMERCIAL_FLEET', 'MH-04-TR-9000', 'DIESEL', 120.00)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 8. Sample Past Completed Order with Invoice & Pricing Record
  // 35 Litres * 104.21 = 3,647.35 + 50.00 fee + 0.00 markup = 3,697.35
  await db.query(`
    INSERT INTO orders (
      id, order_number, customer_id, depot_id, tanker_id, driver_id, fuel_type,
      quantity_litres, fuel_rate_at_order, fuel_subtotal, delivery_fee, platform_markup,
      total_amount, status, delivery_address, latitude, longitude, vehicle_preset,
      vehicle_reg_number, estimated_delivery_minutes, payment_method, payment_status, created_at, updated_at
    ) VALUES (
      'ord-past-01', 'FT-ORD-2026-1001', 'usr-cust-01', 'depot-01', 'tnk-101', 'usr-driv-01', 'PETROL',
      35.00, 104.21, 3647.35, 50.00, 0.00,
      3697.35, 'COMPLETED', 'Flat 402, Palms Residency, Bandra West, Mumbai 400050',
      19.0596, 72.8295, 'CAR', 'MH-02-DZ-4040', 0, 'UPI', 'COMPLETED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ) ON CONFLICT (id) DO NOTHING;
  `);

  // 9. Order Status History for past order
  await db.query(`
    INSERT INTO order_status_history (id, order_id, status, notes, created_by_user_id, created_at) VALUES
    ('osh-01', 'ord-past-01', 'ORDER_VERIFIED', 'Payment verified via UPI. Rate locked at ₹104.21/L', 'usr-cust-01', NOW() - INTERVAL '1 day' - INTERVAL '40 minutes'),
    ('osh-02', 'ord-past-01', 'TANKER_ASSIGNED', 'Tanker TK-101 assigned by Dispatcher', 'usr-disp-01', NOW() - INTERVAL '1 day' - INTERVAL '35 minutes'),
    ('osh-03', 'ord-past-01', 'IN_TRANSIT', 'Driver Vikram Singh en route', 'usr-driv-01', NOW() - INTERVAL '1 day' - INTERVAL '30 minutes'),
    ('osh-04', 'ord-past-01', 'ARRIVED', 'Tanker arrived at Bandra West location', 'usr-driv-01', NOW() - INTERVAL '1 day' - INTERVAL '10 minutes'),
    ('osh-05', 'ord-past-01', 'DISPENSING', 'IoT nozzle connected. Calibrated 45.2 L/min flow', 'usr-driv-01', NOW() - INTERVAL '1 day' - INTERVAL '8 minutes'),
    ('osh-06', 'ord-past-01', 'COMPLETED', '35.00L dispensed. Density certificate verified: 742 kg/m³', 'usr-driv-01', NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 10. Sample Invoice for past order
  await db.query(`
    INSERT INTO invoices (
      id, invoice_number, order_id, customer_name, customer_address, customer_phone,
      fuel_type, quantity_requested, quantity_delivered, rate_per_litre,
      fuel_subtotal, delivery_fee, platform_markup, total_amount, tanker_code,
      density_certificate_ref, qr_code_payload, status, delivery_timestamp, created_at
    ) VALUES (
      'inv-01', 'FT-INV-2026-0001', 'ord-past-01', 'Rahul Sharma',
      'Flat 402, Palms Residency, Bandra West, Mumbai 400050', '+91 98201 12345',
      'PETROL', 35.00, 35.00, 104.21,
      3647.35, 50.00, 0.00, 3697.35, 'TK-101',
      'PESO-CERT-MUM-2026-8831 (Density: 742.8 kg/m³ @ 15°C)',
      'FT-QR-VERIFY:ORD-1001:RATE104.21:DEL50:MARKUP0:TOTAL3697.35',
      'PAID', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ) ON CONFLICT (id) DO NOTHING;
  `);

  // 11. Sample Inventory Transaction
  await db.query(`
    INSERT INTO inventory_transactions (
      id, fuel_tank_id, transaction_type, quantity_litres, balance_after_litres, order_id, reference_note, created_at
    ) VALUES (
      'inv-tx-01', 'tank-mum-petrol', 'DISPENSE', 35.00, 8450.00, 'ord-past-01', 'Order FT-ORD-2026-1001 fulfilled by TK-101', NOW() - INTERVAL '1 day'
    ) ON CONFLICT (id) DO NOTHING;
  `);

  // 12. Sample Audit Logs
  await db.query(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details_json, ip_address, created_at) VALUES
    ('aud-01', 'usr-cust-01', 'ORDER_CREATED', 'order', 'ord-past-01', '{"litres": 35, "rate": 104.21, "fee": 50, "markup": 0, "total": 3697.35}', '127.0.0.1', NOW() - INTERVAL '1 day' - INTERVAL '45 minutes'),
    ('aud-02', 'usr-disp-01', 'TANKER_ASSIGNED', 'tanker', 'tnk-101', '{"order_id": "ord-past-01", "tanker": "TK-101 Mumbai Express"}', '127.0.0.1', NOW() - INTERVAL '1 day' - INTERVAL '35 minutes'),
    ('aud-03', 'usr-driv-01', 'DISPENSING_COMPLETED', 'order', 'ord-past-01', '{"dispensed_litres": 35.0, "density_cert": "PESO-CERT-MUM-2026-8831"}', '127.0.0.1', NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;
  `);
}
