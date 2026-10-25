import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Coins, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Flame, 
  MousePointerClick, 
  ShieldCheck, 
  Sparkles, 
  Timer, 
  TrendingUp, 
  Users, 
  Wallet,
  Play,
  RotateCw,
  Gift
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { CoinSymbol, LiveWorkEvent } from '../types/faucet';
import { ClaimCard } from './ClaimCard';
import { formatAmount, formatUsdValue } from '../lib/money';
import confetti from 'canvas-confetti';
import { playChime } from '../lib/sound';

interface LiveWorkBoardProps {
  store: FaucetStore;
  onNavigateTab: (tab: string) => void;
  onSelectWithdraw: (coin: CoinSymbol) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const LiveWorkBoard: React.FC<LiveWorkBoardProps> = ({
  store,
  onNavigateTab,
  onSelectWithdraw,
  onOpenAuthModal,
}) => {
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'CLAIM' | 'OFFERWALL' | 'WITHDRAWAL'>('ALL');
  const [activeWorkTab, setActiveWorkTab] = useState<'all' | 'faucets' | 'offerwalls' | 'ptc'>('all');
  const [batchClaiming, setBatchClaiming] = useState(false);
  const [postbackToast, setPostbackToast] = useState<string | null>(null);

  const state = store.getState();
  const currentUser = store.getCurrentUser();
  const isLoggedIn = store.isLoggedIn();
  const liveEvents = store.getLiveWorkEvents();

  // Calculate worker total portfolio
  let totalBalanceUsd = 0;
  if (currentUser) {
    state.coins.forEach((c) => {
      const bal = store.getBalance(currentUser.id, c.symbol);
      const formatted = formatAmount(bal.available, c.decimals);
      totalBalanceUsd += parseFloat(formatted) * c.usdPrice;
    });
  }

  // Filter live activities
  const filteredEvents = liveEvents.filter((ev) => {
    if (feedFilter === 'ALL') return true;
    return ev.type === feedFilter;
  });

  // Batch claim all ready coins
  async function handleBatchClaimReady() {
    setBatchClaiming(true);
    playChime('click');

    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal('login');
      else alert('Please Sign In first to claim micro-rewards!');
      setBatchClaiming(false);
      return;
    }

    const readyCoins = state.coins.filter((c) => {
      const nextTime = store.getNextClaimTime(currentUser.id, c.symbol);
      const capReached = store.getClaimsToday(currentUser.id, c.symbol) >= c.dailyClaimCap;
      return (!nextTime || nextTime <= new Date()) && !capReached;
    });

    if (readyCoins.length === 0) {
      alert('All faucets are currently on cooldown or daily limit. Check back shortly!');
      setBatchClaiming(false);
      return;
    }

    let successCount = 0;
    for (const coin of readyCoins) {
      const res = await store.performClaim(coin.symbol);
      if (res.ok) successCount++;
    }

    if (successCount > 0) {
      playChime('claim');
      confetti({
        particleCount: 75,
        spread: 85,
        origin: { y: 0.6 },
      });
    }

    setBatchClaiming(false);
  }

  // 1-click simulate offerwall task reward
  function handleQuickOfferwallClaim(providerId: string, name: string) {
    playChime('click');
    const res = store.simulateOfferwallPostback(providerId, '0.40');
    if (res.ok) {
      playChime('claim');
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
      setPostbackToast(`Task verified via ${name}! +0.40 credited to wallet.`);
      setTimeout(() => setPostbackToast(null), 3500);
    }
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Live Operations Center */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#11162b] via-[#101323] to-[#15122a] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-gradient-to-r from-emerald-500/15 via-cyan-500/20 to-purple-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3"></span>
              <span>LIVE OPERATIONS ACTIVE • REAL-TIME WORK BOARD</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Live Work Board & Instant Tasks
            </h1>
            <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Earn cryptocurrency in real time through atomic faucet claims, verified survey offerwalls, 
              and sponsored tasks. All earnings transfer to your wallet with guaranteed <strong>0.1 min withdrawal</strong> limit.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBatchClaimReady}
              disabled={batchClaiming}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition transform active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{batchClaiming ? 'Claiming All...' : 'Claim All Ready Faucets'}</span>
            </button>

            <button
              onClick={() => onSelectWithdraw('DOGE')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw (Min 0.1)</span>
            </button>
          </div>
        </div>

        {/* Live Network Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="card-glow rounded-2xl p-3.5 bg-black/40 border border-white/5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Online Earners</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
              3,184 Active
            </div>
            <div className="text-[10px] text-emerald-400">● Live on Network</div>
          </div>

          <div className="card-glow rounded-2xl p-3.5 bg-black/40 border border-white/5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Tasks Done Today</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-300 font-mono mt-0.5">
              4,821 Claims
            </div>
            <div className="text-[10px] text-slate-400">Cooldown Protected</div>
          </div>

          <div className="card-glow rounded-2xl p-3.5 bg-black/40 border border-white/5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Payouts</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
              $18,492.50
            </div>
            <div className="text-[10px] text-emerald-300">Instant / FaucetPay / Direct</div>
          </div>

          <div className="card-glow rounded-2xl p-3.5 bg-black/40 border border-white/5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Min Withdrawal</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 font-mono mt-0.5">
              0.1 Base Units
            </div>
            <div className="text-[10px] text-slate-400">All 6 Supported Coins</div>
          </div>
        </div>
      </section>

      {/* Postback Toast Alert */}
      {postbackToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{postbackToast}</span>
          </div>
          <button 
            onClick={() => onSelectWithdraw('DOGE')} 
            className="text-white bg-emerald-500/30 px-3 py-1 rounded-xl text-[11px] font-bold hover:bg-emerald-500/40"
          >
            Go to Withdraw
          </button>
        </div>
      )}

      {/* Main Content: Left Task Board & Right Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Tasks & Faucets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Work Channel Navigation */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs">
              <button
                onClick={() => setActiveWorkTab('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  activeWorkTab === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Live Tasks
              </button>
              <button
                onClick={() => setActiveWorkTab('faucets')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  activeWorkTab === 'faucets'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Crypto Faucets (6)
              </button>
              <button
                onClick={() => setActiveWorkTab('offerwalls')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  activeWorkTab === 'offerwalls'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Top Offerwalls (5)
              </button>
              <button
                onClick={() => setActiveWorkTab('ptc')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  activeWorkTab === 'ptc'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PTC Surfing
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Fast Mode: {state.fastCooldownMode ? '10s Cooldown' : 'Standard'}
            </div>
          </div>

          {/* Section 1: Live Faucets Grid */}
          {(activeWorkTab === 'all' || activeWorkTab === 'faucets') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <span>Live Micro-Faucet Station</span>
                </h2>
                <button
                  onClick={() => onNavigateTab('faucets')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline flex items-center gap-1"
                >
                  View All Faucets <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.coins.slice(0, 4).map((coin) => (
                  <ClaimCard
                    key={coin.symbol}
                    coin={coin}
                    store={store}
                    onSelectWithdraw={onSelectWithdraw}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Top Offerwall Quick Tasks */}
          {(activeWorkTab === 'all' || activeWorkTab === 'offerwalls') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Live High-Paying Offerwall Networks</span>
                </h2>
                <button
                  onClick={() => onNavigateTab('offerwalls')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium hover:underline flex items-center gap-1"
                >
                  Configure Links (5) <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {state.offerwalls.slice(0, 4).map((ow) => (
                  <div
                    key={ow.id}
                    className="card-glow rounded-2xl p-4 bg-[#131627] border border-white/10 hover:border-purple-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-sm">{ow.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {ow.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {ow.description}
                      </p>
                      <div className="mt-2 text-xs font-mono font-bold text-emerald-400">
                        Avg: {ow.avgRewardRange}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <a
                        href={ow.customLink.replace('{USER_ID}', currentUser?.id || 'guest')}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1"
                      >
                        <span>Open Offerwall</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleQuickOfferwallClaim(ow.id, ow.name)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 transition flex items-center gap-1 cursor-pointer"
                        title="Simulate verified webhook postback"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Simulate Credit (+0.40)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Web3 PTC Surfing & Daily Streak */}
          {(activeWorkTab === 'all' || activeWorkTab === 'ptc') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-emerald-400" />
                  <span>Sponsored Web3 Surfing Tasks</span>
                </h2>
                <button
                  onClick={() => onNavigateTab('ptc')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline flex items-center gap-1"
                >
                  View All Ads <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {state.ptcAds.slice(0, 3).map((ad) => (
                  <div
                    key={ad.id}
                    className="card-glow rounded-xl p-3.5 bg-[#131627] border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-xs">{ad.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3 text-cyan-400" />
                          <span>{ad.durationS}s view</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          +{formatAmount(ad.rewardAmount, 8)} {ad.rewardCoin}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('ptc')}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Start Task</span>
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Live Work Stream & Worker Dashboard */}
        <div className="space-y-6">
          
          {/* Worker Active Session Box */}
          <div className="card-glow rounded-3xl p-5 bg-[#131627] border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Active Worker Session
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Mainnet Ready
              </span>
            </div>

            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-white text-base">
                    {currentUser.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{currentUser.name}</div>
                    <div className="text-[11px] text-cyan-400 font-mono">{currentUser.email}</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Est. Portfolio Value</div>
                    <div className="text-base font-extrabold text-emerald-400 font-mono">
                      ${totalBalanceUsd.toFixed(4)} USD
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectWithdraw('DOGE')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Withdraw</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 10% Referral Link Box */}
                <div className="text-xs pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Your 10% Referral Link:</span>
                    <span className="text-purple-400 font-mono font-bold">{currentUser.referralCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/register?ref=${currentUser.referralCode}`}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[10px] text-slate-300 font-mono truncate outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${currentUser.referralCode}`);
                        alert('Referral link copied to clipboard!');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white transition whitespace-nowrap cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-300">
                  Sign in or register to accumulate crypto base units and access live withdrawals.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 transition cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Live Activity Stream */}
          <div className="card-glow rounded-3xl p-5 bg-[#131627] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <h3 className="font-bold text-white text-sm">Live Work Activity Stream</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-Time</span>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              {(['ALL', 'CLAIM', 'OFFERWALL', 'WITHDRAWAL'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFeedFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    feedFilter === filter
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {filter === 'ALL' ? 'All Activity' : filter}
                </button>
              ))}
            </div>

            {/* Scrollable Live Feed List */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 text-xs">
              {filteredEvents.map((ev) => {
                const isClaim = ev.type === 'CLAIM';
                const isOfferwall = ev.type === 'OFFERWALL';
                const isWithdrawal = ev.type === 'WITHDRAWAL';
                const isPtc = ev.type === 'PTC';

                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">{ev.userName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                          isWithdrawal
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isOfferwall
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {ev.type}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {ev.taskTitle || (isClaim ? `Faucet claim verified` : 'Payout processed')}
                      </div>

                      {ev.networkRef && (
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                          Ref: {ev.networkRef}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`font-mono font-bold ${
                        isWithdrawal ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {ev.amountFormatted}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {ev.usdValue}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-1">
              <span className="text-[10px] text-slate-500">
                Auto-syncing live blocks via Supabase Real-Time Channel
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
