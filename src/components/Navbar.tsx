import React, { useState } from 'react';
import { 
  Droplet, 
  LayoutDashboard, 
  Coins, 
  ArrowUpRight,
  Layers,
  MousePointerClick, 
  Gift, 
  ShieldAlert, 
  FileSearch, 
  Users, 
  ChevronDown,
  Sparkles,
  LogIn,
  UserPlus,
  LogOut,
  Cloud,
  Activity
} from 'lucide-react';
import { FaucetStore } from '../lib/faucetStore';

interface NavbarProps {
  store: FaucetStore;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuditModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  store,
  activeTab,
  setActiveTab,
  onOpenAuditModal,
  onOpenAuthModal,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const state = store.getState();
  const currentUser = store.getCurrentUser();
  const isLoggedIn = store.isLoggedIn();

  const navItems = [
    { id: 'liveboard', label: 'Live Work Board', icon: Activity, badge: 'Live' },
    { id: 'faucets', label: 'Faucets', icon: Coins },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight, badge: 'Min 0.1' },
    { id: 'offerwalls', label: 'Offerwalls (5)', icon: Layers, badge: 'Hot' },
    { id: 'admin', label: 'Admin Panel', icon: ShieldAlert, badge: state.withdrawals.filter(w => w.status === 'PENDING').length || undefined },
    { id: 'ptc', label: 'PTC Ads', icon: MousePointerClick },
    { id: 'bonus', label: 'Promo & Streak', icon: Gift },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0d17]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('liveboard')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Droplet className="w-5 h-5 text-white fill-white/20" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Faucet<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Flow</span>
                </span>
                <span className="block text-[10px] tracking-widest uppercase font-mono text-cyan-400/80 -mt-1">
                  Crypto Rewards
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white/10 text-cyan-300 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Area: Audit, Sign In, Sign Up, User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Audit / Review Button */}
            <button
              onClick={onOpenAuditModal}
              className="relative hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400 transition"
              title="Site architecture audit & report"
            >
              <FileSearch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Report</span>
            </button>

            {/* If NOT logged in: Show prominent Sign In and Sign Up buttons */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-white/20 hover:border-cyan-400 text-slate-200 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transform active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              /* If Logged In: Show Account Controls */
              <div className="flex items-center gap-2">
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs text-left transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center font-bold text-[10px] text-purple-300">
                      {currentUser?.name[0] || 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <div className="font-semibold text-slate-200 leading-tight truncate max-w-[90px]">
                        {currentUser?.name.split(' ')[0]}
                      </div>
                      <div className="text-[9px] text-cyan-400 font-mono">
                        {currentUser?.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#131627] border border-white/10 shadow-2xl py-2 z-50 text-xs"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2 border-b border-white/10 text-slate-400">
                        <div className="font-bold text-white text-xs">{currentUser?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{currentUser?.email}</div>
                      </div>

                      {/* Switch User Accounts */}
                      <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-slate-500">
                        Switch Account
                      </div>
                      {state.users.map((u) => {
                        const isSelected = u.id === currentUser?.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => store.setCurrentUser(u.id)}
                            className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-white/5 transition ${
                              isSelected ? 'bg-cyan-500/10 text-cyan-300 font-bold' : 'text-slate-300'
                            }`}
                          >
                            <span className="truncate">{u.name}</span>
                            <span className="text-[9px] font-mono text-slate-400">{u.role}</span>
                          </button>
                        );
                      })}

                      {/* Log Out */}
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => store.logout()}
                          className="w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-1.5 font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Quick Sign Up / Switch Account Button */}
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
                  title="Create another account"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>New User</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        <div className="lg:hidden flex items-center space-x-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-white/15 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
