/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { faucetStore } from './lib/faucetStore';
import { LiveNetworkBar } from './components/LiveNetworkBar';
import { Navbar } from './components/Navbar';
import { LiveWorkBoard } from './components/LiveWorkBoard';
import { FaucetsView } from './components/FaucetsView';
import { DashboardView } from './components/DashboardView';
import { WithdrawalsView } from './components/WithdrawalsView';
import { OfferwallsView } from './components/OfferwallsView';
import { PtcAdsView } from './components/PtcAdsView';
import { PromoView } from './components/PromoView';
import { AdminView } from './components/AdminView';
import { WithdrawModal } from './components/WithdrawModal';
import { SiteReviewModal } from './components/SiteReviewModal';
import { AuthModal } from './components/AuthModal';
import { CoinSymbol } from './types/faucet';
import { 
  FileSearch, 
  Sparkles,
  ArrowUpRight,
  Layers,
  ShieldCheck,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('liveboard');
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [withdrawModalCoin, setWithdrawModalCoin] = useState<CoinSymbol | null>(null);
  const [selectedWithdrawCoin, setSelectedWithdrawCoin] = useState<CoinSymbol>('DOGE');
  const [, setTick] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    const unsub = faucetStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => {
      unsub();
    };
  }, []);

  const state = faucetStore.getState();
  const currentUser = faucetStore.getCurrentUser();
  const isLoggedIn = faucetStore.isLoggedIn();

  function handleNavigateToWithdraw(coin: CoinSymbol = 'DOGE') {
    if (!isLoggedIn) {
      setAuthModalMode('login');
      return;
    }
    setSelectedWithdrawCoin(coin);
    setActiveTab('withdraw');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d17] text-slate-200">
      
      {/* Live Mainnet Network Status Bar (Replaces demo banner) */}
      <LiveNetworkBar
        store={faucetStore}
        onOpenLiveBoard={() => setActiveTab('liveboard')}
      />

      {/* Primary Sticky Header with Sign In & Sign Up buttons */}
      <Navbar
        store={faucetStore}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuditModal={() => setShowAuditModal(true)}
        onOpenAuthModal={(mode) => setAuthModalMode(mode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Banner with Sign In / Sign Up Callout or Quick Actions */}
        <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-cyan-950/40 to-slate-900 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-slate-300">
              {isLoggedIn ? (
                <>
                  Logged in as <strong className="text-cyan-300 font-bold">{currentUser?.name}</strong>. Live work board & withdrawal gateway (0.1 min limit) are active!
                </>
              ) : (
                <>
                  Browsing as Guest. Click <strong>"Sign In"</strong> or <strong>"Sign Up"</strong> to start claiming live crypto rewards.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setAuthModalMode('login')}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => setAuthModalMode('register')}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-cyan-500/10 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigateToWithdraw('DOGE')}
                className="px-3 py-1.5 rounded-xl font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Withdraw (Min 0.1)</span>
              </button>
            )}

            <button
              onClick={() => setShowAuditModal(true)}
              className="px-3 py-1.5 rounded-xl font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition flex items-center gap-1 cursor-pointer"
            >
              <FileSearch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Report</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'liveboard' && (
          <LiveWorkBoard
            store={faucetStore}
            onNavigateTab={setActiveTab}
            onSelectWithdraw={(coin) => handleNavigateToWithdraw(coin)}
            onOpenAuthModal={(mode) => setAuthModalMode(mode)}
          />
        )}

        {activeTab === 'faucets' && (
          <FaucetsView
            store={faucetStore}
            onSelectWithdraw={(coin) => handleNavigateToWithdraw(coin)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            store={faucetStore}
            onNavigateTab={setActiveTab}
            onSelectWithdraw={(coin) => handleNavigateToWithdraw(coin)}
            onOpenAuthModal={(mode) => setAuthModalMode(mode)}
          />
        )}

        {activeTab === 'withdraw' && (
          <WithdrawalsView
            store={faucetStore}
            initialCoin={selectedWithdrawCoin}
            onOpenAuthModal={(mode) => setAuthModalMode(mode)}
          />
        )}

        {activeTab === 'offerwalls' && (
          <OfferwallsView store={faucetStore} />
        )}

        {activeTab === 'admin' && (
          <AdminView store={faucetStore} />
        )}

        {activeTab === 'ptc' && (
          <PtcAdsView store={faucetStore} />
        )}

        {activeTab === 'bonus' && (
          <PromoView store={faucetStore} />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#090b14] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-bold text-white flex items-center justify-center md:justify-start gap-1.5">
              <span>FaucetFlow</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                v0.2.0-full
              </span>
            </div>
            <p className="max-w-xl text-slate-400 text-[11px]">
              PostgreSQL transaction locks (<code className="text-cyan-400 font-mono">pg_advisory_xact_lock</code>), 
              0.1 minimum withdrawal, 5 customizable offerwalls, and complete authentication system.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setAuthModalMode('login')}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Sign In
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setAuthModalMode('register')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={() => faucetStore.logout()}
                className="text-rose-400 hover:underline font-semibold"
              >
                Sign Out ({currentUser?.name})
              </button>
            )}
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-purple-400 hover:underline"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Sign In / Sign Up) */}
      {authModalMode && (
        <AuthModal
          store={faucetStore}
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSuccess={() => setActiveTab('dashboard')}
        />
      )}

      {/* Pop-up Withdraw Modal */}
      {withdrawModalCoin && (
        <WithdrawModal
          store={faucetStore}
          initialCoin={withdrawModalCoin}
          onClose={() => setWithdrawModalCoin(null)}
        />
      )}

      {/* In-depth Review Modal */}
      {showAuditModal && (
        <SiteReviewModal onClose={() => setShowAuditModal(false)} />
      )}

    </div>
  );
}
