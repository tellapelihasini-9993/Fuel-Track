import React, { useState, useEffect } from 'react';
import { Radio, Truck, MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Activity, Users, Zap, RefreshCw, ChevronRight, Fuel } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Tanker, Order, Depot, SafetyCheck } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';
import { TelematicsDrawer } from '../components/TelematicsDrawer';
import { SafetyAlertBanner } from '../components/SafetyAlertBanner';

export const DispatcherAdminPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, latestAlert, dismissAlert } = useSocket();

  const [tankers, setTankers] = useState<Tanker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [selectedTanker, setSelectedTanker] = useState<Tanker | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<SafetyCheck[]>([]);

  const loadCommandData = async () => {
    try {
      const [tankersRes, ordersRes, depotsRes] = await Promise.all([
        api.getTankers(),
        api.getOrders(),
        api.getDepots()
      ]);

      setTankers(tankersRes.tankers || []);
      setOrders(ordersRes.orders || []);
      setDepots(depotsRes.depots || []);
    } catch (err) {
      console.error('Failed to load command center data:', err);
    }
  };

  useEffect(() => {
    loadCommandData();
  }, [user]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('tanker:location', (loc) => {
      setTankers(prev => prev.map(t => {
        if (t.id === loc.tanker_id) {
          return {
            ...t,
            latitude: loc.latitude,
            longitude: loc.longitude,
            speed_kmh: loc.speed_kmh,
            heading_deg: loc.heading_deg
          };
        }
        return t;
      }));
    });

    socket.on('tanker:updated', (updatedTanker) => {
      setTankers(prev => prev.map(t => t.id === updatedTanker.id ? { ...t, ...updatedTanker } : t));
    });

    socket.on('order:created', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('order:updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
    });

    socket.on('safety:alert', (alert) => {
      setActiveAlerts(prev => [alert, ...prev]);
    });

    return () => {
      socket.off('tanker:location');
      socket.off('tanker:updated');
      socket.off('order:created');
      socket.off('order:updated');
      socket.off('safety:alert');
    };
  }, [socket]);

  // Handle manual or automatic tanker assignment
  const handleAssignTanker = async (orderId: string, tankerId: string) => {
    try {
      await api.assignTanker(orderId, tankerId);
      setAssigningOrder(null);
      await loadCommandData();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveSafetyAlert(alertId);
      setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
      dismissAlert();
    } catch (err: any) {
      alert(`Failed to resolve alert: ${err.message}`);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'ORDER_VERIFIED');
  const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Safety Alert Banner HUD */}
      {latestAlert && (
        <SafetyAlertBanner
          alert={latestAlert}
          onDismiss={dismissAlert}
          onResolve={handleResolveAlert}
        />
      )}

      {/* Header & Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-display">
                Operations Command Center
              </h1>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                LIVE 360° RADAR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fleet telematics, GPS radar tracking, nearest-tanker routing, and PESO safety oversight
            </p>
          </div>
        </div>

        <button
          onClick={loadCommandData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Fleet
        </button>
      </div>

      {/* Interactive 360° Fleet Radar & GPS Map Component */}
      <div>
        <InteractiveMap
          tankers={tankers}
          selectedTanker={selectedTanker}
          onSelectTanker={(t) => {
            setSelectedTanker(t);
            setIsDrawerOpen(true);
          }}
          depots={depots}
        />
      </div>

      {/* Fleet Overview & Pending Order Dispatch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Active Tankers Roster (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-display flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" /> Active Tanker Telematics Units ({tankers.length})
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">CLICK TO INSPECT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {tankers.map(tanker => {
              const isSelected = selectedTanker?.id === tanker.id;
              return (
                <div
                  key={tanker.id}
                  onClick={() => {
                    setSelectedTanker(tanker);
                    setIsDrawerOpen(true);
                  }}
                  className={`p-4 rounded-3xl cyber-glass border transition cursor-pointer group ${
                    isSelected ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' : 'border-white/10 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm text-white font-display flex items-center gap-1.5">
                        {tanker.name}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tanker.fuel_type} • {tanker.capacity_litres}L Cap
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tanker.status === 'IN_TRANSIT' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                      tanker.status === 'DISPENSING' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                      tanker.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      'bg-slate-800 text-slate-300 border-white/10'
                    }`}>
                      {tanker.status}
                    </span>
                  </div>

                  {/* Telematics preview line */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-slate-500 block">SPEED</span>
                      <span className="text-cyan-400 font-bold">{tanker.speed_kmh || 0} km/h</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">TEMP</span>
                      <span className="text-amber-400 font-bold">{tanker.tank_temp_c || 24.2}°C</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">REMAINING</span>
                      <span className="text-emerald-400 font-bold">{Math.round(parseFloat(tanker.current_litres as string))} L</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pending Dispatch Queue & Auto-Assignment (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" /> Pending Order Dispatch Queue ({pendingOrders.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {pendingOrders.length === 0 ? (
              <div className="rounded-3xl cyber-glass border border-white/5 p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                All customer orders currently assigned and in motion.
              </div>
            ) : (
              pendingOrders.map(order => {
                // Find nearest available tanker matching fuel type
                const availableMatching = tankers.filter(t => t.fuel_type === order.fuel_type && t.status === 'AVAILABLE');
                const recommended = availableMatching[0] || tankers[0];

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-3xl cyber-glass border border-orange-500/30 shadow-lg space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-100 text-sm">#{order.order_number}</span>
                        <div className="text-[11px] text-orange-400 font-bold">
                          {order.quantity_litres}L {order.fuel_type} • ₹{order.total_amount}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
                        Awaiting Tanker
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                      📍 {order.delivery_address}
                    </div>

                    {/* Tanker Assignment Selector */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleAssignTanker(order.id, recommended.id)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 transition"
                      >
                        Assign Nearest: {recommended.code} ({recommended.name})
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Telematics Drawer */}
      {isDrawerOpen && (
        <TelematicsDrawer
          tanker={selectedTanker}
          onClose={() => setIsDrawerOpen(false)}
          onSendAlert={async (tankerId) => {
            const reason = prompt('Safety alert reason:', 'Driver reporting temperature spike in auxiliary pump');
            if (reason) {
              await api.sendSafetyAlert(tankerId, { check_type: 'TEMP_HIGH', description: reason });
              alert('Safety alert broadcasted.');
            }
          }}
        />
      )}

    </div>
  );
};
