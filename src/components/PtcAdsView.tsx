import React, { useState, useEffect } from 'react';
import { 
  MousePointerClick, 
  ExternalLink, 
  Timer, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';
import { PtcAd } from '../types/faucet';
import { formatAmount } from '../lib/money';
import confetti from 'canvas-confetti';
import { playChime } from '../lib/sound';

interface PtcAdsViewProps {
  store: FaucetStore;
}

export const PtcAdsView: React.FC<PtcAdsViewProps> = ({ store }) => {
  const [activeViewingAd, setActiveViewingAd] = useState<PtcAd | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [captchaAnswer, setCaptchaAnswer] = useState<string>('');
  const [captchaChallenge, setCaptchaChallenge] = useState<{ num1: number; num2: number; expected: number }>({
    num1: 3,
    num2: 4,
    expected: 7,
  });
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const state = store.getState();
  const ads = state.ptcAds;

  // Countdown timer while viewing ad
  useEffect(() => {
    if (!activeViewingAd || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeViewingAd, countdown]);

  function startAd(ad: PtcAd) {
    if (!store.getCurrentUser()) {
      alert('Please Sign In or Register to earn crypto from PTC tasks.');
      return;
    }
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 7) + 1;
    setCaptchaChallenge({ num1, num2, expected: num1 + num2 });
    setCaptchaAnswer('');
    setVerifiedSuccess(false);
    setCountdown(ad.durationS);
    setActiveViewingAd(ad);
    playChime('click');
  }

  function handleVerifyAndCredit() {
    if (parseInt(captchaAnswer) !== captchaChallenge.expected) {
      alert(`Captcha incorrect! Please compute: ${captchaChallenge.num1} + ${captchaChallenge.num2}`);
      playChime('error');
      return;
    }

    if (!activeViewingAd) return;

    const res = store.completePtcAd(activeViewingAd.id);
    if (res.ok) {
      playChime('claim');
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
      setVerifiedSuccess(true);
      setTimeout(() => {
        setActiveViewingAd(null);
        setVerifiedSuccess(false);
      }, 1600);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Paid-To-Click Sponsored Tasks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Earn Crypto Visiting Verified Web3 Partners</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            View partner websites for a short duration, solve a quick anti-bot check, and receive guaranteed crypto base units.
          </p>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map((ad) => {
          const coin = state.coins.find((c) => c.symbol === ad.rewardCoin)!;
          return (
            <div
              key={ad.id}
              className="card-glow rounded-2xl p-5 bg-[#131627] flex flex-col justify-between border border-white/10 hover:border-cyan-500/40 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-bold">
                    Sponsored • {ad.durationS}s view
                  </span>
                  <div className="text-right font-mono">
                    <span className="text-emerald-400 font-bold text-sm">
                      +{formatAmount(ad.rewardAmount, coin.decimals)} {ad.rewardCoin}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                  {ad.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {ad.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Timer className="w-3 h-3 text-cyan-400" />
                  <span>{ad.durationS} seconds</span>
                </div>

                <button
                  onClick={() => startAd(ad)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white transition flex items-center gap-1.5"
                >
                  <span>Start Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Ad Viewing Modal */}
      {activeViewingAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131627] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveViewingAd(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>PTC Verification Chamber</span>
            </div>

            <h3 className="text-lg font-bold text-white">{activeViewingAd.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{activeViewingAd.description}</p>

            {/* Countdown / Captcha state */}
            <div className="my-6 p-4 rounded-xl bg-black/50 border border-white/10 text-center">
              {countdown > 0 ? (
                <div className="space-y-2">
                  <div className="text-3xl font-black text-cyan-400 font-mono animate-pulse">
                    {countdown}s
                  </div>
                  <div className="text-xs text-slate-300">
                    Please keep this window open while timer completes...
                  </div>
                </div>
              ) : verifiedSuccess ? (
                <div className="space-y-1 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <div className="font-bold text-sm">Reward Credited!</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs text-cyan-300 font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Timer Completed! Solve Anti-Bot Captcha to Claim:</span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <span className="text-base font-bold font-mono text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10">
                      {captchaChallenge.num1} + {captchaChallenge.num2} = ?
                    </span>
                    <input
                      type="number"
                      placeholder="Answer"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className="w-24 px-3 py-1.5 rounded-lg bg-black/50 border border-white/20 text-center font-bold font-mono text-white outline-none focus:border-cyan-400"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerifyAndCredit();
                      }}
                    />
                  </div>

                  <button
                    onClick={handleVerifyAndCredit}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 transition shadow-lg"
                  >
                    Verify & Claim Reward
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Simulated advertiser link</span>
              <a
                href={activeViewingAd.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:underline"
              >
                Visit Site <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
