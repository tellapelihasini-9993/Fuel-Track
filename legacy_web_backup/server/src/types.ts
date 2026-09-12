export type UserRole = 'customer' | 'driver' | 'station_owner' | 'dispatcher' | 'admin';

export type FuelType = 'PETROL' | 'DIESEL' | 'CNG';

export type TankerStatus = 
  | 'AVAILABLE' 
  | 'ASSIGNED' 
  | 'IN_TRANSIT' 
  | 'ARRIVED' 
  | 'DISPENSING' 
  | 'RETURNING_TO_DEPOT' 
  | 'OFFLINE';

export type OrderStatus = 
  | 'ORDER_VERIFIED' 
  | 'TANKER_ASSIGNED' 
  | 'IN_TRANSIT' 
  | 'ARRIVED' 
  | 'DISPENSING' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type PaymentMethod = 'UPI' | 'CARD' | 'PAY_ON_DELIVERY';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type VehiclePresetType = 
  | 'CAR' 
  | 'BIKE' 
  | 'COMMERCIAL_FLEET' 
  | 'STANDBY_GENERATOR' 
  | 'HEAVY_AGRI_EQUIPMENT' 
  | 'CUSTOM';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface FuelRate {
  id: string;
  city: string;
  fuel_type: FuelType;
  rate_per_litre: number;
  delivery_fee: number;
  platform_markup: number;
  effective_date: string;
  created_at: string;
}

export interface Tanker {
  id: string;
  code: string;
  name: string;
  fuel_type: FuelType;
  capacity_litres: number;
  current_litres: number;
  status: TankerStatus;
  speed_kmh: number;
  latitude: number;
  longitude: number;
  destination: string | null;
  eta_minutes: number | null;
  tank_temp_c: number;
  nozzle_calibration_pct: number;
  driver_id: string | null;
  driver_name?: string;
  depot_id: string;
  created_at: string;
}

export interface Depot {
  id: string;
  name: string;
  code: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  created_at: string;
}

export interface FuelTank {
  id: string;
  depot_id: string;
  fuel_type: FuelType;
  max_capacity_litres: number;
  current_quantity_litres: number;
  min_safety_threshold_pct: number;
  last_sensor_reading: number;
  sensor_status: 'ONLINE' | 'CALIBRATING' | 'WARNING' | 'OFFLINE';
  last_refill_at: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  depot_id: string;
  tanker_id: string | null;
  tanker_code?: string;
  tanker_name?: string;
  driver_id: string | null;
  driver_name?: string;
  driver_phone?: string;
  fuel_type: FuelType;
  quantity_litres: number;
  fuel_rate_at_order: number;
  fuel_subtotal: number;
  delivery_fee: number;
  platform_markup: number;
  total_amount: number;
  status: OrderStatus;
  delivery_address: string;
  latitude: number;
  longitude: number;
  vehicle_preset: VehiclePresetType;
  vehicle_reg_number?: string;
  estimated_delivery_minutes: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes: string | null;
  created_by_user_id: string | null;
  created_at: string;
}

export interface GpsLocation {
  id: string;
  tanker_id: string;
  order_id: string | null;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading_deg: number;
  recorded_at: string;
}

export interface DispensingRecord {
  id: string;
  order_id: string;
  tanker_id: string;
  driver_id: string;
  litres_requested: number;
  litres_dispensed: number;
  flow_rate_lpm: number;
  nozzle_accuracy_pct: number;
  temperature_c: number;
  started_at: string;
  completed_at: string | null;
}

export interface InventoryTransaction {
  id: string;
  fuel_tank_id: string;
  transaction_type: 'DISPENSE' | 'REFILL' | 'ADJUSTMENT' | 'TRANSFER';
  quantity_litres: number;
  balance_after_litres: number;
  order_id: string | null;
  reference_note: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_ref: string;
  status: PaymentStatus;
  paid_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  order_number?: string;
  customer_name: string;
  customer_address: string;
  customer_phone?: string;
  fuel_type: FuelType;
  quantity_requested: number;
  quantity_delivered: number;
  rate_per_litre: number;
  fuel_subtotal: number;
  delivery_fee: number;
  platform_markup: number;
  total_amount: number;
  tanker_code?: string;
  density_certificate_ref: string;
  qr_code_payload: string;
  status: 'ISSUED' | 'PAID' | 'VOID';
  delivery_timestamp: string;
  created_at: string;
}

export interface SafetyCheck {
  id: string;
  tanker_id: string;
  driver_id: string | null;
  order_id: string | null;
  check_type: 'EMERGENCY_STOP' | 'ROLLOVER_SENSOR' | 'VAPOR_LEAK' | 'PRESSURE_HIGH' | 'TEMP_HIGH' | 'OFFLINE_PING' | 'ROUTE_DEVIATION';
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
  description: string;
  resolved_at: string | null;
  resolved_by_user_id: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details_json: string;
  ip_address: string | null;
  created_at: string;
}
