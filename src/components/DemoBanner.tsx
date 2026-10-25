import React from 'react';
import { AlertCircle, Zap, RotateCcw, ShieldCheck } from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';

interface DemoBannerProps {
  store: FaucetStore;
  fastCooldown: boolean;
  demoMode: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  store,
  fastCooldown,
  demoMode,
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900 border-b border-purple-500/30 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-slate-300">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-semibold text-purple-300 tracking-wide uppercase text-[10px] bg-purple-900/50 px-2 py-0.5 rounded border border-purple-500/40">
          {demoMode ? 'DEMO TEST LEDGER' : 'PRODUCTION MODE'}
        </span>
        <span className="hidden sm:inline text-slate-300">
          Balances are a test ledger and cannot be withdrawn to mainnet.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => store.toggleFastCooldown()}
          title="Toggle between instant 10s cooldown for testing and real multi-minute production intervals"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium border ${
            fastCooldown
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Fast Testing Cooldown: {fastCooldown ? '10s (Active)' : 'Standard (3-10m)'}</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Reset demo state to initial seed balances?')) {
              store.resetToSeed();
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs"
          title="Reset balances and test database"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Reset Ledger</span>
        </button>
      </div>
    </div>
  );
};
