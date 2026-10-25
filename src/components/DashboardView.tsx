import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Users, 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  Layers,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { CoinSymbol } from '../types/faucet';
import { formatAmount, formatUsdValue } from '../lib/money';

interface DashboardViewProps {
  store: FaucetStore;
  onNavigateTab: (tab: string) => void;
  onSelectWithdraw: (coin: CoinSymbol) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  store,
  onNavigateTab,
  onSelectWithdraw,
  onOpenAuthModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [txFilter, setTxFilter] = useState<string>('ALL');

  const state = store.getState();
  const currentUser = store.getCurrentUser();
  const coins = state.coins;

  if (!currentUser) {
    return (
      <div className="card-glow rounded-3xl p-10 bg-[#131627] border border-white/10 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-lg">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Sign In to Access Dashboard</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please sign in to view your multi-currency wallet balances, transaction ledger, active referrals, and withdrawal records.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : store.login('alex@faucetflow.io')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuthModal ? onOpenAuthModal('register') : store.login('alex@faucetflow.io')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Calculate portfolio value in USD
  let totalUsd = 0;
  coins.forEach((c) => {
    const bal = store.getBalance(currentUser.id, c.symbol);
    const formatted = formatAmount(bal.available + bal.pending, c.decimals);
    totalUsd += parseFloat(formatted) * c.usdPrice;
  });

  const userClaimsCount = state.claims.filter((c) => c.userId === currentUser.id).length;
  const userReferrals = state.users.filter((u) => u.referredById === currentUser.id);
  const userWithdrawals = state.withdrawals.filter((w) => w.userId === currentUser.id);
  const pendingUserWithdrawals = userWithdrawals.filter((w) => w.status === 'PENDING');
  const userTransactions = state.transactions.filter((t) => t.userId === currentUser.id);

  const refUrl = `${window.location.origin}/register?ref=${currentUser.referralCode}`;

  function handleCopy() {
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filteredTxs = userTransactions.filter((t) => {
    if (txFilter === 'ALL') return true;
    return t.type === txFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Profile & Portfolio Top Banner */}
      <section className="card-glow rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#181c33]/90 via-[#131627] to-[#1e153b]/90 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* User Details */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 border-2 border-white/20 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-cyan-500/20">
              {currentUser.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  currentUser.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {currentUser.role}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                <span>Account ID: <code className="text-cyan-400 font-mono">{currentUser.id}</code></span>
                <span>•</span>
                <span>Referral: <code className="text-purple-300 font-mono">{currentUser.referralCode}</code></span>
              </div>
            </div>
          </div>

          {/* Portfolio & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-8">
            <div>
              <div className="text-xs text-slate-400">Total Portfolio Value</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalUsd)}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                Minimum Withdrawal: 0.1 Unit
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('withdraw')}
              className="py-2.5 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw Funds</span>
            </button>
          </div>

        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card-glow rounded-2xl p-5 bg-[#131627] border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Faucet Claims</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            {userClaimsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Free rewards claimed</div>
        </div>

        <div className="card-glow rounded-2xl p-5 bg-[#131627] border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Referrals</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            {userReferrals.length}
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1">Earning 10% commission</div>
        </div>

        <div className="card-glow rounded-2xl p-5 bg-[#131627] border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            Day {currentUser.dailyBonusStreak || 1}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">Multiplier bonus active</div>
        </div>

        <div className="card-glow rounded-2xl p-5 bg-[#131627] border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pending Payouts</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {pendingUserWithdrawals.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Under risk review</div>
        </div>

      </div>

      {/* Referral Engine Banner */}
      <section className="card-glow rounded-3xl p-6 bg-gradient-to-r from-purple-950/40 via-[#131627] to-cyan-950/40 border border-purple-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              10% Lifetime Referral Program
            </span>
            <h2 className="text-lg font-bold text-white">Invite Friends & Earn Commission on All Claims</h2>
            <p className="text-xs text-slate-300">
              Share your personal link. Whenever friends claim from faucets, solve PTC ads, or complete offerwalls, you receive a 10% bonus from platform reserves.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 font-mono text-xs text-cyan-300 max-w-xs truncate">
              {refUrl}
            </div>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
              title="Copy Link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Wallet Balances Table */}
      <section className="card-glow rounded-3xl p-6 bg-[#131627] border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Wallet Balances</h2>
            <p className="text-xs text-slate-400">Enforced Minimum Withdrawal: 0.1 Unit</p>
          </div>

          <button
            onClick={() => onNavigateTab('withdraw')}
            className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Open Withdrawal Gateway</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-sans">
                <th className="pb-3">Asset</th>
                <th className="pb-3 text-right">Available Balance</th>
                <th className="pb-3 text-right">Pending Review</th>
                <th className="pb-3 text-right">Lifetime Total</th>
                <th className="pb-3 text-right">Min Withdraw</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coins.map((c) => {
                const bal = store.getBalance(currentUser.id, c.symbol);
                const canWithdraw = bal.available >= c.minWithdrawal;

                return (
                  <tr key={c.symbol} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: c.iconColor }}
                        >
                          {c.symbol[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-emerald-400 text-sm">
                      {formatAmount(bal.available, c.decimals)}
                    </td>
                    <td className="py-3.5 text-right text-amber-400">
                      {bal.pending > 0n ? formatAmount(bal.pending, c.decimals) : '—'}
                    </td>
                    <td className="py-3.5 text-right text-slate-300">
                      {formatAmount(bal.lifetime, c.decimals)}
                    </td>
                    <td className="py-3.5 text-right text-cyan-400 font-sans">
                      0.1 {c.symbol}
                    </td>
                    <td className="py-3.5 text-right font-sans">
                      <button
                        onClick={() => onSelectWithdraw(c.symbol)}
                        disabled={!canWithdraw}
                        title={!canWithdraw ? `Requires at least 0.1 ${c.symbol} to withdraw` : 'Withdraw to wallet'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          canWithdraw
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-md'
                            : 'bg-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Withdraw
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Transactions Ledger */}
      <section className="card-glow rounded-3xl p-6 bg-[#131627] border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Cryptographic Transaction Ledger</h2>
            <p className="text-xs text-slate-400">Immutable transaction history backed by unique idempotency keys</p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {['ALL', 'FAUCET_CLAIM', 'REFERRAL_COMMISSION', 'OFFERWALL', 'WITHDRAWAL', 'DAILY_BONUS'].map((f) => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                  txFilter === f
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredTxs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No transactions found for filter "{txFilter}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-sans">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Coin</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3">Idempotency Key</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTxs.slice(0, 12).map((tx) => {
                  const coin = coins.find((c) => c.symbol === tx.coin);
                  const isCredit = tx.amount >= 0n;
                  const absAmount = isCredit ? tx.amount : -tx.amount;
                  const formatted = coin ? formatAmount(absAmount, coin.decimals) : absAmount.toString();

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'FAUCET_CLAIM' ? 'bg-cyan-500/20 text-cyan-300' :
                          tx.type === 'OFFERWALL' ? 'bg-emerald-500/20 text-emerald-300' :
                          tx.type === 'REFERRAL_COMMISSION' ? 'bg-purple-500/20 text-purple-300' :
                          tx.type === 'WITHDRAWAL' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-white">{tx.coin}</td>
                      <td className={`py-3 text-right font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCredit ? '+' : '-'}{formatted} {tx.coin}
                      </td>
                      <td className="py-3 text-slate-400 text-[11px] truncate max-w-[200px]" title={tx.idempotencyKey}>
                        {tx.idempotencyKey}
                      </td>
                      <td className="py-3 text-right text-slate-400 text-[11px]">
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};
