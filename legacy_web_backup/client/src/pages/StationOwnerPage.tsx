import React, { useState, useEffect } from 'react';
import { Store, Droplet, AlertTriangle, Plus, CheckCircle2, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight, RefreshCw, Zap } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FuelTank, Depot } from '../types';

export const StationOwnerPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [depots, setDepots] = useState<Depot[]>([]);
  const [allTanks, setAllTanks] = useState<FuelTank[]>([]);
  const [selectedTank, setSelectedTank] = useState<FuelTank | null>(null);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState<boolean>(false);
  const [refillLitres, setRefillLitres] = useState<number>(5000);
  const [transactions, setTransactions] = useState<any[]>([]);

  const loadDepotData = async () => {
    try {
      const res = await api.getDepots();
      setDepots(res.depots || []);
      setAllTanks(res.allTanks || []);
      if (res.allTanks?.length > 0 && !selectedTank) {
        setSelectedTank(res.allTanks[0]);
      }

      // Load transactions for first depot
      if (res.depots?.length > 0) {
        const invRes = await api.getDepotInventory(res.depots[0].id);
        setTransactions(invRes.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load depot hub data:', err);
    }
  };

  useEffect(() => {
    loadDepotData();
  }, [user]);

  // Real-time socket inventory updates
  useEffect(() => {
    if (!socket) return;

    socket.on('inventory:updated', (updatedTank) => {
      setAllTanks(prev => prev.map(t => t.id === updatedTank.id ? { ...t, ...updatedTank } : t));
    });

    return () => {
      socket.off('inventory:updated');
    };
  }, [socket]);

  const handleRefillSubmit = async () => {
    if (!selectedTank) return;
    try {
      await api.refillInventory({
        fuel_tank_id: selectedTank.id,
        quantity_litres: refillLitres,
        reference_note: `Procurement batch order - ${selectedTank.fuel_type}`
      });
      setIsRefillModalOpen(false);
      await loadDepotData();
    } catch (err: any) {
      alert(`Refill error: ${err.message}`);
    }
  };

  // Demo interactive controls
  const handleDemoAction = async (actionType: string) => {
    if (!selectedTank) return;
    try {
      const res = await api.triggerDemoAction(selectedTank.id, actionType);
      await loadDepotData();
      if (res.isLowStockAlert) {
        alert('⚠️ Low-stock warning alert triggered! Tank inventory is below 25% safety threshold.');
      }
    } catch (err: any) {
      alert(`Demo action error: ${err.message}`);
    }
  };

  const getLiquidColor = (fuelType: string) => {
    switch (fuelType) {
      case 'PETROL': return 'from-orange-500 to-amber-400';
      case 'DIESEL': return 'from-cyan-500 to-blue-500';
      case 'CNG': return 'from-emerald-500 to-teal-400';
      default: return 'from-slate-500 to-slate-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-display">
                Station & Depot Owner Hub
              </h1>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                DEPOT AUTOMATION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bulk storage management, ultrasonic level sensors, automated inventory reconciliation, and refill procurement
            </p>
          </div>
        </div>

        <button
          onClick={loadDepotData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Sensors
        </button>
      </div>

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-3xl cyber-glass border border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Depot Revenue (Today)
          </span>
          <div className="text-2xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
            ₹1,14,500
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +14.8% vs last week
          </span>
        </div>

        <div className="p-4 rounded-3xl cyber-glass border border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Fuel Sold
          </span>
          <div className="text-2xl font-black font-mono text-cyan-400">
            1,100 <span className="text-xs text-slate-400">L</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Across 22 Drops</span>
        </div>

        <div className="p-4 rounded-3xl cyber-glass border border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Storage Fuel In Stock
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            27,450 <span className="text-xs text-slate-400">L</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">All Sensors Online</span>
        </div>

        <div className="p-4 rounded-3xl cyber-glass border border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Mobile Tankers
          </span>
          <div className="text-2xl font-black font-mono text-purple-400">
            4 <span className="text-xs text-slate-400">Units</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">100% PESO Calibrated</span>
        </div>

      </div>

      {/* Storage Tanks Liquid Gauges Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 font-display flex items-center gap-2">
            <Droplet className="w-4 h-4 text-cyan-400" /> Depot Bulk Storage Tanks
          </h2>
          <span className="text-xs text-slate-400">Low-Stock Alert Triggered at &lt; 25%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allTanks.map(tank => {
            const pct = parseFloat(tank.percentage_full as string || '80');
            const isLowStock = pct < 25;
            const isSelected = selectedTank?.id === tank.id;

            return (
              <div
                key={tank.id}
                onClick={() => setSelectedTank(tank)}
                className={`p-6 rounded-3xl cyber-glass border transition cursor-pointer relative overflow-hidden ${
                  isSelected ? 'border-amber-500 shadow-xl shadow-amber-500/15 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/40'
                }`}
              >
                {/* Low stock warning banner */}
                {isLowStock && (
                  <div className="absolute top-0 inset-x-0 bg-red-600/90 text-white text-[10px] font-black uppercase text-center py-1 flex items-center justify-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> LOW-STOCK ALERT (&lt;25%)
                  </div>
                )}

                <div className="flex items-start justify-between mb-4 mt-2">
                  <div>
                    <h3 className="font-bold text-base text-white font-display">
                      {tank.fuel_type} Storage Tank
                    </h3>
                    <span className="text-xs text-slate-400">{tank.depot_name || 'Mumbai Central Hub'}</span>
                  </div>

                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                    isLowStock ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {pct}% FULL
                  </span>
                </div>

                {/* Animated Liquid Visual Tank Gauge */}
                <div className="w-full h-32 bg-slate-950 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-end p-2 mb-4">
                  <div
                    className={`w-full rounded-xl bg-gradient-to-t ${getLiquidColor(tank.fuel_type)} transition-all duration-500 relative`}
                    style={{ height: `${pct}%` }}
                  >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 animate-pulse"></div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-2xl text-white drop-shadow-md pointer-events-none">
                    {Math.round(parseFloat(tank.current_quantity_litres as string))} <span className="text-xs text-slate-300 ml-1 font-sans">/ {tank.max_capacity_litres} L</span>
                  </div>
                </div>

                {/* Sensor info & Refill trigger */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-slate-400 font-mono">
                    Sensor: <strong className="text-emerald-400">{tank.sensor_status}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTank(tank);
                      setIsRefillModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Order Refill
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Demo Simulation Controls for Station Owner */}
      <div className="rounded-3xl cyber-glass border border-amber-500/30 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              Interactive Hardware & Sensor Simulation Controls
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Selected: {selectedTank?.fuel_type || 'PETROL'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleDemoAction('DISPENSE_500L')}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-amber-500/40 text-left transition"
          >
            <div className="font-bold text-xs text-slate-100 mb-0.5">🔻 Dispense 500 Litres</div>
            <div className="text-[10px] text-slate-400">Simulate bulk depot fleet fuel discharge</div>
          </button>

          <button
            onClick={() => handleDemoAction('AUTO_TOPUP_95')}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-left transition"
          >
            <div className="font-bold text-xs text-slate-100 mb-0.5">🔺 Auto Top-Up &gt;95%</div>
            <div className="text-[10px] text-slate-400">Restock bulk tank to full operating capacity</div>
          </button>

          <button
            onClick={() => handleDemoAction('SIMULATE_LOW_STOCK')}
            className="p-3.5 rounded-2xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-left transition"
          >
            <div className="font-bold text-xs text-red-300 mb-0.5">⚠️ Simulate Low Stock (&lt;25%)</div>
            <div className="text-[10px] text-red-400">Trigger safety alert and refill notification</div>
          </button>
        </div>
      </div>

      {/* Double-Entry Inventory Ledger Transactions Table */}
      <div className="rounded-3xl cyber-glass border border-white/10 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 font-display uppercase tracking-wider">
          Depot Inventory Transaction Ledger
        </h3>

        <div className="rounded-2xl border border-white/5 overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-white/5">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Type</th>
                <th className="p-3">Quantity (L)</th>
                <th className="p-3">Balance After (L)</th>
                <th className="p-3">Reference / Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {transactions.slice(0, 10).map((tx, i) => (
                <tr key={tx.id || i}>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tx.transaction_type === 'REFILL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'
                    }`}>
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {tx.transaction_type === 'REFILL' ? '+' : '-'}{tx.quantity_litres} L
                  </td>
                  <td className="p-3 font-mono text-slate-100">
                    {tx.balance_after_litres} L
                  </td>
                  <td className="p-3 text-slate-400">
                    {tx.reference_note || 'Automated sensor log'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refill Procurement Batch Modal */}
      {isRefillModalOpen && selectedTank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0b1120] rounded-3xl border border-amber-500/40 p-6 space-y-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-display">
                Create Tank Refill Procurement Batch
              </h3>
              <button onClick={() => setIsRefillModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Storage Tank</label>
                <div className="font-bold text-slate-100 p-2.5 rounded-xl bg-slate-900 border border-white/10">
                  {selectedTank.fuel_type} (Capacity: {selectedTank.max_capacity_litres}L)
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Refill Volume (Litres)</label>
                <input
                  type="number"
                  min="500"
                  max="15000"
                  step="500"
                  value={refillLitres}
                  onChange={(e) => setRefillLitres(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleRefillSubmit}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 transition"
            >
              Confirm Bulk Depot Refill
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
