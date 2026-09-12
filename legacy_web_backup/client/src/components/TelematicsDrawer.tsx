import React from 'react';
import { Tanker, SafetyCheck } from '../types';
import { X, Truck, Gauge, Thermometer, ShieldCheck, BatteryCharging, Radio, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TelematicsDrawerProps {
  tanker: Tanker | null;
  onClose: () => void;
  onSendAlert?: (tankerId: string) => void;
}

export const TelematicsDrawer: React.FC<TelematicsDrawerProps> = ({ tanker, onClose, onSendAlert }) => {
  if (!tanker) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md cyber-glass border-l border-cyan-500/30 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-display">{tanker.name}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  {tanker.code}
                </span>
              </div>
              <span className="text-xs text-slate-400">Mobile Refuelling Unit Telematics HUD</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Pill & Driver */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/5 space-y-2 mb-4 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Operating Status:</span>
            <span className="font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              {tanker.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Assigned Driver:</span>
            <span className="font-bold text-slate-200">{tanker.driver_name || 'Vikram Singh'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Home Depot:</span>
            <span className="text-slate-200">{tanker.depot_name || 'Mumbai Central Hub'}</span>
          </div>
          {tanker.destination && (
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-slate-400">Active Destination:</span>
              <span className="text-orange-400 font-semibold truncate max-w-[200px]">{tanker.destination}</span>
            </div>
          )}
        </div>

        {/* Telematics Grid (4 Sensors) */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">
          IoT Sensor Telemetry
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          
          <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" /> GPS SPEED
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400">
              {tanker.speed_kmh || 0} <span className="text-xs text-slate-400">km/h</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" /> TANK TEMP
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {tanker.tank_temp_c || 24.2}°C
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> NOZZLE CALIB
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              ±0.01%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1">
              <Radio className="w-3.5 h-3.5 text-purple-400" /> PAYLOAD
            </div>
            <div className="text-xl font-bold font-mono text-slate-200">
              {Math.round(parseFloat(tanker.current_litres as string))} L
            </div>
          </div>

        </div>

        {/* GPS Coordinates */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-300 space-y-1 mb-4">
          <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Current Coordinates</div>
          <div className="flex justify-between">
            <span>Latitude: {parseFloat(tanker.latitude as string).toFixed(6)}° N</span>
            <span>Longitude: {parseFloat(tanker.longitude as string).toFixed(6)}° E</span>
          </div>
        </div>

      </div>

      {/* Safety SOS Trigger Button */}
      {onSendAlert && (
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => onSendAlert(tanker.id)}
            className="w-full py-3 rounded-2xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" /> Trigger Safety Alert / Emergency SOS
          </button>
        </div>
      )}

    </div>
  );
};
