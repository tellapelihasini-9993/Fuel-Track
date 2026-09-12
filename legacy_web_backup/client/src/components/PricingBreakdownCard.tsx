import React from 'react';
import { ShieldCheck, Info, Check, Sparkles, TrendingDown } from 'lucide-react';

interface PricingBreakdownCardProps {
  litres: number;
  ratePerLitre: number;
  fuelType: string;
  city?: string;
}

export const PricingBreakdownCard: React.FC<PricingBreakdownCardProps> = ({
  litres,
  ratePerLitre,
  fuelType,
  city = 'Mumbai'
}) => {
  const fuelSubtotal = Math.round((litres * ratePerLitre + Number.EPSILON) * 100) / 100;
  const deliveryFee = 50.00;
  const platformMarkup = 0.00;
  const totalAmount = Math.round((fuelSubtotal + deliveryFee + platformMarkup + Number.EPSILON) * 100) / 100;

  // Third party estimated surge comparison (+25% markup + ₹300 delivery)
  const thirdPartyMarkup = Math.round(fuelSubtotal * 0.25);
  const thirdPartyFee = 350;
  const thirdPartyTotal = Math.round(fuelSubtotal + thirdPartyMarkup + thirdPartyFee);
  const totalSaved = Math.max(0, thirdPartyTotal - totalAmount);

  return (
    <div className="rounded-2xl cyber-glass border border-orange-500/30 p-5 shadow-2xl relative overflow-hidden group">
      
      {/* Ambient background glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-all"></div>
      
      {/* Header with Zero-Markup Seal */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-display">Zero-Hidden-Fee Price Calculation</h3>
            <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-3 h-3" /> PESO Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Official daily rate for <strong className="text-slate-200">{city}</strong> • No surge, no hidden surge taxes
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Rate Locked</span>
          <span className="text-sm font-bold font-mono text-orange-400">₹{ratePerLitre.toFixed(2)}/L</span>
        </div>
      </div>

      {/* Itemized Calculation Formula */}
      <div className="space-y-2.5 text-xs text-slate-300">
        
        {/* Line 1: Fuel Subtotal */}
        <div className="flex items-center justify-between py-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span>Fuel Subtotal ({litres} L × ₹{ratePerLitre.toFixed(2)})</span>
          </div>
          <span className="font-mono font-bold text-slate-100 text-sm">₹{fuelSubtotal.toFixed(2)}</span>
        </div>

        {/* Line 2: Delivery Fee */}
        <div className="flex items-center justify-between py-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Doorstep Safety Delivery Fee</span>
            <span className="text-[10px] text-slate-500">(PESO-Compliant Mobile Tanker)</span>
          </div>
          <span className="font-mono font-bold text-slate-100 text-sm">₹{deliveryFee.toFixed(2)}</span>
        </div>

        {/* Line 3: Platform Markup (PROMINENT ZERO) */}
        <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Platform Surge Markup</span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200">
              Guaranteed Zero
            </span>
          </div>
          <span className="font-mono font-black text-emerald-400 text-base">₹0.00</span>
        </div>

      </div>

      {/* Final Total Amount Block */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Final Payable Total</span>
          <span className="text-[11px] text-slate-500">Includes all statutory PESO safety protocols</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
            ₹{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Zero Markup Comparison Callout */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-slate-400">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <span>Estimated savings vs unregulated third-party apps:</span>
        </div>
        <span className="font-bold font-mono text-emerald-400">~₹{totalSaved.toLocaleString()} Saved</span>
      </div>

    </div>
  );
};
