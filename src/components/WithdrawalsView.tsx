import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  ExternalLink,
  Copy,
  Check,
  Coins
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { CoinSymbol } from '../types/faucet';
import { formatAmount, formatUsdValue, toBaseUnits } from '../lib/money';
import { playChime } from '../lib/sound';

interface WithdrawalsViewProps {
  store: FaucetStore;
  initialCoin?: CoinSymbol;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({ 
  store,
  initialCoin = 'DOGE',
  onOpenAuthModal,
}) => {
  const [selectedCoin, setSelectedCoin] = useState<CoinSymbol>(initialCoin);
  const [address, setAddress] = useState('');
  const [amountStr, setAmountStr] = useState('0.1');
  const [payoutMethod, setPayoutMethod] = useState<string>('Direct Wallet');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const state = store.getState();
  const currentUser = store.getCurrentUser();

  if (!currentUser) {
    return (
      <div className="card-glow rounded-3xl p-10 bg-[#131627] border border-white/10 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-lg">
          <ArrowUpRight className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Sign In to Request Withdrawals</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please sign in to your account or register to transfer your earned cryptocurrency to a self-custody or micro-wallet (Minimum withdrawal: 0.1).
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

  const coin = state.coins.find((c) => c.symbol === selectedCoin)!;
  const balance = store.getBalance(currentUser.id, selectedCoin);
  const userWithdrawals = state.withdrawals.filter((w) => w.userId === currentUser.id);

  function handleSetMin() {
    setAmountStr(formatAmount(coin.minWithdrawal, coin.decimals));
  }

  function handleSetMax() {
    setAmountStr(formatAmount(balance.available, coin.decimals));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    playChime('click');

    try {
      const parsedAmount = toBaseUnits(amountStr, coin.decimals);
      const res = store.requestWithdrawal(selectedCoin, parsedAmount, address, payoutMethod);

      if (res.ok) {
        playChime('success');
        setFeedback(res);
        setAddress('');
      } else {
        playChime('error');
        setFeedback(res);
      }
    } catch (err: any) {
      playChime('error');
      setFeedback({ ok: false, message: err.message || 'Invalid amount format.' });
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Cryptocurrency Withdrawal Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Withdrawal Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Transfer your faucet, PTC, and offerwall earnings. The minimum withdrawal threshold is strictly set to <strong>0.1</strong> base units.
        </p>
      </div>

      {/* Main Form & Guidelines Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 card-glow rounded-3xl p-6 sm:p-7 bg-[#131627] border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <span>New Withdrawal Request</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Asset Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Select Cryptocurrency Asset
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {state.coins.map((c) => {
                  const bal = store.getBalance(currentUser.id, c.symbol);
                  const isSelected = selectedCoin === c.symbol;

                  return (
                    <button
                      key={c.symbol}
                      type="button"
                      onClick={() => {
                        setSelectedCoin(c.symbol);
                        setAmountStr('0.1');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white mb-1"
                        style={{ backgroundColor: c.iconColor }}
                      >
                        {c.symbol[0]}
                      </div>
                      <span className="font-bold">{c.symbol}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {formatAmount(bal.available, c.decimals)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payout Method */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Payout Network / Destination Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['Direct Wallet', 'FaucetPay', 'Payeer'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayoutMethod(method)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                      payoutMethod === method
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Destination Address ({coin.payoutNetwork} Address or ID)
              </label>
              <input
                type="text"
                placeholder={
                  payoutMethod === 'FaucetPay'
                    ? 'Enter your FaucetPay linked email or coin address'
                    : payoutMethod === 'Payeer'
                    ? 'Enter Payeer Account ID (e.g. P10023456)'
                    : `Enter your public ${coin.symbol} address...`
                }
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white font-mono placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Amount with 0.1 Min Enforcement */}
            <div>
              <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                <span>Withdrawal Amount</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSetMin}
                    className="text-cyan-400 hover:underline text-[11px] font-mono font-bold"
                  >
                    Min: 0.1
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={handleSetMax}
                    className="text-emerald-400 hover:underline text-[11px] font-mono font-bold"
                  >
                    Max ({formatAmount(balance.available, coin.decimals)})
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  required
                  placeholder="0.10000000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white font-mono placeholder-slate-500 outline-none focus:border-cyan-400"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-cyan-400 text-xs">
                  {coin.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Minimum Threshold: 0.1 {coin.symbol}</span>
                </span>
                <span>
                  Est. Value: {formatUsdValue(balance.available, coin.decimals, coin.usdPrice)}
                </span>
              </div>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold border ${
                feedback.ok 
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300' 
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
              }`}>
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition transform active:scale-98"
            >
              Submit Withdrawal Request
            </button>
          </form>
        </div>

        {/* Right 1 Col: Rule & Payout Flow */}
        <div className="card-glow rounded-3xl p-6 bg-[#131627] border border-white/10 flex flex-col justify-between space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Withdrawal Rules & Pipeline</span>
            </h3>

            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  1
                </span>
                <div>
                  <strong className="text-white">Minimum 0.1 Threshold:</strong> You must request at least 0.1 units of your selected crypto coin.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  2
                </span>
                <div>
                  <strong className="text-white">Admin Queue:</strong> Requests are placed in <strong>PENDING</strong> status for fraud screening.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  3
                </span>
                <div>
                  <strong className="text-white">Blockchain Confirmation:</strong> Once processed, on-chain TxID is generated and status updates to <strong>COMPLETED</strong>.
                </div>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 font-mono">Available Balance:</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {formatAmount(balance.available, coin.decimals)} {coin.symbol}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono">
              Locked in Review: {formatAmount(balance.pending, coin.decimals)} {coin.symbol}
            </div>
          </div>
        </div>

      </div>

      {/* User's Withdrawal History Table */}
      <section className="card-glow rounded-3xl p-6 bg-[#131627] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">My Withdrawal History</h2>
            <p className="text-xs text-slate-400">Live status of your requested payouts</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 text-cyan-300">
            {userWithdrawals.length} Records
          </span>
        </div>

        {userWithdrawals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No withdrawal requests submitted yet. Use the form above to withdraw 0.1 or more!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-3">Request ID</th>
                  <th className="pb-3">Asset & Amount</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">TxID / Note</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {userWithdrawals.map((w) => {
                  const coinCfg = state.coins.find((c) => c.symbol === w.coin)!;

                  return (
                    <tr key={w.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 text-slate-400 text-[11px] font-sans">
                        {w.id}
                      </td>
                      <td className="py-3.5 font-bold text-emerald-400">
                        {formatAmount(w.amount, coinCfg.decimals)} {w.coin}
                      </td>
                      <td className="py-3.5 text-slate-300 text-[11px] truncate max-w-[140px]" title={w.address}>
                        {w.address}
                      </td>
                      <td className="py-3.5 text-slate-300 font-sans text-[11px]">
                        {w.payoutMethod || 'Direct Wallet'}
                      </td>
                      <td className="py-3.5 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          w.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          w.status === 'APPROVED' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 text-[11px] truncate max-w-[160px]">
                        {w.providerRef ? (
                          <div className="flex items-center gap-1 text-cyan-400" title={w.providerRef}>
                            <span>{w.providerRef.slice(0, 12)}...</span>
                            <button
                              onClick={() => handleCopy(w.providerRef!, w.id)}
                              className="hover:text-white"
                            >
                              {copiedId === w.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span>{w.reviewNote || 'In review queue'}</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right text-slate-400 text-[11px] font-sans">
                        {new Date(w.createdAt).toLocaleDateString()} {new Date(w.createdAt).toLocaleTimeString()}
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
