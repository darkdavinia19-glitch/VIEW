import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ArrowRight,
  Code2,
  Lock,
  Zap,
  Globe,
  Sparkles
} from 'lucide-react';

interface SiteReviewModalProps {
  onClose: () => void;
}

export const SiteReviewModal: React.FC<SiteReviewModalProps> = ({ onClose }) => {
  const [lang, setLang] = useState<'bn' | 'en'>('en');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#101222] border border-cyan-500/30 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {lang === 'bn' ? 'সাইট পর্যালোচনা ও আর্কিটেকচার অডিট' : 'FaucetFlow Site Review & Code Audit'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Score: 7.8/10
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'ফসেটফ্লো (FaucetFlow) প্রজেক্টটির বিস্তারিত বিশ্লেষণ ও পরামর্শ' : 'Comprehensive architectural review of the FaucetFlow codebase'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-0.5 flex text-xs font-semibold">
              <button
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  lang === 'bn' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  lang === 'en' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          {lang === 'bn' ? (
            /* Bengali Content */
            <>
              {/* Verdict Summary Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-purple-950/40 border border-emerald-500/30">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-base mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>সারসংক্ষেপ: প্রজেক্টটির ভিত্তি অত্যন্ত শক্তিশালী এবং সৎ!</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm">
                  আপনার পাঠানো জিপ ফাইল (<code className="text-cyan-300 font-mono">faucetflow</code>) পরীক্ষা করে দেখা গেল—এটি একটি <strong>Next.js + Prisma + PostgreSQL</strong> ক্রিপ্টো ফসেট প্ল্যাটফর্ম। 
                  সাধারণ চটকদার স্ক্যাম সাইটের বিপরীতে, এটি অত্যন্ত সৎ নীতি এবং ব্যাংকিং-গ্রেড সিকিউরিটি প্যাটার্ন মেনে তৈরি করা শুরু হয়েছে। 
                  তবে মূল জিপ ফাইলে <strong>অনেকগুলো গুরুত্বপূর্ণ ফিচার ছিল অসম্পূর্ণ</strong> (যেমন উইথড্রয়াল রিভিউ, অ্যাডমিন প্যানেল, পিটিসি টাস্ক, এবং লাইভ ইন্টারেকশন)।
                  আমরা আপনার সুবিধার জন্য পুরো সিস্টেমটিকে এই প্রিভিউতে <strong>সম্পূর্ণ সচল ও ইন্টারঅ্যাক্টিভ</strong> করে তৈরি করে দিয়েছি!
                </p>
              </div>

              {/* Rating Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-slate-400 text-[11px]">ডেটাবেজ ও আর্কিটেকচার</div>
                  <div className="text-xl font-black text-cyan-400 mt-0.5">9.5 / 10</div>
                  <div className="text-[10px] text-emerald-400 font-medium">অসাধারণ Prisma স্কিমা</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-slate-400 text-[11px]">সিকিউরিটি ও সেফটি</div>
                  <div className="text-xl font-black text-purple-400 mt-0.5">9.0 / 10</div>
                  <div className="text-[10px] text-cyan-400 font-medium">Advisory Locks + BigInt</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-slate-400 text-[11px]">ইউজার ইন্টারফেস (UI/UX)</div>
                  <div className="text-xl font-black text-amber-400 mt-0.5">6.5 / 10</div>
                  <div className="text-[10px] text-amber-400 font-medium">মূল কোডে বেসিক কঙ্কালসার ছিল</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-slate-400 text-[11px]">ফিচার সমাপ্তি (Completeness)</div>
                  <div className="text-xl font-black text-rose-400 mt-0.5">6.0 / 10</div>
                  <div className="text-[10px] text-rose-400 font-medium">অনেক মডিউল "Next" ছিল</div>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>কোডের সেরা ও শক্তিশালী দিকগুলো (Strengths):</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <div>
                      <strong className="text-white">কোনো ফ্লোটিং পয়েন্ট (Float) নেই — শতভাগ BigInt বেস ইউনিট:</strong>{' '}
                      জাভাস্ক্রিপ্টে <code className="text-cyan-300 font-mono">0.1 + 0.2 = 0.30000000000000004</code> এর মতো ফ্লোটিং পয়েন্ট বাগে ফাইন্যান্সিয়াল কোটি টাকার ক্ষতি হয়। 
                      আপনার কোডে সব অ্যামাউন্ট সাটোশি (Satoshis) ও ওয়েই (Wei) হিসেবে <code className="text-purple-300 font-mono">BigInt</code> এ রাখা হয়েছে। এটি সিনিয়র-লেভেলের সেরা প্র্যাকটিস।
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">2.</span>
                    <div>
                      <strong className="text-white">PostgreSQL Advisory Locks (pg_advisory_xact_lock):</strong>{' '}
                      বট বা হ্যাকাররা একসাথে ২০টি প্যারালাল রিকোয়েস্ট পাঠিয়ে যাতে একই সেকেন্ডে একাধিকবার ক্লেইম না করতে পারে, সেজন্য <code className="text-cyan-300 font-mono">pg_advisory_xact_lock(hashtext(userId + ":" + coinSymbol))</code> ব্যবহার করা হয়েছে। ফলে রিকোয়েস্টগুলো সিরিয়ালাইজড হয় এবং রেস কন্ডিশন প্রতিরোধ করে।
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">3.</span>
                    <div>
                      <strong className="text-white">ইউনিক আইডেমপোটেন্সি কী (Idempotency Key):</strong>{' '}
                      <code className="text-cyan-300 font-mono">claim:userId:coin:slot</code> ফরম্যাটের ইউনিক কনস্ট্রেইন্ট নিশ্চিত করে যে নেটওয়ার্ক রিট্রাই হলেও একই ক্লেইম দ্বিতীয়বার ক্রেডিটেড হতে পারবে না।
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">4.</span>
                    <div>
                      <strong className="text-white">সৎ টোকেনোমিক্স ও স্বচ্ছ ডেমো মোড:</strong>{' '}
                      মিথ্যা promises না দিয়ে ফসেটের সামান্য পরিমাণের বাস্তবসম্মত রিওয়ার্ড (যেমন ১০-৫০ সাটোশি) রাখা হয়েছে এবং স্পষ্ট ডেমো মোড লেজার সতর্কতা রয়েছে।
                    </div>
                  </li>
                </ul>
              </div>

              {/* Missing Parts in Original Zip */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>মূল জিপ ফাইলে যা যা অপূর্ণ ছিল (Missing / Incomplete Parts):</span>
                </h3>
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2 text-xs">
                  <p>
                    • <strong>উইথড্রয়াল প্রসেসিং ও অ্যাডমিন রিভিউ:</strong> স্কিমাতে <code className="text-amber-300 font-mono">Withdrawal</code> টেবিল থাকলেও ইউজার ইন্টারফেসে উইথড্র বাটন বা অ্যাডমিন রিভিউ প্যানেল কিছুই তৈরি করা হয়নি (README-তে লেখা ছিল "Next")।
                  </p>
                  <p>
                    • <strong>পিটিসি (PTC) অ্যাডস ও অফারওয়াল:</strong> কোনো ইন্টারঅ্যাক্টিভ ভিউয়ার বা কাউন্টডাউন টাইমার তৈরি ছিল না।
                  </p>
                  <p>
                    • <strong>ইমেল ভেরিফিকেশন ও পাসওয়ার্ড রিসেট:</strong> ব্যাকএন্ডে টোকেন লজিক আছে কিন্তু লাইভ ইমেল পাঠানোর জন্য SMTP ক্রেডেনশিয়াল নেই।
                  </p>
                  <p>
                    • <strong>ফ্রন্টএন্ড ইউজার এক্সপেরিয়েন্স:</strong> মূল Next.js পেজগুলো ছিল অত্যন্ত সাধারণ (Plain text list), কোনো সাউন্ড, লাইভ প্রোগ্রেস রিং বা ক্লেইম অ্যানিমেশন ছিল না।
                  </p>
                </div>
              </div>

              {/* What We Improved */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>আমরা এখন যা যা সম্পূর্ণ সচল ও আধুনিক বানিয়ে দিয়েছি:</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-5">
                  <li><strong>লাইভ ফসেট ইঞ্জিন:</strong> রিয়েল-টাইম কাউন্টডাউন টাইমার, প্রোগ্রেস বার, ওয়েব অডিও সাউন্ড এবং কনফেটি অ্যানিমেশন।</li>
                  <li><strong>১-ক্লিক ব্যাচ ক্লেইম:</strong> সব রেডি কয়েন একসাথে টেস্ট করার সুবিধা।</li>
                  <li><strong>মাল্টি-ইউজার অ্যাকাউন্ট সুইচিং:</strong> Alex এবং Elena এর মধ্যে সুইচ করে ১০% রেফারেল কমিশন লাইভ পরীক্ষা করার সুবিধা।</li>
                  <li><strong>সম্পূর্ণ অ্যাডমিন ও উইথড্রয়াল কনসোল:</strong> উইথড্র রিকোয়েস্ট তৈরি করা, অ্যাডমিন হিসেবে রিভিউ ও অন-চেন সিমুলেট কমপ্লিট করা।</li>
                  <li><strong>পিটিসি (PTC) অ্যাডস ও ম্যাথ ক্যাপচা:</strong> টাইমার শেষ হওয়ার পর অ্যান্টি-বট ভেরিফিকেশন ও লাইভ ব্যালেন্স ক্রেডিট।</li>
                  <li><strong>ডেইলি স্ট্রিক ও প্রোমো ভাউচার কোড:</strong> <code className="text-cyan-300 font-mono">WELCOME100</code>, <code className="text-purple-300 font-mono">SATOSHI2026</code> রিডিম করার সুবিধা।</li>
                </ul>
              </div>

              {/* Production Roadmap */}
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>প্রডাকশনে লাইভ করার জন্য প্রয়োজনীয় পদক্ষেপ:</span>
                </div>
                <p className="text-slate-400">
                  ১. <strong>হোস্টেড ডাটাবেজ:</strong> Supabase অথবা Neon-এ PostgreSQL তৈরি করে <code className="text-cyan-300 font-mono">npx prisma migrate deploy</code> চালাতে হবে।<br/>
                  ২. <strong>ইমেল সার্ভিস:</strong> Resend বা SendGrid এর SMTP API যুক্ত করা।<br/>
                  ৩. <strong>ক্যাপচা প্রোভাইডার:</strong> Cloudflare Turnstile বা hCaptcha সিক্রেট কি যুক্ত করা।<br/>
                  ৪. <strong>পেআউট গেটওয়ে:</strong> FaucetPay API অথবা CoinPayments ইন্টিগ্রেশন সম্পন্ন করা।
                </p>
              </div>
            </>
          ) : (
            /* English Content */
            <>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-purple-950/40 border border-emerald-500/30">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-base mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Executive Verdict: Exceptional Architectural Blueprint & Honest Economics</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm">
                  FaucetFlow is built on sound software engineering principles. Unlike deceptive faucet scripts that make false promises or suffer from concurrency exploits, this codebase establishes a secure foundation using PostgreSQL transaction locks and integer base-units.
                </p>
              </div>

              {/* Rating Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-slate-400 text-[11px]">Database & Architecture</div>
                  <div className="text-xl font-black text-cyan-400 mt-0.5">9.5 / 10</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Superb Prisma Schema</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-slate-400 text-[11px]">Security & Anti-Fraud</div>
                  <div className="text-xl font-black text-purple-400 mt-0.5">9.0 / 10</div>
                  <div className="text-[10px] text-cyan-400 font-medium">Advisory Lock + BigInt</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-slate-400 text-[11px]">UI / UX Design</div>
                  <div className="text-xl font-black text-amber-400 mt-0.5">6.5 / 10</div>
                  <div className="text-[10px] text-amber-400 font-medium">Original had bare skeleton</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-slate-400 text-[11px]">Feature Completeness</div>
                  <div className="text-xl font-black text-rose-400 mt-0.5">6.0 / 10</div>
                  <div className="text-[10px] text-rose-400 font-medium">Many items marked "Next"</div>
                </div>
              </div>

              {/* Architectural Strengths */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Key Technical Strengths:</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <div>
                      <strong className="text-white">Strict BigInt Base-Units (No Floats):</strong> Prevents JavaScript floating-point rounding errors (<code className="text-cyan-300 font-mono">0.1 + 0.2 ≠ 0.3</code>) by maintaining satoshis and wei exclusively as BigInt.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <div>
                      <strong className="text-white">Postgres Advisory Lock Concurrency Control:</strong> <code className="text-cyan-300 font-mono">SELECT pg_advisory_xact_lock(hashtext(userId:coin))</code> ensures parallel requests from automated bots cannot slip past cooldown checks simultaneously.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <div>
                      <strong className="text-white">Cryptographic Uniform Randomness:</strong> Uses <code className="text-purple-300 font-mono">crypto.getRandomValues</code> with extra buffer bytes to eliminate modulo bias.
                    </div>
                  </li>
                </ul>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0d0f1c] flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {lang === 'bn' ? 'ফসেটফ্লো প্ল্যাটফর্মটি এখন সম্পূর্ণ ইন্টারঅ্যাক্টিভ' : 'FaucetFlow platform is now fully interactive in this preview'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
          >
            {lang === 'bn' ? 'সাইটে ফিরে যান' : 'Back to App'}
          </button>
        </div>

      </div>
    </div>
  );
};
