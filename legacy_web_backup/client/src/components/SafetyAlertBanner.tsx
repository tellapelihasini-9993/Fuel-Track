import React from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface SafetyAlertBannerProps {
  alert: any;
  onDismiss: () => void;
  onResolve?: (alertId: string) => void;
}

export const SafetyAlertBanner: React.FC<SafetyAlertBannerProps> = ({ alert, onDismiss, onResolve }) => {
  if (!alert) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-4xl mx-auto rounded-2xl bg-red-950/95 border-2 border-red-500 p-4 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-4 text-white animate-bounce">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-red-600 text-white animate-pulse">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded">
              EMERGENCY SOS ALERT
            </span>
            <span className="text-sm font-bold font-mono">{alert.check_type}</span>
          </div>
          <p className="text-xs text-red-200 mt-0.5">
            {alert.description} • Driver: {alert.driver_name || 'Assigned Driver'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onResolve && alert.id && (
          <button
            onClick={() => onResolve(alert.id)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Acknowledge & Resolve
          </button>
        )}
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
