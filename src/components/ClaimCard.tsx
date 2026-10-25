import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Lock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { CoinConfig, CoinSymbol } from '../types/faucet';
import { FaucetStore } from '../lib/faucetStore';
import { formatAmount, formatUsdValue } from '../lib/money';
import { playChime } from '../lib/sound';

interface ClaimCardProps {
  coin: CoinConfig;
  store: FaucetStore;
  onSelectWithdraw?: (coin: CoinSymbol) => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  coin,
  store,
  onSelectWithdraw,
}) => {
  const [now, setNow] = useState(Date.now());
  const [claiming, setClaiming] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    details?: string;
  } | null>(null);

  const currentUser = store.getCurrentUser();
  const balance = currentUser 
    ? store.getBalance(currentUser.id, coin.symbol) 
    : { coin: coin.symbol, available: 0n, pending: 0n, lifetime: 0n };
  const nextClaimTime = currentUser ? store.getNextClaimTime(currentUser.id, coin.symbol) : null;
  const effectiveInterval = store.getEffectiveInterval(coin);
  const claimsToday = currentUser ? store.getClaimsToday(currentUser.id, coin.symbol) : 0;

  // Update clock every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingMs = nextClaimTime ? Math.max(0, nextClaimTime.getTime() - now) : 0;
  const remainingS = Math.ceil(remainingMs / 1000);
  const isCooldown = remainingS > 0;
  const isCapReached = claimsToday >= coin.dailyClaimCap;

  // Percentage of cooldown completed
  const progressPercent = isCooldown 
    ? Math.max(0, Math.min(100, ((effectiveInterval - remainingS) / effectiveInterval) * 100))
    : 100;

  async function handleClaim() {
    if (claiming || isCooldown || isCapReached) return;

    setClaiming(true);
    setClaimFeedback(null);
    playChime('click');

    try {
      const res = await store.performClaim(coin.symbol);

      if (res.ok && res.amount) {
        playChime('claim');
        
        // Trigger small celebratory confetti
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#38bdf8', '#a78bfa', '#4ade80', '#fbbf24']
        });

        const formatted = formatAmount(res.amount, coin.decimals);
        const satDetail = coin.decimals === 8 ? `(${res.amount.toString()} satoshis/base-units)` : '';
        
        let extra = '';
        if (res.commission && res.referrerName) {
          extra = ` • 10% commission (${formatAmount(res.commission, coin.decimals)} ${coin.symbol}) credited to ${res.referrerName}`;
        }

        setClaimFeedback({
          type: 'success',
          text: `+${formatted} ${coin.symbol} claimed! ${satDetail}`,
          details: extra || undefined,
        });
      } else {
        playChime('error');
        setClaimFeedback({
          type: 'error',
          text: res.reason || 'Claim failed.',
        });
      }
    } catch (e: any) {
      setClaimFeedback({
        type: 'error',
        text: e.message || 'An unexpected error occurred.',
      });
    } finally {
      setClaiming(false);
    }
  }

  // Base unit terminology
  const unitName = 
    coin.symbol === 'BTC' ? 'satoshis' :
    coin.symbol === 'LTC' ? 'litoshis' :
    coin.symbol === 'ETH' ? 'wei' : 'base units';

  return (
    <div className="card-glow rounded-2xl p-5 bg-[#131627] flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
      
      {/* Background ambient glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 pointer-events-none"
        style={{ backgroundColor: coin.iconColor }}
      />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-lg"
              style={{ backgroundColor: coin.iconColor }}
            >
              {coin.symbol[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base tracking-wide">{coin.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-white/10 text-slate-300 font-semibold">
                  {coin.symbol}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                1 {coin.symbol} ≈ ${coin.usdPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Your Balance</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {formatAmount(balance.available, coin.decimals)}
            </div>
            <div className="text-[10px] text-slate-400">
              {formatUsdValue(balance.available, coin.decimals, coin.usdPrice)}
            </div>
          </div>
        </div>

        {/* Reward Specs & Limits */}
        <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
          <div>
            <div className="text-[10px] text-slate-400">Claim Reward</div>
            <div className="font-medium text-slate-200 truncate font-mono">
              {formatAmount(coin.rewardMin, coin.decimals)} - {formatAmount(coin.rewardMax, coin.decimals)}
            </div>
            <div className="text-[10px] text-cyan-400/80">
              {coin.rewardMin.toString()} - {coin.rewardMax.toString()} {unitName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Interval & Cap</div>
            <div className="font-medium text-slate-200">
              Every {effectiveInterval >= 60 ? `${Math.round(effectiveInterval / 60)} min` : `${effectiveInterval}s`}
            </div>
            <div className="text-[10px] text-slate-400">
              {claimsToday} / {coin.dailyClaimCap} claims today
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {claimFeedback && (
          <div className={`p-2.5 rounded-xl mb-3 text-xs border ${
            claimFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-1.5 font-medium">
              {claimFeedback.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
              )}
              <span>{claimFeedback.text}</span>
            </div>
            {claimFeedback.details && (
              <p className="mt-1 text-[11px] text-purple-300 pl-5">
                {claimFeedback.details}
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Progress bar during cooldown */}
        {isCooldown && (
          <div className="mb-2">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3 text-cyan-400 animate-spin" /> Cooldown Active
              </span>
              <span>{Math.floor(remainingS / 60)}:{String(remainingS % 60).padStart(2, '0')}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Claim Action Button */}
        <button
          onClick={handleClaim}
          disabled={Boolean(claiming || (currentUser && (isCooldown || isCapReached)))}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
            !currentUser
              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:brightness-110 cursor-pointer shadow-md'
              : isCapReached
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : isCooldown
              ? 'bg-slate-800/80 text-slate-400 border border-white/5 cursor-not-allowed'
              : claiming
              ? 'bg-cyan-600 text-white animate-pulse'
              : 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 hover:shadow-cyan-500/25 hover:shadow-lg cursor-pointer transform active:scale-98'
          }`}
        >
          {!currentUser ? (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Sign In to Claim {coin.symbol}</span>
            </>
          ) : isCapReached ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Daily Cap Reached</span>
            </>
          ) : isCooldown ? (
            <>
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next Claim in {Math.floor(remainingS / 60)}:{String(remainingS % 60).padStart(2, '0')}</span>
            </>
          ) : claiming ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Processing Atomic Claim...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Claim Free {coin.symbol}</span>
            </>
          )}
        </button>

        {/* Footer info: network & withdrawal trigger */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[10px] text-slate-400">
          <span className="truncate max-w-[140px]">{coin.payoutNetwork}</span>
          {onSelectWithdraw && (
            <button
              onClick={() => onSelectWithdraw(coin.symbol)}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5 hover:underline"
            >
              Withdraw <ArrowUpRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
