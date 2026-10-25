import React, { useState } from 'react';
import { 
  Layers, 
  ExternalLink, 
  Link2, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Star,
  Info,
  Clock,
  Coins,
  ChevronRight,
  X
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { OfferwallProvider } from '../types/faucet';
import { formatAmount } from '../lib/money';
import confetti from 'canvas-confetti';
import { playChime } from '../lib/sound';

interface OfferwallsViewProps {
  store: FaucetStore;
}

export const OfferwallsView: React.FC<OfferwallsViewProps> = ({ store }) => {
  const [editingProvider, setEditingProvider] = useState<OfferwallProvider | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [testingModal, setTestingModal] = useState<OfferwallProvider | null>(null);
  const [testAmountInput, setTestAmountInput] = useState('0.35');

  const state = store.getState();
  const currentUser = store.getCurrentUser();
  const offerwalls = state.offerwalls;

  function openEditModal(provider: OfferwallProvider) {
    setEditingProvider(provider);
    setLinkInput(provider.customLink);
    playChime('click');
  }

  function handleSaveLink(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProvider) return;

    const res = store.updateOfferwallLink(editingProvider.id, linkInput);
    if (res.ok) {
      playChime('success');
      setSuccessToast(`Affiliate link updated for ${editingProvider.name}!`);
      setTimeout(() => setSuccessToast(null), 3000);
      setEditingProvider(null);
    }
  }

  function handleSimulatePostback(provider: OfferwallProvider) {
    const res = store.simulateOfferwallPostback(provider.id, testAmountInput);
    if (res.ok) {
      playChime('claim');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      setSuccessToast(res.message);
      setTimeout(() => setSuccessToast(null), 3500);
      setTestingModal(null);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#181c33]/90 via-[#131627] to-[#1a1435]/90 border border-white/10 p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-l from-cyan-500/10 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>Top 5 High-Paying Crypto Offerwall Networks</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Earn Micro-Crypto with 5 Premium Offerwalls
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Complete high-conversion surveys, test new mobile games, and watch rewarded videos. You can attach your own publisher/affiliate links anytime using the <strong>"Edit Link"</strong> button.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Idempotent Postback Webhooks (Replay Protected)</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Balance Crediting</span>
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Offerwalls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {offerwalls.map((ow) => {
          return (
            <div
              key={ow.id}
              className="card-glow rounded-2xl p-5 bg-[#131627] flex flex-col justify-between border border-white/10 hover:border-cyan-500/40 transition duration-200 group relative"
            >
              <div>
                {/* Header Badge & Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-950 font-mono shadow-sm"
                      style={{ backgroundColor: ow.accentColor }}
                    >
                      {ow.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded">
                      {ow.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{ow.rating}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {ow.name}
                </h3>
                <p className="text-[11px] text-cyan-400 font-medium">
                  {ow.tagline}
                </p>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {ow.description}
                </p>

                {/* Specs Box */}
                <div className="my-3.5 p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Average Reward:</span>
                    <span className="font-bold text-emerald-400 font-mono">{ow.avgRewardRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Payout Speed:</span>
                    <span className="text-slate-300 font-mono">{ow.payoutSpeed}</span>
                  </div>
                </div>

                {/* Configured Link Status Box */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-[11px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px] uppercase font-semibold">
                      <Link2 className="w-3 h-3 text-cyan-400" />
                      <span>Configured Link:</span>
                    </span>
                    {ow.isPlaceholderLink ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                        Placeholder Link
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                        Active Link
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 font-mono truncate text-[10px]" title={ow.customLink}>
                    {ow.customLink}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Open Link */}
                  <a
                    href={ow.customLink.replace('{USER_ID}', currentUser ? currentUser.id : 'guest')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white transition flex items-center justify-center gap-1.5"
                  >
                    <span>Open Wall</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Edit Link Button */}
                  <button
                    onClick={() => openEditModal(ow)}
                    title="Change this offerwall's affiliate URL"
                    className="py-2 px-3 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Link</span>
                  </button>
                </div>

                {/* Simulate Postback */}
                <button
                  onClick={() => {
                    setTestingModal(ow);
                    setTestAmountInput('0.35');
                  }}
                  className="w-full py-1.5 rounded-lg text-[11px] font-mono font-medium text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Simulate Webhook Postback (Test)</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Link Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131627] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingProvider(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-mono">
              <Edit3 className="w-4 h-4" />
              <span>Offerwall URL Configuration</span>
            </div>

            <h3 className="text-lg font-bold text-white">
              Edit {editingProvider.name} Link
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Paste your affiliate/iframe link from your {editingProvider.name} publisher account. The <code className="text-cyan-400">{'{USER_ID}'}</code> parameter will automatically populate with each user's ID.
            </p>

            <form onSubmit={handleSaveLink} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Affiliate / Iframe URL
                </label>
                <textarea
                  rows={3}
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  required
                  placeholder="https://offers.provider.com/wall?pub_id=YOUR_ID&user_id={USER_ID}"
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white font-mono outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
                <strong>Tip:</strong> You can edit or replace this link anytime. It is saved in persistent storage.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Postback Simulation Modal */}
      {testingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131627] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setTestingModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-mono">
              <Zap className="w-4 h-4" />
              <span>Postback Webhook Testing Sandbox</span>
            </div>

            <h3 className="text-lg font-bold text-white">
              Simulate {testingModal.name} Postback
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              When a user completes an offer, the provider sends a server postback webhook. You can test crediting balances with:
            </p>

            <div className="my-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Simulated Reward Amount ({testingModal.rewardCoin})
                </label>
                <input
                  type="text"
                  value={testAmountInput}
                  onChange={(e) => setTestAmountInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-mono outline-none focus:border-emerald-400"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-slate-400 space-y-1">
                <div>Recipient: <span className="text-white">{currentUser?.name || 'Demo User'}</span></div>
                <div>Target Asset: <span className="text-emerald-400">{testingModal.rewardCoin}</span></div>
                <div>Idempotency Protection: <span className="text-cyan-400">Enabled (Unique externalId)</span></div>
              </div>
            </div>

            <button
              onClick={() => handleSimulatePostback(testingModal)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 transition shadow-lg"
            >
              Dispatch Webhook & Credit Balance
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
