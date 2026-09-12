import React, { useState } from 'react';
import { Fuel, Radio, ShieldAlert, User as UserIcon, LogOut, ChevronDown, CheckCircle2, Zap, LayoutDashboard, Truck, Store, MapPin, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, quickLogin } = useAuth();
  const { isConnected } = useSocket();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    { role: 'customer', label: 'Customer', icon: Fuel, color: 'text-orange-400', desc: 'Doorstep Fuel Hub & Presets' },
    { role: 'driver', label: 'Driver', icon: Truck, color: 'text-emerald-400', desc: 'Driver HUD & IoT Dispenser' },
    { role: 'dispatcher', label: 'Dispatcher', icon: Radio, color: 'text-cyan-400', desc: 'Fleet Radar & Command Center' },
    { role: 'station_owner', label: 'Station Owner', icon: Store, color: 'text-amber-400', desc: 'Depot Tanks & Inventory' },
    { role: 'admin', label: 'Administrator', icon: ShieldAlert, color: 'text-purple-400', desc: 'System Telematics & Audit' },
  ];

  const handleRoleSwitch = async (role: UserRole) => {
    setRoleMenuOpen(false);
    await quickLogin(role);
    // Auto navigate to role's primary dashboard
    if (role === 'customer') onSelectTab('customer');
    else if (role === 'driver') onSelectTab('driver');
    else if (role === 'dispatcher' || role === 'admin') onSelectTab('dispatcher');
    else if (role === 'station_owner') onSelectTab('owner');
  };

  return (
    <nav className="sticky top-0 z-40 w-full cyber-glass border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-display">
                Fuel<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Track</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                ₹0 Markup
              </span>
            </div>
            <span className="text-[10px] block uppercase tracking-widest text-slate-400 font-semibold">
              Doorstep Fuel & Ops Command
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('landing')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'landing' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-orange-400" /> Home
          </button>
          <button
            onClick={() => onSelectTab('customer')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'customer' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5 text-orange-400" /> Order Fuel
          </button>
          <button
            onClick={() => onSelectTab('driver')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'driver' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" /> Driver HUD
          </button>
          <button
            onClick={() => onSelectTab('dispatcher')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'dispatcher' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" /> Ops Radar
          </button>
          <button
            onClick={() => onSelectTab('owner')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'owner' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-400" /> Depot Hub
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'analytics' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Analytics
          </button>
          <button
            onClick={() => onSelectTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'audit' ? 'bg-slate-700 text-slate-200 border border-white/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-300" /> Audit Log
          </button>
        </div>

        {/* Right Section: Socket Status, 1-Click Role Switcher, and Profile */}
        <div className="flex items-center gap-3">
          
          {/* Real-time WebSocket LED status */}
          <div 
            title={isConnected ? "Real-time Telematics WebSocket: Live" : "WebSocket: Reconnecting..."}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
              isConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className="hidden sm:inline">{isConnected ? 'LIVE RADAR' : 'OFFLINE'}</span>
          </div>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 transition"
            >
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="capitalize">{user?.role ? user.role.replace('_', ' ') : 'Select Role'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl cyber-glass border border-white/15 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
                  ⚡ 1-Click Role Switch (Demo Mode)
                </div>
                <div className="space-y-1 mt-1">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isActive = user?.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSwitch(r.role)}
                        className={`w-full flex items-start gap-3 p-2 rounded-xl text-left transition ${
                          isActive ? 'bg-orange-500/20 border border-orange-500/40 text-white' : 'hover:bg-slate-800/70 text-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-slate-900/80 ${r.color} mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-100">{r.label}</span>
                            {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">{r.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-slate-200">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSelectTab('login')}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition"
            >
              Login
            </button>
          )}

        </div>
      </div>
    </nav>
  );
};
