import React, { useState } from 'react';
import { Fuel, Lock, Mail, User as UserIcon, Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onNavigateLogin }) => {
  const { register, isLoading } = useAuth();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role: 'customer'
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl cyber-glass border border-white/10 p-6 md:p-8 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white font-display">Create Customer Profile</h1>
            <p className="text-xs text-slate-400">Zero-markup doorstep fuel delivery account</p>
          </div>
          <button
            onClick={onNavigateLogin}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 00000"
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-orange-500/25 transition"
          >
            {isLoading ? 'Creating Profile...' : 'Complete Customer Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <button onClick={onNavigateLogin} className="text-orange-400 font-bold hover:underline">
            Log In
          </button>
        </div>

      </div>
    </div>
  );
};
