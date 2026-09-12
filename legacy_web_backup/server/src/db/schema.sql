-- FuelTrack Relational PostgreSQL Database Schema
-- Supports all 17 core operational and compliance entities

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'driver', 'station_owner', 'dispatcher', 'admin')),
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles / Machinery Presets
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(50) NOT NULL,
  reg_number VARCHAR(100),
  fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL', 'CNG')),
  tank_capacity_litres NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Depots Table
CREATE TABLE IF NOT EXISTS depots (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tankers Table
CREATE TABLE IF NOT EXISTS tankers (
  id TEXT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL', 'CNG')),
  capacity_litres NUMERIC(10, 2) NOT NULL,
  current_litres NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'ARRIVED', 'DISPENSING', 'RETURNING_TO_DEPOT', 'OFFLINE')),
  speed_kmh NUMERIC(6, 2) DEFAULT 0.00,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  destination TEXT,
  eta_minutes INTEGER DEFAULT 0,
  tank_temp_c NUMERIC(5, 2) DEFAULT 24.20,
  nozzle_calibration_pct NUMERIC(5, 2) DEFAULT 99.99,
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  depot_id TEXT REFERENCES depots(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  assigned_tanker_id TEXT REFERENCES tankers(id) ON DELETE SET NULL,
  rating NUMERIC(3, 2) DEFAULT 4.95,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fuel Tanks (Depot Storage)
CREATE TABLE IF NOT EXISTS fuel_tanks (
  id TEXT PRIMARY KEY,
  depot_id TEXT REFERENCES depots(id) ON DELETE CASCADE,
  fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL', 'CNG')),
  max_capacity_litres NUMERIC(12, 2) NOT NULL,
  current_quantity_litres NUMERIC(12, 2) NOT NULL,
  min_safety_threshold_pct NUMERIC(5, 2) DEFAULT 25.00,
  last_sensor_reading NUMERIC(12, 2),
  sensor_status VARCHAR(50) DEFAULT 'ONLINE' CHECK (sensor_status IN ('ONLINE', 'CALIBRATING', 'WARNING', 'OFFLINE')),
  last_refill_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Fuel Rates (Government Official Rates & Zero Markup)
CREATE TABLE IF NOT EXISTS fuel_rates (
  id TEXT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL', 'CNG')),
  rate_per_litre NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  platform_markup NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_city_fuel UNIQUE (city, fuel_type)
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  depot_id TEXT REFERENCES depots(id) ON DELETE RESTRICT,
  tanker_id TEXT REFERENCES tankers(id) ON DELETE SET NULL,
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL', 'CNG')),
  quantity_litres NUMERIC(10, 2) NOT NULL CHECK (quantity_litres >= 5 AND quantity_litres <= 200),
  fuel_rate_at_order NUMERIC(10, 2) NOT NULL,
  fuel_subtotal NUMERIC(12, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  platform_markup NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ORDER_VERIFIED' CHECK (status IN ('ORDER_VERIFIED', 'TANKER_ASSIGNED', 'IN_TRANSIT', 'ARRIVED', 'DISPENSING', 'COMPLETED', 'CANCELLED')),
  delivery_address TEXT NOT NULL,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  vehicle_preset VARCHAR(50) DEFAULT 'CAR',
  vehicle_reg_number VARCHAR(50),
  estimated_delivery_minutes INTEGER DEFAULT 25,
  payment_method VARCHAR(50) DEFAULT 'UPI',
  payment_status VARCHAR(50) DEFAULT 'COMPLETED',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Dispatches
CREATE TABLE IF NOT EXISTS dispatches (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  tanker_id TEXT REFERENCES tankers(id) ON DELETE CASCADE,
  driver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  depot_id TEXT REFERENCES depots(id) ON DELETE CASCADE,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  arrived_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 11. GPS Location Stream
CREATE TABLE IF NOT EXISTS gps_locations (
  id TEXT PRIMARY KEY,
  tanker_id TEXT REFERENCES tankers(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  speed_kmh NUMERIC(6, 2) DEFAULT 0.00,
  heading_deg NUMERIC(6, 2) DEFAULT 0.00,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. IoT Dispensing Records
CREATE TABLE IF NOT EXISTS dispensing_records (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  tanker_id TEXT REFERENCES tankers(id) ON DELETE CASCADE,
  driver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  litres_requested NUMERIC(10, 2) NOT NULL,
  litres_dispensed NUMERIC(10, 2) NOT NULL,
  flow_rate_lpm NUMERIC(6, 2) DEFAULT 45.00,
  nozzle_accuracy_pct NUMERIC(5, 2) DEFAULT 99.99,
  temperature_c NUMERIC(5, 2) DEFAULT 24.20,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 13. Inventory Transactions (Double-entry Depot Ledger)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  fuel_tank_id TEXT REFERENCES fuel_tanks(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('DISPENSE', 'REFILL', 'ADJUSTMENT', 'TRANSFER')),
  quantity_litres NUMERIC(12, 2) NOT NULL,
  balance_after_litres NUMERIC(12, 2) NOT NULL,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  reference_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_ref VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'COMPLETED',
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Invoices (Immutable Record of Rate & Zero-Markup)
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone VARCHAR(50),
  fuel_type VARCHAR(20) NOT NULL,
  quantity_requested NUMERIC(10, 2) NOT NULL,
  quantity_delivered NUMERIC(10, 2) NOT NULL,
  rate_per_litre NUMERIC(10, 2) NOT NULL,
  fuel_subtotal NUMERIC(12, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  platform_markup NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL,
  tanker_code VARCHAR(50),
  density_certificate_ref VARCHAR(100) NOT NULL,
  qr_code_payload TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PAID',
  delivery_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Safety Checks & Emergency Incidents
CREATE TABLE IF NOT EXISTS safety_checks (
  id TEXT PRIMARY KEY,
  tanker_id TEXT REFERENCES tankers(id) ON DELETE CASCADE,
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  check_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'INVESTIGATING')),
  description TEXT NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Immutable Audit Logs (PESO Compliance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id TEXT,
  details_json TEXT NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance and Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_tanker_id ON orders(tanker_id);
CREATE INDEX IF NOT EXISTS idx_orders_depot_id ON orders(depot_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_tanker_time ON gps_locations(tanker_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_tank_id ON inventory_transactions(fuel_tank_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
