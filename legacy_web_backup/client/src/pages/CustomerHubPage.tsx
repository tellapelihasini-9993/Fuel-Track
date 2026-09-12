import React, { useState, useEffect } from 'react';
import { Fuel, MapPin, Truck, CheckCircle2, Clock, ShieldCheck, QrCode, CreditCard, Banknote, FileText, ChevronRight, AlertCircle, Sparkles, Navigation, Gauge, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Order, FuelType, VehiclePresetType, Invoice } from '../types';
import { PricingBreakdownCard } from '../components/PricingBreakdownCard';
import { InvoiceModal } from '../components/InvoiceModal';

export const CustomerHubPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, joinOrderRoom } = useSocket();

  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [litres, setLitres] = useState<number>(35);
  const [vehiclePreset, setVehiclePreset] = useState<VehiclePresetType>('CAR');
  const [regNumber, setRegNumber] = useState<string>('MH-02-DZ-4040');
  const [address, setAddress] = useState<string>('Flat 402, Palms Residency, Bandra West, Mumbai 400050');
  const [city, setCity] = useState<string>('Mumbai');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'PAY_ON_DELIVERY'>('UPI');
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);

  const fuelRates: Record<FuelType, number> = {
    PETROL: 104.21,
    DIESEL: 92.15,
    CNG: 86.50
  };

  const presetOptions = [
    { type: 'CAR' as const, label: '🚗 Car', volume: 35, fuel: 'PETROL' as const, reg: 'MH-02-DZ-4040' },
    { type: 'BIKE' as const, label: '🏍️ Bike', volume: 10, fuel: 'PETROL' as const, reg: 'MH-01-BK-8822' },
    { type: 'COMMERCIAL_FLEET' as const, label: '🚚 Fleet Truck', volume: 80, fuel: 'DIESEL' as const, reg: 'MH-04-TR-9000' },
    { type: 'STANDBY_GENERATOR' as const, label: '⚡ Standby DG', volume: 50, fuel: 'DIESEL' as const, reg: 'DG-SET-45KVA' },
    { type: 'HEAVY_AGRI_EQUIPMENT' as const, label: '🚜 Agri Tractor', volume: 120, fuel: 'DIESEL' as const, reg: 'AG-HARVEST-01' },
  ];

  const savedAddresses = [
    'Flat 402, Palms Residency, Bandra West, Mumbai 400050',
    'Tower B, Godrej BKC Tech Hub, Mumbai 400051',
    'Plot 18, Andheri MIDC Industrial Compound, Mumbai 400093',
  ];

  // Fetch orders
  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      setOrders(res.orders || []);
      const active = res.orders.find((o: Order) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
      if (active) {
        setActiveOrder(active);
        joinOrderRoom(active.id);
      } else if (res.orders.length > 0) {
        setActiveOrder(res.orders[0]); // fallback to most recent
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  // Real-time socket updates for active order
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
      if (activeOrder?.id === updatedOrder.id) {
        setActiveOrder(prev => prev ? { ...prev, ...updatedOrder } : updatedOrder);
      }
    };

    socket.on('order:updated', handleOrderUpdate);
    socket.on('order:created', handleOrderUpdate);

    return () => {
      socket.off('order:updated', handleOrderUpdate);
      socket.off('order:created', handleOrderUpdate);
    };
  }, [socket, activeOrder]);

  const handleSelectPreset = (preset: typeof presetOptions[0]) => {
    setVehiclePreset(preset.type);
    setLitres(preset.volume);
    setFuelType(preset.fuel);
    setRegNumber(preset.reg);
  };

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.createOrder({
        fuel_type: fuelType,
        quantity_litres: litres,
        delivery_address: address,
        latitude: 19.0596,
        longitude: 72.8295,
        vehicle_preset: vehiclePreset,
        vehicle_reg_number: regNumber,
        payment_method: paymentMethod,
        city
      });

      setIsCheckoutOpen(false);
      setActiveOrder(res.order);
      joinOrderRoom(res.order.id);
      await loadOrders();
    } catch (err: any) {
      alert(`Order creation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewInvoice = async (orderId: string) => {
    try {
      const res = await api.getInvoiceByOrder(orderId);
      setSelectedInvoice(res.invoice);
      setIsInvoiceOpen(true);
    } catch (err) {
      alert('Invoice is being generated as dispensing completes.');
    }
  };

  const orderStages = [
    { key: 'ORDER_VERIFIED', label: 'Order Verified', desc: 'Rate locked & paid' },
    { key: 'TANKER_ASSIGNED', label: 'Tanker Assigned', desc: 'Driver en route' },
    { key: 'IN_TRANSIT', label: 'In Transit', desc: 'Live GPS moving' },
    { key: 'ARRIVED', label: 'Arrived', desc: 'At delivery point' },
    { key: 'DISPENSING', label: 'Dispensing', desc: 'IoT flow ~45L/min' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Invoice generated' }
  ];

  const getStageIndex = (status: string) => {
    return orderStages.findIndex(s => s.key === status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      
      {/* Page Title & User Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white font-display">
              Customer Fuel Hub
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Zero-Markup Doorstep Refuelling
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-200">{user?.name || 'Valued Customer'}</strong> • High-accuracy calibrated mobile delivery
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition border border-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {/* Main Grid: Left Booking Console, Right Real-Time Order HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Order Formulation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="rounded-3xl cyber-glass border border-white/10 p-6 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                1. Select Vehicle / Machinery Preset
              </span>
              <span className="text-[10px] text-slate-500 font-mono">5 PRESETS AVAILABLE</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {presetOptions.map((p) => {
                const isSelected = vehiclePreset === p.type && litres === p.volume;
                return (
                  <button
                    key={p.type}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 rounded-2xl text-left border transition ${
                      isSelected
                        ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-slate-900/70 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-100">{p.label}</div>
                    <div className="text-[10px] text-orange-400 font-mono font-semibold mt-1">
                      {p.volume} L ({p.fuel})
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Fuel Type & Registration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Fuel Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['PETROL', 'DIESEL', 'CNG'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFuelType(f)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition border ${
                        fuelType === f
                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Vehicle / Equipment Reg No.
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. MH-02-DZ-4040"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Volume Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Fuel Volume (5L to 200L):
                </label>
                <span className="text-xl font-black font-mono text-orange-400">
                  {litres} <span className="text-xs text-slate-400 font-sans">Litres</span>
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="1"
                value={litres}
                onChange={(e) => setLitres(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Doorstep Delivery Address
              </label>
              <select
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              >
                {savedAddresses.map((addr, i) => (
                  <option key={i} value={addr} className="bg-slate-900 text-slate-200">
                    📍 {addr}
                  </option>
                ))}
              </select>
            </div>

            {/* Transparent Calculation Breakdown */}
            <PricingBreakdownCard
              litres={litres}
              ratePerLitre={fuelRates[fuelType]}
              fuelType={fuelType}
              city={city}
            />

            {/* Order Checkout Trigger Button */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/30 transition transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <Fuel className="w-5 h-5 fill-slate-950" /> Proceed to Doorstep Fuel Checkout
            </button>

          </div>

        </div>

        {/* Right Column: Live Active Order Tracking & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Order Stepper Card */}
          {activeOrder ? (
            <div className="rounded-3xl cyber-glass border border-orange-500/30 p-6 shadow-2xl space-y-6 relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping"></span>
                  <span className="text-xs font-bold text-white font-display">
                    Active Delivery Tracking
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-orange-400">
                  #{activeOrder.order_number}
                </span>
              </div>

              {/* Order Info Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 block">FUEL & VOLUME</span>
                  <span className="font-bold text-slate-100">{activeOrder.quantity_litres}L {activeOrder.fuel_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">ASSIGNED UNIT</span>
                  <span className="font-bold text-cyan-400 font-mono">{activeOrder.tanker_code || 'Pending Dispatch'}</span>
                </div>
              </div>

              {/* 6-Stage Linear Progress Stepper */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Delivery Progress Lifecycle
                </div>

                <div className="space-y-2">
                  {orderStages.map((stage, idx) => {
                    const currentIdx = getStageIndex(activeOrder.status);
                    const isDone = currentIdx > idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div
                        key={stage.key}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                          isCurrent 
                            ? 'bg-orange-500/20 border border-orange-500/50 text-white' 
                            : isDone 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-slate-300' 
                              : 'bg-slate-900/40 text-slate-500 border border-transparent'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          isDone 
                            ? 'bg-emerald-500 text-slate-950' 
                            : isCurrent 
                              ? 'bg-orange-500 text-slate-950 animate-pulse' 
                              : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{stage.label}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-orange-500 text-slate-950">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{stage.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View Invoice Button if completed */}
              {activeOrder.status === 'COMPLETED' && (
                <button
                  onClick={() => handleViewInvoice(activeOrder.id)}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <FileText className="w-4 h-4" /> View Certified Tax Invoice & PESO Seal
                </button>
              )}

            </div>
          ) : (
            <div className="rounded-3xl cyber-glass border border-white/5 p-8 text-center space-y-3 text-slate-400">
              <Truck className="w-10 h-10 mx-auto text-slate-600" />
              <div className="font-bold text-slate-300 text-sm">No Active Deliveries Right Now</div>
              <p className="text-xs max-w-xs mx-auto">
                Customize your volume on the left and place a zero-markup doorstep order to start live tracking.
              </p>
            </div>
          )}

          {/* Past Orders History */}
          <div className="rounded-3xl cyber-glass border border-white/10 p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
              Recent Order Receipts
            </h3>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setActiveOrder(order)}
                  className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/5 hover:border-orange-500/30 transition cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">#{order.order_number}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {order.quantity_litres}L {order.fuel_type} • ₹{order.total_amount}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {order.status}
                    </span>
                    {order.status === 'COMPLETED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInvoice(order.id);
                        }}
                        title="Download Invoice"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Mock Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0b1120] rounded-3xl border border-orange-500/30 p-6 shadow-2xl space-y-6 text-slate-100">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-display">Mock Instant Checkout</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl text-center border transition ${
                  paymentMethod === 'UPI' ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <div className="text-[11px] font-bold">UPI QR</div>
              </button>

              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl text-center border transition ${
                  paymentMethod === 'CARD' ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                <div className="text-[11px] font-bold">Card</div>
              </button>

              <button
                onClick={() => setPaymentMethod('PAY_ON_DELIVERY')}
                className={`p-3 rounded-2xl text-center border transition ${
                  paymentMethod === 'PAY_ON_DELIVERY' ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <div className="text-[11px] font-bold">POD</div>
              </button>
            </div>

            {/* Payment Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Fuel: {litres}L {fuelType}</span>
                <span className="font-mono text-slate-200">₹{(litres * fuelRates[fuelType]).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Flat Delivery:</span>
                <span className="font-mono text-slate-200">₹50.00</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Platform Markup:</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10 font-display">
                <span>Total Payable:</span>
                <span className="font-mono text-orange-400">₹{(litres * fuelRates[fuelType] + 50).toFixed(2)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              disabled={isSubmitting}
              onClick={handleCreateOrder}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/30 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Processing Order...' : `Confirm & Authorize (₹${(litres * fuelRates[fuelType] + 50).toFixed(2)})`}
            </button>

          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceOpen && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}

    </div>
  );
};
