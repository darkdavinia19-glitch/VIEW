import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Ticket, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { formatAmount } from '../lib/money';
import confetti from 'canvas-confetti';
import { playChime } from '../lib/sound';

interface PromoViewProps {
  store: FaucetStore;
}

export const PromoView: React.FC<PromoViewProps> = ({ store }) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [dailyStatus, setDailyStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const currentUser = store.getCurrentUser();
  const state = store.getState();
  const streak = currentUser ? (currentUser.dailyBonusStreak || 1) : 1;

  function handleClaimDaily() {
    playChime('click');
    if (!currentUser) {
      setDailyStatus({ ok: false, message: 'Please Sign In or Register to claim daily streak bonuses.' });
      return;
    }
    const res = store.claimDailyBonus();
    if (res.ok) {
      playChime('claim');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      setDailyStatus(res);
    } else {
      playChime('error');
      setDailyStatus(res);
    }
  }

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoInput.trim()) return;

    playChime('click');
    const res = store.redeemPromoCode(promoInput);
    if (res.ok) {
      playChime('claim');
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
      setPromoInput('');
    } else {
      playChime('error');
    }
    setPromoStatus(res);
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
          <Flame className="w-3.5 h-3.5" />
          <span>Loyalty Streaks & Special Vouchers</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Daily Streak Bonus & Promo Codes</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Maintain your continuous login streak for multiplier bonuses, or enter official community voucher codes.
        </p>
      </div>

      {/* Daily Streak Section */}
      <section className="card-glow rounded-2xl p-6 bg-[#131627] border border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">7-Day Login Streak Multiplier</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Current: Day {streak}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Claim once every 24 hours to scale your DOGE payout from 0.05 to 0.35 DOGE!
            </p>
          </div>

          <button
            onClick={handleClaimDaily}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            <span>Claim Day {streak} Bonus</span>
          </button>
        </div>

        {dailyStatus && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-medium border ${
            dailyStatus.ok 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}>
            {dailyStatus.message}
          </div>
        )}

        {/* Streak Step Progress */}
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isCompleted = day < streak;
            const isCurrent = day === streak;
            const dogeReward = (0.05 * day).toFixed(2);

            return (
              <div
                key={day}
                className={`p-3 rounded-xl border text-center transition flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/10 scale-102'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-black/30 border-white/5 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-mono font-semibold uppercase">Day {day}</div>
                <div className="my-1 text-sm font-bold">
                  {isCompleted ? '✓' : `+${dogeReward}`}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">DOGE</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Promo Code Section */}
      <section className="card-glow rounded-2xl p-6 bg-[#131627] border border-white/10">
        <div className="flex items-center gap-2.5 mb-2">
          <Ticket className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Redeem Official Promo Code</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Got a campaign code from Twitter/X, Telegram, or Discord? Enter it below.
        </p>

        <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. WELCOME100, SATOSHI2026..."
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 uppercase font-mono tracking-wider outline-none focus:border-cyan-400 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition font-sans flex items-center justify-center gap-1.5"
          >
            <span>Apply Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {promoStatus && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-medium border max-w-xl ${
            promoStatus.ok 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}>
            {promoStatus.message}
          </div>
        )}

        {/* Demo Active Promo Code Chips to Try */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Available Test Promo Codes (Click to copy & apply):
          </div>
          <div className="flex flex-wrap gap-2">
            {state.promoCodes.map((p) => {
              const coin = state.coins.find((c) => c.symbol === p.coin)!;
              const hasRedeemed = currentUser ? p.redeemedBy.includes(currentUser.id) : false;
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => setPromoInput(p.code)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition ${
                    hasRedeemed
                      ? 'bg-white/5 border-white/5 text-slate-500 line-through'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                  }`}
                >
                  <span className="font-bold">{p.code}</span>
                  <span className="text-[10px] text-slate-400">
                    (+{formatAmount(p.amount, coin.decimals)} {p.coin})
                  </span>
                  {hasRedeemed && <span className="text-[9px] text-slate-500">Redeemed</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
