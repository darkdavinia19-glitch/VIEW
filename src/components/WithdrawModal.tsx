import React, { useState } from 'react';
import { 
  X, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Info 
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { CoinSymbol } from '../types/faucet';
import { formatAmount, toBaseUnits } from '../lib/money';
import { playChime } from '../lib/sound';

interface WithdrawModalProps {
  store: FaucetStore;
  initialCoin: CoinSymbol;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  store,
  initialCoin,
  onClose,
}) => {
  const [selectedCoin, setSelectedCoin] = useState<CoinSymbol>(initialCoin);
  const [address, setAddress] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const currentUser = store.getCurrentUser();
  const state = store.getState();
  const coin = state.coins.find((c) => c.symbol === selectedCoin)!;
  const balance = currentUser 
    ? store.getBalance(currentUser.id, selectedCoin) 
    : { coin: selectedCoin, available: 0n, pending: 0n, lifetime: 0n };

  function handleSetMax() {
    setAmountStr(formatAmount(balance.available, coin.decimals));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!currentUser) {
      setStatus({ ok: false, message: 'Please Sign In or Create an Account first to request a withdrawal.' });
      return;
    }

    try {
      const parsedAmount = toBaseUnits(amountStr, coin.decimals);
      const res = store.requestWithdrawal(selectedCoin, parsedAmount, address);

      if (res.ok) {
        playChime('success');
        setStatus(res);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        playChime('error');
        setStatus(res);
      }
    } catch (err: any) {
      playChime('error');
      setStatus({ ok: false, message: err.message || 'Invalid amount formatted.' });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131627] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
            style={{ backgroundColor: coin.iconColor }}
          >
            {coin.symbol[0]}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Withdraw Cryptocurrency</h3>
            <span className="text-[11px] text-slate-400">Request payout to self-custody wallet</span>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mb-4 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 text-purple-400 mt-0.5" />
          <span>
            <strong>DEMO LEDGER:</strong> Withdrawals will be placed in the Admin Review queue. You can approve or simulate complete on-chain confirmation in the Admin tab!
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Select Coin */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Asset</label>
            <select
              value={selectedCoin}
              onChange={(e) => {
                setSelectedCoin(e.target.value as CoinSymbol);
                setAmountStr('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white outline-none focus:border-cyan-400"
            >
              {state.coins.map((c) => {
                const avail = currentUser ? store.getBalance(currentUser.id, c.symbol).available : 0n;
                return (
                  <option key={c.symbol} value={c.symbol}>
                    {c.name} ({c.symbol}) — Avail: {formatAmount(avail, c.decimals)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Destination Address ({coin.payoutNetwork})
            </label>
            <input
              type="text"
              placeholder={`Enter your ${coin.symbol} address...`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
              <span>Withdraw Amount</span>
              <button
                type="button"
                onClick={handleSetMax}
                className="text-cyan-400 hover:text-cyan-300 text-[10px] uppercase font-bold"
              >
                Max ({formatAmount(balance.available, coin.decimals)})
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="0.00000000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 outline-none focus:border-cyan-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                {coin.symbol}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Min withdrawal:</span>
              <span className="font-mono text-slate-300">
                {formatAmount(coin.minWithdrawal, coin.decimals)} {coin.symbol}
              </span>
            </div>
          </div>

          {status && (
            <div className={`p-3 rounded-xl text-xs font-medium border ${
              status.ok 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}>
              {status.message}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 transition shadow-lg mt-2"
          >
            Submit Withdrawal Request
          </button>
        </form>

      </div>
    </div>
  );
};
