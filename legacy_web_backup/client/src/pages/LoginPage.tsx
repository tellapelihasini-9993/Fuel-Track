import React, { useState } from 'react';
import { Fuel, Lock, Mail, User as UserIcon, Truck, Radio, Store, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateRegister }) => {
  const { login, quickLogin, isLoading } = useAuth();
  
  const [email, setEmail] = useState<string>('customer@fueltrack.io');
  const [password, setPassword] = useState<string>('password123');
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: 'customer' as const, label: 'Rahul Sharma (Customer)', email: 'customer@fueltrack.io', icon: Fuel, color: 'text-orange-400', desc: 'Doorstep Fuel Hub & Presets' },
    { role: 'driver' as const, label: 'Vikram Singh (Driver)', email: 'driver@fueltrack.io', icon: Truck, color: 'text-emerald-400', desc: 'Assigned Tanker TK-101 & IoT Pump' },
    { role: 'dispatcher' as const, label: 'Priya Deshmukh (Dispatcher)', email: 'dispatcher@fueltrack.io', icon: Radio, color: 'text-cyan-400', desc: '360° Radar & Routing Command' },
    { role: 'station_owner' as const, label: 'Anand Kulkarni (Owner)', email: 'owner@fueltrack.io', icon: Store, color: 'text-amber-400', desc: 'Depot Bulk Tanks & Low-Stock Alerts' },
    { role: 'admin' as const, label: 'System Admin (Superuser)', email: 'admin@fueltrack.io', icon: ShieldAlert, color: 'text-purple-400', desc: 'PESO Audit Trail & Rates Control' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError(null);
    try {
      await quickLogin(role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left: 1-Click Role Quick Login Matrix (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full cyber-glass border border-orange-500/30 text-[11px] font-bold text-orange-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Zero-Friction Demo Testing
            </div>
            <h1 className="text-3xl font-black text-white font-display">
              1-Click Operator Login
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select any role below to instantly load its dedicated operations cockpit and live database state.
            </p>
          </div>

          <div className="space-y-2.5">
            {demoAccounts.map(acc => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  onClick={() => handleQuickLogin(acc.role)}
                  className="w-full p-3.5 rounded-2xl cyber-glass border border-white/5 hover:border-orange-500/50 hover:bg-slate-800/80 transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl bg-slate-900 border border-white/5 ${acc.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center gap-2">
                        {acc.label}
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{acc.desc}</div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Traditional Email/Password Form (5 cols) */}
        <div className="md:col-span-5 rounded-3xl cyber-glass border border-white/10 p-6 md:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white font-display">Account Sign-In</h2>
            <p className="text-xs text-slate-400">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@fueltrack.io"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-orange-500/25 transition"
            >
              {isLoading ? 'Signing In...' : 'Sign In with Password'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={onNavigateRegister}
              className="text-orange-400 font-bold hover:underline"
            >
              Register Customer Profile
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
