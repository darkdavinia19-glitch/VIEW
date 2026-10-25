import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Zap, 
  ArrowRight, 
  RotateCcw, 
  Activity, 
  Coins, 
  Layers, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { LiveWorkEvent } from '../types/faucet';

interface LiveNetworkBarProps {
  store: FaucetStore;
  onOpenLiveBoard: () => void;
}

export const LiveNetworkBar: React.FC<LiveNetworkBarProps> = ({
  store,
  onOpenLiveBoard,
}) => {
  const state = store.getState();
  const fastCooldown = state.fastCooldownMode;
  const events = store.getLiveWorkEvents();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Cycle through recent live activities
  useEffect(() => {
    if (events.length === 0) return;
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [events.length]);

  // Periodic community live activity ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      store.tickCommunityActivity();
    }, 14000);
    return () => clearInterval(ticker);
  }, [store]);

  const activeEvent: LiveWorkEvent | undefined = events[currentEventIndex];

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 via-[#0d1424] to-slate-900 border-b border-emerald-500/30 text-xs px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-slate-300">
      
      {/* Left: Live Network Beacon & Status */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="font-extrabold text-emerald-400 tracking-wider uppercase text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 shadow-sm">
          <span>● LIVE MAINNET ENGINE</span>
        </span>
        
        {/* Live Real-Time Activity Ticker */}
        {activeEvent && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 transition-all duration-500">
            <span className="text-slate-600">|</span>
            <span className="font-semibold text-white">{activeEvent.userName}</span>
            <span className="text-slate-400">
              {activeEvent.type === 'CLAIM' && 'claimed'}
              {activeEvent.type === 'OFFERWALL' && 'completed task'}
              {activeEvent.type === 'PTC' && 'viewed ad'}
              {activeEvent.type === 'WITHDRAWAL' && 'withdrew'}
            </span>
            <span className="font-mono font-bold text-cyan-400">{activeEvent.amountFormatted}</span>
            {activeEvent.usdValue && (
              <span className="text-[10px] text-slate-500 font-mono">({activeEvent.usdValue})</span>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Fast Mode Toggle, Online Earners, Open Live Board */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>3,184 Earners Active</span>
        </div>

        <button
          onClick={() => store.toggleFastCooldown()}
          title="Toggle between instant 10s cooldown for fast testing and standard intervals"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition text-xs font-medium border cursor-pointer ${
            fastCooldown
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fast Task Mode: {fastCooldown ? '10s (Active)' : 'Standard'}</span>
        </button>

        <button
          onClick={onOpenLiveBoard}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Open Live Work Board</span>
        </button>
      </div>

    </div>
  );
};
