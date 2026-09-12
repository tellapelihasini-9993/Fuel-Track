import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, AlertOctagon, CheckCircle2, ShieldCheck, Thermometer, Gauge, Zap, Activity } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

interface IoTDispenserSimulatorProps {
  order: Order;
  onDispensingComplete: (result: any) => void;
  onCancel?: () => void;
}

export const IoTDispenserSimulator: React.FC<IoTDispenserSimulatorProps> = ({
  order,
  onDispensingComplete,
  onCancel
}) => {
  const targetLitres = parseFloat(order.quantity_litres as string);
  const ratePerLitre = parseFloat(order.fuel_rate_at_order as string);

  const [dispensedLitres, setDispensedLitres] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isEmergencyStopped, setIsEmergencyStopped] = useState<boolean>(false);
  const [flowRate, setFlowRate] = useState<number>(45.2);
  const [temperature, setTemperature] = useState<number>(24.2);
  const [calibrationAccuracy] = useState<number>(99.99); // ±0.01%
  const [eventLogs, setEventLogs] = useState<string[]>([
    'PESO Sensor Handshake: OK (Protocol v4.2)',
    'Vapor Recovery Seal: Verified Engaged',
    'Flow Meter Calibration: ±0.01% High-Accuracy Approved'
  ]);

  const tickIntervalRef = useRef<any>(null);

  // Live amount calculation: (Litres * Rate) + ₹50 delivery fee
  const currentFuelAmount = Math.round((dispensedLitres * ratePerLitre + Number.EPSILON) * 100) / 100;
  const currentTotalAmount = Math.round((currentFuelAmount + 50.00 + Number.EPSILON) * 100) / 100;
  const progressPct = Math.min(100, (dispensedLitres / targetLitres) * 100);

  // Dispensing clock tick (every 100ms = 0.075L at 45L/min)
  useEffect(() => {
    if (isRunning && !isCompleted && !isEmergencyStopped) {
      tickIntervalRef.current = setInterval(() => {
        setDispensedLitres(prev => {
          const next = prev + 0.15; // ~1.5 L/sec accelerated slightly for snappy demo experience
          if (next >= targetLitres) {
            clearInterval(tickIntervalRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            return targetLitres;
          }
          return Math.round(next * 100) / 100;
        });

        // Add subtle flow jitter
        setFlowRate(+(44.8 + Math.random() * 0.8).toFixed(1));
        setTemperature(+(24.1 + Math.random() * 0.3).toFixed(1));
      }, 100);
    } else {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    }

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, [isRunning, isCompleted, isEmergencyStopped, targetLitres]);

  const handleStart = async () => {
    setIsEmergencyStopped(false);
    setIsRunning(true);
    addLog(`Dispensing started at ${flowRate} L/min.`);
    try {
      await api.startDispensing({
        order_id: order.id,
        tanker_id: order.tanker_id || 'tnk-101'
      });
    } catch (err) {
      console.warn('Backend dispensing init notification:', err);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    addLog(`Dispensing paused at ${dispensedLitres.toFixed(2)} L.`);
  };

  const handleEmergencyStop = () => {
    setIsRunning(false);
    setIsEmergencyStopped(true);
    addLog(`⚠️ EMERGENCY SHUT-OFF VALVE ACTIVATED AT ${dispensedLitres.toFixed(2)} L.`);
  };

  const handleFinishAndSave = async () => {
    try {
      addLog('Finalizing delivery, updating depot inventory & generating invoice...');
      const result = await api.completeDispensing({
        order_id: order.id,
        actual_litres_dispensed: dispensedLitres,
        flow_rate_lpm: flowRate,
        temperature_c: temperature,
        nozzle_accuracy_pct: calibrationAccuracy,
        density_kg_m3: order.fuel_type === 'PETROL' ? 742.8 : 832.4
      });

      onDispensingComplete(result);
    } catch (err: any) {
      alert(`Error completing dispensing: ${err.message}`);
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setEventLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 10)]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl cyber-glass border-2 border-orange-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
      
      {/* High-Tech Hardware Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-display">IoT Micro-Tanker Dispenser Unit</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse">
                [SIMULATED HARDWARE]
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Order #{order.order_number} • {order.fuel_type} • Calibrated @ ±0.01% PESO Accuracy
            </p>
          </div>
        </div>

        {/* Telematics status indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/10">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">{temperature}°C</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">±0.01%</span>
          </div>
        </div>
      </div>

      {/* Main Digital LED Meter Screens (Orbitron Font) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Screen 1: Litres Dispensed */}
        <div className="led-screen rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs text-orange-400/70 font-mono mb-2">
            <span>VOLUME DISPENSED (LITRES)</span>
            <span className="text-slate-400 font-sans">TARGET: {targetLitres.toFixed(2)} L</span>
          </div>
          <div className="text-5xl md:text-6xl font-black font-mono-led text-orange-400 tracking-wider glow-text-orange py-2">
            {dispensedLitres.toFixed(2)}
            <span className="text-xl md:text-2xl ml-2 text-orange-500/70 font-sans">L</span>
          </div>
          {/* Animated Flow Indicator Bar */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden mt-3 border border-orange-500/30">
            <div 
              className="h-full bg-gradient-to-r from-orange-600 via-amber-400 to-yellow-300 transition-all duration-150"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        {/* Screen 2: Real-time Bill Payable */}
        <div className="led-screen rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs text-emerald-400/70 font-mono mb-2">
            <span>TOTAL AMOUNT (ZERO MARKUP)</span>
            <span className="text-slate-400 font-sans">RATE: ₹{ratePerLitre.toFixed(2)} + ₹50 FEE</span>
          </div>
          <div className="text-5xl md:text-6xl font-black font-mono-led text-emerald-400 tracking-wider glow-text-green py-2">
            ₹{currentTotalAmount.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-3 pt-2 border-t border-white/5">
            <span>Flow: <strong className="text-cyan-400">{isRunning ? flowRate : 0} L/min</strong></span>
            <span className="text-emerald-400 font-bold">₹0 Platform Markup Verified</span>
          </div>
        </div>

      </div>

      {/* Hardware Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-white/10 mb-6">
        <div className="flex items-center gap-3">
          {!isCompleted ? (
            <>
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Start Dispensing
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition transform active:scale-95"
                >
                  <Pause className="w-4 h-4 fill-slate-950" /> Pause Dispenser
                </button>
              )}

              <button
                onClick={handleEmergencyStop}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 font-bold text-xs transition"
              >
                <AlertOctagon className="w-4 h-4" /> Emergency Stop
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-sm border border-emerald-500/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Target volume {targetLitres}L reached!
            </div>
          )}
        </div>

        {/* Complete Order Action Button */}
        <div>
          {isCompleted ? (
            <button
              onClick={handleFinishAndSave}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/30 transition transform hover:scale-105"
            >
              <CheckCircle2 className="w-5 h-5" /> Complete Delivery & Generate Invoice
            </button>
          ) : (
            <span className="text-xs text-slate-400">
              Dispenser status: <strong className={isRunning ? 'text-emerald-400' : 'text-amber-400'}>{isRunning ? 'FLOW ACTIVE' : isEmergencyStopped ? 'EMERGENCY SHUTDOWN' : 'STANDBY'}</strong>
            </span>
          )}
        </div>
      </div>

      {/* IoT Event Log Console */}
      <div className="rounded-2xl bg-slate-950 p-4 border border-white/5 font-mono text-[11px]">
        <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2 mb-2 font-bold">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> IoT Hardware Event Telemetry Stream
          </span>
          <span className="text-emerald-400">LIVE FEED</span>
        </div>
        <div className="space-y-1 text-slate-300 max-h-24 overflow-y-auto">
          {eventLogs.map((log, i) => (
            <div key={i} className="leading-relaxed truncate">
              {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
