import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { CustomerHubPage } from './pages/CustomerHubPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { DispatcherAdminPage } from './pages/DispatcherAdminPage';
import { StationOwnerPage } from './pages/StationOwnerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Fuel, ShieldCheck, Heart, Radio, ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');

  const renderContent = () => {
    switch (currentTab) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentTab} />;
      case 'customer':
        return <CustomerHubPage />;
      case 'driver':
        return <DriverDashboardPage />;
      case 'dispatcher':
        return <DispatcherAdminPage />;
      case 'owner':
        return <StationOwnerPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'audit':
        return <AuditLogsPage />;
      case 'login':
        return <LoginPage onSuccess={() => setCurrentTab('customer')} onNavigateRegister={() => setCurrentTab('register')} />;
      case 'register':
        return <RegisterPage onSuccess={() => setCurrentTab('customer')} onNavigateLogin={() => setCurrentTab('login')} />;
      default:
        return <LandingPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative">
      
      {/* Ambient background glowing orbs */}
      <div className="ambient-orb w-96 h-96 bg-orange-500/10 top-0 left-1/4 fixed pointer-events-none rounded-full blur-3xl"></div>
      <div className="ambient-orb w-96 h-96 bg-cyan-500/10 top-1/3 right-10 fixed pointer-events-none rounded-full blur-3xl"></div>
      <div className="ambient-orb w-[500px] h-[500px] bg-emerald-500/5 bottom-10 left-10 fixed pointer-events-none rounded-full blur-3xl"></div>

      {/* Top Navbar */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Dynamic Main Body View */}
      <main className="flex-1 w-full relative z-10">
        {renderContent()}
      </main>

      {/* Operations Footer */}
      <footer className="w-full cyber-glass border-t border-white/10 py-6 px-4 text-xs text-slate-400 relative z-10 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Fuel className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200">FuelTrack™ Doorstep Energy Network</span>
              <span className="text-[10px] block text-slate-500">
                Statutory PESO compliance support • Zero platform markup guaranteed
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button onClick={() => setCurrentTab('customer')} className="hover:text-orange-400 transition">Customer Hub</button>
            <button onClick={() => setCurrentTab('driver')} className="hover:text-emerald-400 transition">Driver HUD</button>
            <button onClick={() => setCurrentTab('dispatcher')} className="hover:text-cyan-400 transition">Ops Command</button>
            <button onClick={() => setCurrentTab('owner')} className="hover:text-amber-400 transition">Station Hub</button>
            <button onClick={() => setCurrentTab('audit')} className="hover:text-purple-400 transition">Audit Logs</button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            v2.4.0 • Node/React/Postgres/Socket.IO
          </div>
        </div>
      </footer>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
