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
  role: UserRole;
  phone: string;
  created_at?: string;
}

export interface FuelRate {
  id: string;
  city: string;
  fuel_type: FuelType;
  rate_per_litre: string | number;
  delivery_fee: string | number;
  platform_markup: string | number;
  effective_date: string;
}

export interface Tanker {
  id: string;
  code: string;
  name: string;
  fuel_type: FuelType;
  capacity_litres: string | number;
  current_litres: string | number;
  status: TankerStatus;
  speed_kmh: string | number;
  latitude: string | number;
  longitude: string | number;
  destination: string | null;
  eta_minutes: number | null;
  tank_temp_c: string | number;
  nozzle_calibration_pct: string | number;
  driver_id: string | null;
  driver_name?: string;
  driver_phone?: string;
  depot_id: string;
  depot_name?: string;
  depot_city?: string;
}

export interface FuelTank {
  id: string;
  depot_id: string;
  depot_name?: string;
  depot_city?: string;
  fuel_type: FuelType;
  max_capacity_litres: string | number;
  current_quantity_litres: string | number;
  min_safety_threshold_pct: string | number;
  percentage_full: string | number;
  last_sensor_reading: string | number;
  sensor_status: 'ONLINE' | 'CALIBRATING' | 'WARNING' | 'OFFLINE';
  last_refill_at: string | null;
}

export interface Depot {
  id: string;
  name: string;
  code: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  tanks?: FuelTank[];
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  depot_id: string;
  tanker_id: string | null;
  tanker_code?: string;
  tanker_name?: string;
  tanker_speed?: number;
  tanker_lat?: number;
  tanker_lng?: number;
  tank_temp_c?: number;
  nozzle_calibration_pct?: number;
  driver_id: string | null;
  driver_name?: string;
  driver_phone?: string;
  fuel_type: FuelType;
  quantity_litres: string | number;
  fuel_rate_at_order: string | number;
  fuel_subtotal: string | number;
  delivery_fee: string | number;
  platform_markup: string | number;
  total_amount: string | number;
  status: OrderStatus;
  delivery_address: string;
  latitude: string | number;
  longitude: string | number;
  vehicle_preset: VehiclePresetType;
  vehicle_reg_number?: string;
  estimated_delivery_minutes: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  invoice_id?: string;
  invoice_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderTimelineItem {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes: string | null;
  actor_name?: string;
  actor_role?: string;
  created_at: string;
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
  quantity_requested: string | number;
  quantity_delivered: string | number;
  rate_per_litre: string | number;
  fuel_subtotal: string | number;
  delivery_fee: string | number;
  platform_markup: string | number;
  total_amount: string | number;
  tanker_code?: string;
  density_certificate_ref: string;
  qr_code_payload: string;
  status: 'ISSUED' | 'PAID' | 'VOID';
  delivery_timestamp: string;
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

export interface SafetyCheck {
  id: string;
  tanker_id: string;
  driver_id: string | null;
  driver_name?: string;
  order_id: string | null;
  check_type: string;
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
  description: string;
  created_at: string;
}
