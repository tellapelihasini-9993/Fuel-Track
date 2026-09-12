import React, { useState } from 'react';
import { Fuel, ShieldCheck, Zap, Truck, Radio, Store, ArrowRight, CheckCircle2, TrendingDown, Sparkles, Navigation, PhoneCall, Gauge } from 'lucide-react';
import { PricingBreakdownCard } from '../components/PricingBreakdownCard';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [sliderLitres, setSliderLitres] = useState<number>(35);
  const [selectedFuel, setSelectedFuel] = useState<'PETROL' | 'DIESEL' | 'CNG'>('PETROL');

  const fuelRates = {
    PETROL: 104.21,
    DIESEL: 92.15,
    CNG: 86.50
  };

  const presets = [
    { label: '🚗 Car Top-Up', volume: 35, fuel: 'PETROL' as const, desc: 'Average passenger sedan/SUV' },
    { label: '🏍️ Bike Quick Fuel', volume: 10, fuel: 'PETROL' as const, desc: 'Two-wheeler doorstep tank' },
    { label: '🚚 Logistics Fleet', volume: 80, fuel: 'DIESEL' as const, desc: 'Commercial transit vans' },
    { label: '⚡ Standby DG Set', volume: 50, fuel: 'DIESEL' as const, desc: 'Hospital & tech park backup' },
    { label: '🚜 Heavy Agri Unit', volume: 120, fuel: 'DIESEL' as const, desc: 'Harvesters & earthmovers' },
  ];

  return (
    <div className="min-h-screen text-slate-100 space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 max-w-7xl mx-auto text-center space-y-6">
        
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-cyan-500/20 blur-3xl pointer-events-none rounded-full"></div>

        {/* PESO & Zero-Markup Highlight Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full cyber-glass border border-orange-500/40 text-xs font-bold shadow-lg shadow-orange-500/10 animate-bounce">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 font-display">
            PESO-Ready Doorstep Energy Infrastructure
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-emerald-400 font-mono">₹0 Surge Markup</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-display max-w-4xl mx-auto leading-tight">
          Fuel at your doorstep. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300">
            Zero Hidden Fees.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Order certified petrol, diesel, and CNG straight to your vehicle, commercial fleet, generator, or farm equipment. Strictly official rates + flat ₹50 safety delivery.
        </p>

        {/* Live Daily Fuel Rate Ticker */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div className="px-4 py-2 rounded-2xl cyber-glass border border-white/10 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span className="text-slate-400 font-semibold">Petrol (Mumbai):</span>
            <span className="font-mono font-bold text-orange-400 text-sm">₹104.21/L</span>
          </div>
          <div className="px-4 py-2 rounded-2xl cyber-glass border border-white/10 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400 font-semibold">Diesel (Mumbai):</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">₹92.15/L</span>
          </div>
          <div className="px-4 py-2 rounded-2xl cyber-glass border border-white/10 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 font-semibold">CNG (Mumbai):</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">₹86.50/kg</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('customer')}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm shadow-2xl shadow-orange-500/30 transition transform hover:scale-105 active:scale-95"
          >
            <Fuel className="w-5 h-5 fill-slate-950" /> Order Fuel Now (Doorstep)
          </button>
          <button
            onClick={() => onNavigate('dispatcher')}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl cyber-glass hover:bg-slate-800 text-slate-200 font-bold text-sm border border-cyan-500/30 shadow-xl transition"
          >
            <Radio className="w-5 h-5 text-cyan-400" /> Launch Ops Radar
          </button>
        </div>

      </section>

      {/* Interactive Fuel Price Calculator Widget */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="rounded-3xl cyber-glass border border-white/10 p-6 md:p-10 shadow-2xl space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
              Transparent Cost Estimator
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Drag the volume slider or click a preset below to see the exact zero-markup price formula
            </p>
          </div>

          {/* Vehicle Preset Quick Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSliderLitres(p.volume);
                  setSelectedFuel(p.fuel);
                }}
                className={`p-3 rounded-2xl text-left border transition ${
                  sliderLitres === p.volume && selectedFuel === p.fuel
                    ? 'bg-orange-500/20 border-orange-500/60 shadow-lg shadow-orange-500/20 text-white'
                    : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-100">{p.label}</div>
                <div className="text-[10px] text-orange-400 font-mono font-semibold mt-1">{p.volume} Litres ({p.fuel})</div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">{p.desc}</div>
              </button>
            ))}
          </div>

          {/* Fuel Type Switcher & Volume Slider */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4 border-t border-white/10">
            
            <div className="space-y-6">
              
              {/* Fuel Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider font-display">
                  1. Select Fuel Type:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PETROL', 'DIESEL', 'CNG'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFuel(f)}
                      className={`py-3 rounded-xl font-bold text-xs font-mono transition border ${
                        selectedFuel === f
                          ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md shadow-orange-500/30'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f} (₹{fuelRates[f]}/L)
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider (5L to 200L) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">
                    2. Quantity (Litres):
                  </label>
                  <span className="text-xl font-black font-mono text-orange-400">
                    {sliderLitres} <span className="text-xs text-slate-400 font-sans">Litres</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="1"
                  value={sliderLitres}
                  onChange={(e) => setSliderLitres(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>5L (Min)</span>
                  <span>50L (Mid)</span>
                  <span>100L</span>
                  <span>200L (Max Drop)</span>
                </div>
              </div>

            </div>

            {/* Live Pricing Breakdown Card Component */}
            <div>
              <PricingBreakdownCard
                litres={sliderLitres}
                ratePerLitre={fuelRates[selectedFuel]}
                fuelType={selectedFuel}
                city="Mumbai"
              />
            </div>

          </div>

        </div>
      </section>

      {/* 5-Role Ecosystem Navigation Showcase */}
      <section className="px-4 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
            Multi-User Operations Ecosystem
          </span>
          <h2 className="text-3xl font-black text-white font-display">
            Built for End-to-End Fuel Logistics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Customer */}
          <div 
            onClick={() => onNavigate('customer')}
            className="p-6 rounded-3xl cyber-glass border border-orange-500/20 hover:border-orange-500/60 shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
              <Fuel className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-1">Customer Fuel Hub</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Instant vehicle presets, dynamic volume slider, multi-channel checkout (UPI, Card, POD), and live 6-stage order tracking.
            </p>
            <span className="text-xs font-bold text-orange-400 flex items-center gap-1 group-hover:underline">
              Enter Customer Portal <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: Driver */}
          <div 
            onClick={() => onNavigate('driver')}
            className="p-6 rounded-3xl cyber-glass border border-emerald-500/20 hover:border-emerald-500/60 shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-1">Driver Command HUD</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Assigned tanker controls, simulated GPS location auto-pings, trip stage buttons, and IoT hardware nozzle simulator.
            </p>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:underline">
              Open Driver HUD <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: Dispatcher */}
          <div 
            onClick={() => onNavigate('dispatcher')}
            className="p-6 rounded-3xl cyber-glass border border-cyan-500/20 hover:border-cyan-500/60 shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-1">Ops Command Center</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              360° Rotating Radar, live tanker GPS telematics, nearest-tanker auto assignment, and emergency safety SOS alert manager.
            </p>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:underline">
              View Fleet Radar <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4: Station Owner */}
          <div 
            onClick={() => onNavigate('owner')}
            className="p-6 rounded-3xl cyber-glass border border-amber-500/20 hover:border-amber-500/60 shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-1">Station & Depot Hub</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Multi-depot storage tank liquid gauges, automatic low-stock triggers (&lt;25%), refill procurement, and transaction ledger.
            </p>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:underline">
              Inspect Depot Tanks <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

        </div>
      </section>

    </div>
  );
};
