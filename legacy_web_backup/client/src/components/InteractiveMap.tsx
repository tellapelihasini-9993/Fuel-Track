import React, { useState, useEffect } from 'react';
import { Tanker, Depot } from '../types';
import { Truck, MapPin, Radio, Compass, Gauge, Thermometer, Navigation, Maximize2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface InteractiveMapProps {
  tankers: Tanker[];
  selectedTanker: Tanker | null;
  onSelectTanker: (tanker: Tanker) => void;
  depots?: Depot[];
  customerLocation?: { lat: number; lng: number; address: string } | null;
  showRadarSweep?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  tankers,
  selectedTanker,
  onSelectTanker,
  depots = [],
  customerLocation,
  showRadarSweep = true
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Map geographic bounding box (covering Mumbai & Maharashtra hub coordinates)
  // Lat: ~18.5 to 19.3, Lng: ~72.7 to 74.0
  const minLat = 18.4;
  const maxLat = 19.3;
  const minLng = 72.7;
  const maxLng = 73.95;

  const latToPercent = (lat: number) => {
    const p = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return Math.max(8, Math.min(92, p));
  };

  const lngToPercent = (lng: number) => {
    const p = ((lng - minLng) / (maxLng - minLng)) * 100;
    return Math.max(8, Math.min(92, p));
  };

  const filteredTankers = tankers.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': return 'bg-cyan-500 text-cyan-100 border-cyan-400 shadow-cyan-500/50';
      case 'DISPENSING': return 'bg-orange-500 text-orange-100 border-orange-400 shadow-orange-500/50';
      case 'ARRIVED': return 'bg-yellow-500 text-yellow-100 border-yellow-400 shadow-yellow-500/50';
      case 'AVAILABLE': return 'bg-emerald-500 text-emerald-100 border-emerald-400 shadow-emerald-500/50';
      case 'ASSIGNED': return 'bg-blue-500 text-blue-100 border-blue-400 shadow-blue-500/50';
      default: return 'bg-slate-500 text-slate-100 border-slate-400';
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-3xl cyber-glass border border-cyan-500/20 overflow-hidden shadow-2xl flex flex-col select-none">
      
      {/* Top Map HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-lg">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">
            Live Fleet Radar
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
            {filteredTankers.length} Active Units
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-white/10 text-[11px] font-semibold">
          {['ALL', 'IN_TRANSIT', 'DISPENSING', 'AVAILABLE'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-xl transition ${
                filterStatus === st 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Cyberpunk Map Canvas Viewport */}
      <div className="relative flex-1 w-full h-full bg-[#050914] radar-grid overflow-hidden">
        
        {/* Animated 360° Radar Sweep Beam */}
        {showRadarSweep && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-[800px] h-[800px] rounded-full border border-cyan-500/15 relative">
              <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-75"></div>
              <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-50"></div>
              <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-25"></div>
              {/* Rotating Sweep Gradient */}
              <div 
                className="absolute inset-0 rounded-full animate-radar-sweep"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, rgba(0, 240, 255, 0.35) 0deg, rgba(0, 240, 255, 0) 60deg, transparent 360deg)'
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Map Grid Coordinates Watermark */}
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-cyan-500/40 pointer-events-none z-10">
          GRID: 19.0760° N, 72.8777° E • PESO TELEMATICS SENSOR V4.2
        </div>

        {/* Depots Markers */}
        {depots.map(depot => {
          const top = latToPercent(depot.latitude);
          const left = lngToPercent(depot.longitude);
          return (
            <div
              key={depot.id}
              style={{ top: `${top}%`, left: `${left}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-15 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/30 border-2 border-purple-400 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-500/30">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 px-2 py-1 rounded text-[10px] font-bold text-purple-300 border border-purple-500/40 whitespace-nowrap shadow-xl">
                {depot.name} ({depot.city})
              </div>
            </div>
          );
        })}

        {/* Customer Location Pin */}
        {customerLocation && (
          <div
            style={{
              top: `${latToPercent(customerLocation.lat)}%`,
              left: `${lngToPercent(customerLocation.lng)}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
          >
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-orange-500/30 animate-ping"></span>
              <div className="w-9 h-9 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-orange-500/50">
                <MapPin className="w-5 h-5 fill-white" />
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-slate-950/90 px-2.5 py-1 rounded-xl text-[10px] font-bold text-orange-400 border border-orange-500/40 whitespace-nowrap shadow-2xl">
              📍 Delivery Destination
            </div>
          </div>
        )}

        {/* Dynamic Tanker Markers */}
        {filteredTankers.map(tanker => {
          const lat = parseFloat(tanker.latitude as string);
          const lng = parseFloat(tanker.longitude as string);
          const top = latToPercent(lat);
          const left = lngToPercent(lng);
          const isSelected = selectedTanker?.id === tanker.id;

          return (
            <div
              key={tanker.id}
              onClick={() => onSelectTanker(tanker)}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                transition: 'top 2.5s ease-out, left 2.5s ease-out'
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-25 cursor-pointer group ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              {/* Radar pulse aura */}
              {tanker.status === 'IN_TRANSIT' && (
                <span className="absolute -inset-3 rounded-full bg-cyan-400/30 animate-ping pointer-events-none"></span>
              )}
              {tanker.status === 'DISPENSING' && (
                <span className="absolute -inset-3 rounded-full bg-orange-400/30 animate-ping pointer-events-none"></span>
              )}

              {/* Tanker Pill Icon */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-xl backdrop-blur-md transition-all ${getStatusColor(tanker.status)}`}>
                <Truck className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold font-mono">{tanker.code}</span>
                {parseFloat(tanker.speed_kmh as string || '0') > 0 && (
                  <span className="text-[9px] opacity-90 font-mono">
                    {Math.round(parseFloat(tanker.speed_kmh as string))}kph
                  </span>
                )}
              </div>

              {/* Hover Tooltip / Mini HUD */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col gap-1 w-48 p-2.5 rounded-xl bg-slate-950/95 border border-cyan-500/30 text-[10px] text-slate-300 shadow-2xl pointer-events-none z-50">
                <div className="flex items-center justify-between font-bold text-slate-100 border-b border-white/10 pb-1">
                  <span>{tanker.name}</span>
                  <span className="text-cyan-400 font-mono">{tanker.fuel_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-slate-100">{tanker.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fuel Remaining:</span>
                  <span className="font-mono text-emerald-400">{Math.round(parseFloat(tanker.current_litres as string))} L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Temp / Sensor:</span>
                  <span className="font-mono text-amber-300">{tanker.tank_temp_c}°C • Calib: {tanker.nozzle_calibration_pct}%</span>
                </div>
                {tanker.destination && (
                  <div className="text-[9px] text-slate-400 truncate pt-1 border-t border-white/5">
                    Dest: {tanker.destination}
                  </div>
                )}
              </div>
            </div>
          );
        })}

      </div>

      {/* Bottom Telematics Preview Ribbon (if a tanker is selected) */}
      {selectedTanker && (
        <div className="bg-slate-950/90 border-t border-white/10 p-3 px-5 flex flex-wrap items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-display">{selectedTanker.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(selectedTanker.status)}`}>
                  {selectedTanker.status}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Driver: <strong className="text-slate-200">{selectedTanker.driver_name || 'Assigned Driver'}</strong> • Capacity: <strong className="text-slate-200">{selectedTanker.capacity_litres}L {selectedTanker.fuel_type}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-500 block">SPEED</span>
                <span className="font-mono font-bold text-slate-200">{selectedTanker.speed_kmh || 0} km/h</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-500 block">TANK TEMP</span>
                <span className="font-mono font-bold text-slate-200">{selectedTanker.tank_temp_c || 24.2}°C</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-500 block">CALIBRATION</span>
                <span className="font-mono font-bold text-emerald-400">±0.01% (PESO)</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
