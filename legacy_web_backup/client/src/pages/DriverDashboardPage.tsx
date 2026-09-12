import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Navigation, Play, CheckCircle2, AlertOctagon, ShieldCheck, Thermometer, Gauge, Zap, Activity, RefreshCw, Fuel } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Order, Tanker } from '../types';
import { IoTDispenserSimulator } from '../components/IoTDispenserSimulator';

export const DriverDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, joinTankerRoom, joinOrderRoom } = useSocket();

  const [assignedTanker, setAssignedTanker] = useState<Tanker | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [isDispensingOpen, setIsDispensingOpen] = useState<boolean>(false);
  const [gpsSimulating, setGpsSimulating] = useState<boolean>(true);
  const [completedTrips, setCompletedTrips] = useState<Order[]>([]);

  // Load Driver's tanker & active orders
  const loadDriverData = async () => {
    try {
      const tankersRes = await api.getTankers();
      // Find tanker assigned to this driver or default to first tanker
      const tanker = tankersRes.tankers.find((t: Tanker) => t.driver_id === user?.id) || tankersRes.tankers[0];
      if (tanker) {
        setAssignedTanker(tanker);
        joinTankerRoom(tanker.id);
      }

      const ordersRes = await api.getOrders();
      const active = ordersRes.orders.find((o: Order) => 
        o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
      );
      if (active) {
        setActiveDelivery(active);
        joinOrderRoom(active.id);
      } else {
        setActiveDelivery(null);
      }

      const completed = ordersRes.orders.filter((o: Order) => o.status === 'COMPLETED');
      setCompletedTrips(completed);
    } catch (err) {
      console.error('Failed to load driver data:', err);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, [user]);

  // Handle trip progression button clicks
  const handleStartTrip = async () => {
    if (!activeDelivery) return;
    try {
      await api.updateOrderStatus(activeDelivery.id, 'IN_TRANSIT', 'Driver commenced navigation to customer doorstep');
      await loadDriverData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleArrived = async () => {
    if (!activeDelivery) return;
    try {
      await api.updateOrderStatus(activeDelivery.id, 'ARRIVED', 'Tanker arrived at customer delivery location');
      await loadDriverData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSafetyAlert = async () => {
    if (!assignedTanker) return;
    const reason = prompt('Describe emergency safety issue / hazard:', 'Pressure valve sensor warning on rear manifold');
    if (!reason) return;

    try {
      await api.sendSafetyAlert(assignedTanker.id, {
        check_type: 'EMERGENCY_STOP',
        description: reason,
        order_id: activeDelivery?.id
      });
      alert('🚨 Emergency safety SOS dispatched to Operations Command Center.');
    } catch (err: any) {
      alert(`Failed to send alert: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Driver Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-display">Driver Command HUD</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE ON DUTY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pilot: <strong className="text-slate-200">{user?.name || 'Vikram Singh'}</strong> • Unit: <strong className="text-cyan-400 font-mono">{assignedTanker?.code || 'TK-101'}</strong> ({assignedTanker?.name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSafetyAlert}
            className="px-4 py-2 rounded-2xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold transition flex items-center gap-1.5"
          >
            <AlertOctagon className="w-4 h-4" /> Safety SOS
          </button>
          <button
            onClick={loadDriverData}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tanker Hardware Telematics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-3xl cyber-glass border border-white/10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> GPS SPEED
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {assignedTanker?.speed_kmh || 0} <span className="text-xs text-slate-400">km/h</span>
          </div>
          <span className="text-[10px] text-slate-500">Live Telematics Pulse</span>
        </div>

        <div className="p-4 rounded-3xl cyber-glass border border-white/10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" /> TANK TEMP
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {assignedTanker?.tank_temp_c || 24.2}°C
          </div>
          <span className="text-[10px] text-emerald-400">Within Safe Limits</span>
        </div>

        <div className="p-4 rounded-3xl cyber-glass border border-white/10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> NOZZLE CALIB
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ±0.01%
          </div>
          <span className="text-[10px] text-slate-500">PESO Standard</span>
        </div>

        <div className="p-4 rounded-3xl cyber-glass border border-white/10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
            <Fuel className="w-3.5 h-3.5 text-orange-400" /> TANK PAYLOAD
          </div>
          <div className="text-2xl font-black font-mono text-orange-400">
            {Math.round(parseFloat(assignedTanker?.current_litres as string || '3450'))} <span className="text-xs text-slate-400">L</span>
          </div>
          <span className="text-[10px] text-slate-500">{assignedTanker?.fuel_type} Grade</span>
        </div>

      </div>

      {/* Main Active Delivery Card / Dispenser Launcher */}
      {activeDelivery ? (
        <div className="rounded-3xl cyber-glass border-2 border-emerald-500/40 p-6 md:p-8 shadow-2xl space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <h2 className="text-lg font-bold text-white font-display">
                  Current Assigned Delivery Mission
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {activeDelivery.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Order #{activeDelivery.order_number} • Customer: <strong className="text-slate-200">{activeDelivery.customer_name}</strong> ({activeDelivery.customer_phone})
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Deliver Volume</span>
              <span className="text-2xl font-black font-mono text-orange-400">
                {activeDelivery.quantity_litres} L {activeDelivery.fuel_type}
              </span>
            </div>
          </div>

          {/* Delivery Location & Navigation HUD */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Delivery Destination
                </span>
                <div className="text-sm font-bold text-slate-100">{activeDelivery.delivery_address}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Preset: {activeDelivery.vehicle_preset} • Reg: {activeDelivery.vehicle_reg_number || 'Standard Vehicle'}
                </div>
              </div>
            </div>
          </div>

          {/* Trip Progression Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            
            {activeDelivery.status === 'ORDER_VERIFIED' || activeDelivery.status === 'TANKER_ASSIGNED' ? (
              <button
                onClick={handleStartTrip}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition transform active:scale-95"
              >
                <Navigation className="w-5 h-5" /> Start Trip (Commence En Route)
              </button>
            ) : activeDelivery.status === 'IN_TRANSIT' ? (
              <button
                onClick={handleArrived}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition transform active:scale-95"
              >
                <MapPin className="w-5 h-5" /> Mark As Arrived at Destination
              </button>
            ) : activeDelivery.status === 'ARRIVED' || activeDelivery.status === 'DISPENSING' ? (
              <button
                onClick={() => setIsDispensingOpen(true)}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/30 transition transform hover:scale-105 active:scale-95"
              >
                <Zap className="w-5 h-5 fill-slate-950" /> Connect IoT Hardware & Dispense ({activeDelivery.quantity_litres}L)
              </button>
            ) : null}

          </div>

        </div>
      ) : (
        <div className="rounded-3xl cyber-glass border border-white/10 p-10 text-center space-y-3 text-slate-400">
          <Truck className="w-12 h-12 mx-auto text-emerald-500/60" />
          <h2 className="text-lg font-bold text-white font-display">No Active Missions Pending</h2>
          <p className="text-xs max-w-sm mx-auto">
            You are currently on standby at the depot. New assigned doorstep deliveries will appear here in real-time.
          </p>
        </div>
      )}

      {/* IoT Dispenser Simulator Modal when driver connects nozzle */}
      {isDispensingOpen && activeDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <IoTDispenserSimulator
              order={activeDelivery}
              onDispensingComplete={async (result) => {
                setIsDispensingOpen(false);
                alert(`✅ Delivery completed! ${result.order.quantity_litres}L dispensed. Invoice ${result.invoiceNumber} generated.`);
                await loadDriverData();
              }}
              onCancel={() => setIsDispensingOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Completed Missions History */}
      <div className="rounded-3xl cyber-glass border border-white/10 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
          Completed Driver Trips Log
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {completedTrips.map(t => (
            <div key={t.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-200">#{t.order_number}</span> • <span className="text-slate-400">{t.delivery_address}</span>
              </div>
              <div className="font-mono text-emerald-400 font-bold">
                {t.quantity_litres}L {t.fuel_type} (₹{t.total_amount})
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
