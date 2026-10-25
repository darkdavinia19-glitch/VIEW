import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { playChime } from '../lib/sound';

interface AuthModalProps {
  store: FaucetStore;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  store,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRefCode, setRegRefCode] = useState('FLOW-ALEX77');
  
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    playChime('click');

    const res = store.login(loginEmail);
    setBusy(false);

    if (res.ok) {
      playChime('success');
      setStatus(res);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } else {
      playChime('error');
      setStatus(res);
    }
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    playChime('click');

    const res = store.register(regName, regEmail, regRefCode);
    setBusy(false);

    if (res.ok) {
      playChime('success');
      setStatus(res);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } else {
      playChime('error');
      setStatus(res);
    }
  }

  function selectDemoAccount(email: string) {
    setLoginEmail(email);
    playChime('click');
    const res = store.login(email);
    if (res.ok) {
      playChime('success');
      setStatus(res);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121424] border border-cyan-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' 
              ? 'Sign in to access your ledger and wallet' 
              : 'Join FaucetFlow to claim micro-crypto rewards'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 mt-4 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('login');
                setStatus(null);
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                setMode('register');
                setStatus(null);
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`p-3 rounded-2xl text-xs font-semibold mb-4 border flex items-center gap-2 ${
            status.ok 
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}>
            {status.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 transition shadow-lg shadow-cyan-500/20 text-xs flex items-center justify-center gap-1.5"
            >
              <span>{busy ? 'Logging in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick 1-Click Demo Profiles */}
            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                1-Click Quick Demo Profiles:
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => selectDemoAccount('alex@faucetflow.io')}
                  className="w-full p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center font-bold text-[10px]">👑</span>
                    <div>
                      <div className="font-bold text-white text-[11px]">Alex Crypto (Admin)</div>
                      <div className="text-[9px] text-slate-400">alex@faucetflow.io • Full Admin & Review Access</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-500 text-slate-950 px-2 py-0.5 rounded-md">Log in</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectDemoAccount('elena@web3.dev')}
                  className="w-full p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center font-bold text-[10px]">🌟</span>
                    <div>
                      <div className="font-bold text-white text-[11px]">Elena Web3 (Referred Member)</div>
                      <div className="text-[9px] text-slate-400">elena@web3.dev • Pays 10% commission to Alex</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-400 text-slate-950 px-2 py-0.5 rounded-md">Log in</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectDemoAccount('tariq.bd@gmail.com')}
                  className="w-full p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center font-bold text-[10px]">👤</span>
                    <div>
                      <div className="font-bold text-white text-[11px]">Tariq Rahman (Standard User)</div>
                      <div className="text-[9px] text-slate-400">tariq.bd@gmail.com • Regular Earner</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-md">Log in</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                <span>Referral Code (Optional)</span>
                <span className="text-[10px] text-cyan-400">10% bonus link</span>
              </div>
              <div className="relative">
                <Share2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. FLOW-ALEX77"
                  value={regRefCode}
                  onChange={(e) => setRegRefCode(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white uppercase font-mono placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-cyan-400 mt-0.5" />
              <span>
                New registrations receive instant starter test balances to test faucets and the 0.1 withdrawal limit!
              </span>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white transition shadow-lg shadow-purple-500/20 text-xs flex items-center justify-center gap-1.5"
            >
              <span>{busy ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
