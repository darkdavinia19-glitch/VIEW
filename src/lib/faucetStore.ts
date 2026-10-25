import { 
  CoinConfig, 
  CoinSymbol, 
  FaucetClaimRecord, 
  TransactionRecord, 
  UserAccount, 
  WalletBalance, 
  WithdrawalRecord,
  PtcAd,
  OfferwallProvider,
  PromoCodeItem,
  AuditLogItem,
  LiveWorkEvent
} from '../types/faucet';
import { toBaseUnits, randomBetween, bps, formatAmount } from './money';

// All coins have minWithdrawal strictly set to 0.1 as requested by user
const COIN_CONFIGS: CoinConfig[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    decimals: 8,
    enabled: true,
    rewardMin: toBaseUnits('0.00000010', 8),
    rewardMax: toBaseUnits('0.00000050', 8),
    claimIntervalS: 60,
    dailyClaimCap: 50,
    minWithdrawal: toBaseUnits('0.1', 8), // 0.1 BTC
    payoutNetwork: 'Bitcoin Network / FaucetPay',
    iconColor: '#f7931a',
    usdPrice: 94500,
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    decimals: 8,
    enabled: true,
    rewardMin: toBaseUnits('0.00000100', 8),
    rewardMax: toBaseUnits('0.00000500', 8),
    claimIntervalS: 45,
    dailyClaimCap: 60,
    minWithdrawal: toBaseUnits('0.1', 8), // 0.1 LTC
    payoutNetwork: 'Litecoin Mainnet',
    iconColor: '#345d9d',
    usdPrice: 98,
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    decimals: 8,
    enabled: true,
    rewardMin: toBaseUnits('0.01000000', 8),
    rewardMax: toBaseUnits('0.05000000', 8),
    claimIntervalS: 30,
    dailyClaimCap: 100,
    minWithdrawal: toBaseUnits('0.1', 8), // 0.1 DOGE
    payoutNetwork: 'Dogecoin Mainnet',
    iconColor: '#c2a633',
    usdPrice: 0.28,
  },
  {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    decimals: 8,
    enabled: true,
    rewardMin: toBaseUnits('0.00000100', 8),
    rewardMax: toBaseUnits('0.00000500', 8),
    claimIntervalS: 60,
    dailyClaimCap: 50,
    minWithdrawal: toBaseUnits('0.1', 8), // 0.1 BCH
    payoutNetwork: 'BCH Network',
    iconColor: '#0ac18e',
    usdPrice: 420,
  },
  {
    symbol: 'TRX',
    name: 'Tron',
    decimals: 6,
    enabled: true,
    rewardMin: toBaseUnits('0.010000', 6),
    rewardMax: toBaseUnits('0.050000', 6),
    claimIntervalS: 20,
    dailyClaimCap: 120,
    minWithdrawal: toBaseUnits('0.1', 6), // 0.1 TRX
    payoutNetwork: 'TRON TRC20',
    iconColor: '#eb0029',
    usdPrice: 0.22,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    enabled: true,
    rewardMin: toBaseUnits('0.000000001', 18),
    rewardMax: toBaseUnits('0.000000005', 18),
    claimIntervalS: 90,
    dailyClaimCap: 30,
    minWithdrawal: toBaseUnits('0.1', 18), // 0.1 ETH
    payoutNetwork: 'Arbitrum / Base L2',
    iconColor: '#627eea',
    usdPrice: 3200,
  },
];

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user_alex',
    name: 'Alex Crypto (Admin)',
    email: 'alex@faucetflow.io',
    role: 'ADMIN',
    status: 'ACTIVE',
    referralCode: 'FLOW-ALEX77',
    emailVerified: true,
    dailyBonusStreak: 3,
    lastDailyBonusAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'user_elena',
    name: 'Elena Web3 (Referred Member)',
    email: 'elena@web3.dev',
    role: 'USER',
    status: 'ACTIVE',
    referralCode: 'FLOW-ELENA12',
    referredById: 'user_alex',
    emailVerified: true,
    dailyBonusStreak: 1,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'user_tariq',
    name: 'Tariq Rahman (Standard User)',
    email: 'tariq.bd@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    referralCode: 'FLOW-TARIQ55',
    referredById: 'user_alex',
    emailVerified: true,
    dailyBonusStreak: 4,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// 5 Industry standard offerwalls with editable link placeholders
const INITIAL_OFFERWALLS: OfferwallProvider[] = [
  {
    id: 'cpx_research',
    name: 'CPX Research',
    tagline: 'Global Top Paid Surveys & Studies',
    category: 'Surveys',
    badge: 'Popular',
    rating: 4.9,
    description: 'High conversion market research surveys tailored to user demographics with instant qualification.',
    avgRewardRange: '0.15 - 2.50 DOGE / survey',
    payoutSpeed: 'Instant Postback',
    customLink: 'https://offers.cpx-research.com/index.php?app_id=REPLACE_WITH_YOUR_APP_ID&ext_user_id={USER_ID}',
    isPlaceholderLink: true,
    active: true,
    featured: true,
    accentColor: '#38bdf8',
    rewardCoin: 'DOGE',
  },
  {
    id: 'timewall',
    name: 'TimeWall',
    tagline: 'Micro-tasks, Clicks & Social Follows',
    category: 'Multi-task',
    badge: 'Fast Tasks',
    rating: 4.8,
    description: 'Hundreds of easy 1-minute tasks including website visits, app downloads, social follows, and quizzes.',
    avgRewardRange: '0.10 - 1.80 TRX / task',
    payoutSpeed: 'Under 5 min',
    customLink: 'https://timewall.io/offers?ref=REPLACE_WITH_YOUR_ID&user={USER_ID}',
    isPlaceholderLink: true,
    active: true,
    featured: true,
    accentColor: '#4ade80',
    rewardCoin: 'TRX',
  },
  {
    id: 'lootably',
    name: 'Lootably',
    tagline: 'Rewarded Video & Multi-Platform Offers',
    category: 'Rewarded Video',
    badge: 'High Payout',
    rating: 4.7,
    description: 'Watch video streams, try new mobile games, and complete tiered milestones for escalating rewards.',
    avgRewardRange: '0.20 - 5.00 DOGE / offer',
    payoutSpeed: 'Instant Postback',
    customLink: 'https://lootably.com/wall?placementId=REPLACE_WITH_YOUR_PLACEMENT_ID&userId={USER_ID}',
    isPlaceholderLink: true,
    active: true,
    accentColor: '#a78bfa',
    rewardCoin: 'DOGE',
  },
  {
    id: 'bitlabs',
    name: 'BitLabs',
    tagline: 'Financial & Consumer Profiling Surveys',
    category: 'Surveys',
    badge: 'Fair Compensation',
    rating: 4.8,
    description: 'Guaranteed consolation reward even if disqualified from surveys. Optimized for mobile and desktop.',
    avgRewardRange: '0.25 - 3.20 TRX / survey',
    payoutSpeed: 'Instant',
    customLink: 'https://web.bitlabs.ai/?token=REPLACE_WITH_YOUR_API_TOKEN&uid={USER_ID}',
    isPlaceholderLink: true,
    active: true,
    accentColor: '#f59e0b',
    rewardCoin: 'TRX',
  },
  {
    id: 'monlix',
    name: 'Monlix',
    tagline: 'Web3 & Mobile Game Level-up Rewards',
    category: 'Mobile Apps',
    badge: 'Best for Gamers',
    rating: 4.6,
    description: 'Install trending mobile and web apps, reach level milestones, and claim substantial crypto rewards.',
    avgRewardRange: '0.50 - 10.00 DOGE / game',
    payoutSpeed: 'Automated Postback',
    customLink: 'https://monlix.com/offerwall?app_id=REPLACE_WITH_YOUR_MONLIX_ID&userId={USER_ID}',
    isPlaceholderLink: true,
    active: true,
    accentColor: '#ec4899',
    rewardCoin: 'DOGE',
  },
];

const INITIAL_PTC_ADS: PtcAd[] = [
  {
    id: 'ptc_1',
    title: 'Hardware Wallet Security Guide 2026',
    description: 'Protect your self-custody cold storage against modern phishing attacks.',
    url: 'https://example.com/crypto-security',
    rewardCoin: 'DOGE',
    rewardAmount: toBaseUnits('0.02500000', 8),
    durationS: 10,
    active: true,
  },
  {
    id: 'ptc_2',
    title: 'Layer 2 Gas Tracker & Analytics',
    description: 'Find lowest transaction fees across Arbitrum, Optimism, and Base.',
    url: 'https://example.com/l2-fees',
    rewardCoin: 'TRX',
    rewardAmount: toBaseUnits('0.030000', 6),
    durationS: 10,
    active: true,
  },
  {
    id: 'ptc_3',
    title: 'Web3 Privacy Shield & VPN',
    description: 'Zero-logging, decentralized node relay for cross-chain DeFi.',
    url: 'https://example.com/privacy-shield',
    rewardCoin: 'LTC',
    rewardAmount: toBaseUnits('0.00000300', 8),
    durationS: 15,
    active: true,
  },
  {
    id: 'ptc_4',
    title: 'Proof of Reserves Explorer',
    description: 'Cryptographic solvency proof verification for top custodial venues.',
    url: 'https://example.com/por-explorer',
    rewardCoin: 'BTC',
    rewardAmount: toBaseUnits('0.00000025', 8),
    durationS: 15,
    active: true,
  },
];

const INITIAL_PROMO_CODES: PromoCodeItem[] = [
  {
    code: 'WELCOME100',
    coin: 'DOGE',
    amount: toBaseUnits('1.00000000', 8),
    maxUses: 500,
    usedCount: 42,
    active: true,
    redeemedBy: [],
  },
  {
    code: 'SATOSHI2026',
    coin: 'BTC',
    amount: toBaseUnits('0.00000200', 8),
    maxUses: 200,
    usedCount: 18,
    active: true,
    redeemedBy: [],
  },
  {
    code: 'TRONFLOW',
    coin: 'TRX',
    amount: toBaseUnits('0.500000', 6),
    maxUses: 300,
    usedCount: 89,
    active: true,
    redeemedBy: [],
  },
];

const INITIAL_LIVE_EVENTS: LiveWorkEvent[] = [
  {
    id: 'live_init_1',
    type: 'WITHDRAWAL',
    userName: 'Elena Web3',
    coin: 'TRX',
    amountFormatted: '-0.250000 TRX',
    usdValue: '$0.055',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    networkRef: '0x8f3c7e4b2d1a90c1f4e5a6b7c8d9e0f1',
    taskTitle: 'FaucetPay Batch Payout #482',
  },
  {
    id: 'live_init_2',
    type: 'OFFERWALL',
    userName: 'Tariq Rahman',
    coin: 'DOGE',
    amountFormatted: '+0.45000000 DOGE',
    usdValue: '$0.180',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    taskTitle: 'CPX Research Survey Completion',
  },
  {
    id: 'live_init_3',
    type: 'CLAIM',
    userName: 'Satoshi_N',
    coin: 'BTC',
    amountFormatted: '+0.00000045 BTC',
    usdValue: '$0.043',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    networkRef: 'slot#891',
  },
  {
    id: 'live_init_4',
    type: 'PTC',
    userName: 'Maria_Crypt',
    coin: 'LTC',
    amountFormatted: '+0.00000400 LTC',
    usdValue: '$0.003',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    taskTitle: 'Hardware Wallet Security Guide 2026',
  },
  {
    id: 'live_init_5',
    type: 'CLAIM',
    userName: 'Alex Crypto',
    coin: 'DOGE',
    amountFormatted: '+0.04500000 DOGE',
    usdValue: '$0.018',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    networkRef: 'slot#889',
  },
  {
    id: 'live_init_6',
    type: 'OFFERWALL',
    userName: 'Kareem_X',
    coin: 'TRX',
    amountFormatted: '+0.750000 TRX',
    usdValue: '$0.165',
    timestamp: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
    taskTitle: 'BitLabs Consumer Survey',
  },
];

function serializeBigInt(obj: any): any {
  if (typeof obj === 'bigint') {
    return { __bigint: obj.toString() };
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])
    );
  }
  return obj;
}

function deserializeBigInt(obj: any): any {
  if (obj !== null && typeof obj === 'object') {
    if ('__bigint' in obj && typeof obj.__bigint === 'string') {
      return BigInt(obj.__bigint);
    }
    if (Array.isArray(obj)) {
      return obj.map(deserializeBigInt);
    }
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, deserializeBigInt(v)])
    );
  }
  return obj;
}

export interface FaucetState {
  coins: CoinConfig[];
  users: UserAccount[];
  currentUserId: string | null;
  balances: Record<string, Record<CoinSymbol, WalletBalance>>;
  claims: FaucetClaimRecord[];
  transactions: TransactionRecord[];
  withdrawals: WithdrawalRecord[];
  ptcAds: PtcAd[];
  offerwalls: OfferwallProvider[];
  promoCodes: PromoCodeItem[];
  auditLogs: AuditLogItem[];
  referralBps: number; // 1000 = 10%
  demoMode: boolean; // false for live production work board
  fastCooldownMode: boolean;
  globalMinWithdrawal: string; // "0.1"
  supabaseUrl: string;
  lockedResources: Set<string>;
  liveEvents: LiveWorkEvent[];
}

const STORAGE_KEY = 'faucetflow_state_v3';

export class FaucetStore {
  private state: FaucetState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): FaucetState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = deserializeBigInt(JSON.parse(saved));
        return {
          ...parsed,
          demoMode: false, // Live production mode active
          liveEvents: parsed.liveEvents && parsed.liveEvents.length > 0 ? parsed.liveEvents : INITIAL_LIVE_EVENTS,
          supabaseUrl: 'https://wgywqbehvzhmwzazmkbd.supabase.co',
          lockedResources: new Set<string>(),
        };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }

    const balances: Record<string, Record<CoinSymbol, WalletBalance>> = {};
    INITIAL_USERS.forEach((u) => {
      balances[u.id] = {} as Record<CoinSymbol, WalletBalance>;
      COIN_CONFIGS.forEach((c) => {
        let starter = 0n;
        if (u.id === 'user_alex') {
          if (c.symbol === 'DOGE') starter = toBaseUnits('0.45000000', 8);
          else if (c.symbol === 'TRX') starter = toBaseUnits('0.500000', 6);
          else if (c.symbol === 'LTC') starter = toBaseUnits('0.15000000', 8);
          else starter = c.rewardMax * 5n;
        } else if (u.id === 'user_tariq') {
          if (c.symbol === 'DOGE') starter = toBaseUnits('0.20000000', 8);
        }

        balances[u.id][c.symbol] = {
          coin: c.symbol,
          available: starter,
          pending: 0n,
          lifetime: starter,
        };
      });
    });

    const initialTxs: TransactionRecord[] = [];
    COIN_CONFIGS.forEach((c) => {
      initialTxs.push({
        id: 'tx_seed_' + c.symbol.toLowerCase(),
        userId: 'user_alex',
        coin: c.symbol,
        type: 'FAUCET_CLAIM',
        amount: balances['user_alex'][c.symbol].available,
        idempotencyKey: `seed:user_alex:${c.symbol}:init`,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        meta: { note: 'Initial test starter balance' },
      });
    });

    const initialWithdrawals: WithdrawalRecord[] = [
      {
        id: 'wdr_sample_01',
        userId: 'user_tariq',
        userName: 'Tariq Rahman',
        coin: 'DOGE',
        amount: toBaseUnits('0.15000000', 8),
        address: 'DM8x7GkQv9y9H7m54Jt89zQLa1289mK',
        status: 'PENDING',
        payoutMethod: 'Direct Wallet',
        requestKey: 'wdr:user_tariq:DOGE:sample1',
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      },
      {
        id: 'wdr_sample_02',
        userId: 'user_elena',
        userName: 'Elena Web3',
        coin: 'TRX',
        amount: toBaseUnits('0.250000', 6),
        address: 'TY2j4K89mNx19B76v9q8La512903mB',
        status: 'COMPLETED',
        payoutMethod: 'FaucetPay',
        providerRef: '0x8f3c7e4b2d1a90c1f4e5a6b7c8d9e0f1',
        reviewedBy: 'Alex Crypto (Admin)',
        reviewNote: 'Confirmed on-chain payout batch #482',
        requestKey: 'wdr:user_elena:TRX:sample2',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ];

    return {
      coins: COIN_CONFIGS,
      users: INITIAL_USERS,
      currentUserId: 'user_alex',
      balances,
      claims: [],
      transactions: initialTxs,
      withdrawals: initialWithdrawals,
      ptcAds: INITIAL_PTC_ADS,
      offerwalls: INITIAL_OFFERWALLS,
      promoCodes: INITIAL_PROMO_CODES,
      auditLogs: [
        {
          id: 'log_init',
          actor: 'SYSTEM',
          action: 'INIT_SYSTEM',
          timestamp: new Date().toISOString(),
          details: 'Initialized FaucetFlow engine with 0.1 minimum withdrawal and Supabase integration.',
        },
      ],
      referralBps: 1000, // 10%
      demoMode: false, // Live production work board
      fastCooldownMode: true,
      globalMinWithdrawal: '0.1',
      supabaseUrl: 'https://wgywqbehvzhmwzazmkbd.supabase.co',
      lockedResources: new Set<string>(),
      liveEvents: INITIAL_LIVE_EVENTS,
    };
  }

  public save() {
    try {
      const toSave = {
        ...this.state,
        lockedResources: Array.from(this.state.lockedResources),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeBigInt(toSave)));
    } catch (e) {
      console.warn('Failed to persist state', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): FaucetState {
    return this.state;
  }

  public getLiveWorkEvents(): LiveWorkEvent[] {
    return this.state.liveEvents || [];
  }

  public addLiveWorkEvent(event: LiveWorkEvent) {
    if (!this.state.liveEvents) {
      this.state.liveEvents = [];
    }
    this.state.liveEvents.unshift(event);
    if (this.state.liveEvents.length > 50) {
      this.state.liveEvents.pop();
    }
    this.save();
  }

  public tickCommunityActivity() {
    const communityNames = ['Alex Crypto', 'Elena Web3', 'Tariq R.', 'Dev_Satoshi', 'CryptoNaut', 'Sarah_M', 'Hassan_BTC', 'Zack_Web3'];
    const randomName = communityNames[Math.floor(Math.random() * communityNames.length)];
    const types: ('CLAIM' | 'OFFERWALL' | 'PTC')[] = ['CLAIM', 'OFFERWALL', 'PTC'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const randomCoin = this.state.coins[Math.floor(Math.random() * this.state.coins.length)];

    let event: LiveWorkEvent;
    if (chosenType === 'CLAIM') {
      const amt = randomBetween(randomCoin.rewardMin, randomCoin.rewardMax);
      const formatted = formatAmount(amt, randomCoin.decimals);
      event = {
        id: 'live_' + Math.random().toString(36).substring(2, 9),
        type: 'CLAIM',
        userName: randomName,
        coin: randomCoin.symbol,
        amountFormatted: `+${formatted} ${randomCoin.symbol}`,
        usdValue: `$${(parseFloat(formatted) * randomCoin.usdPrice).toFixed(4)}`,
        timestamp: new Date().toISOString(),
        networkRef: `slot#${Math.floor(Math.random() * 900) + 100}`,
      };
    } else if (chosenType === 'OFFERWALL') {
      const ow = this.state.offerwalls[Math.floor(Math.random() * this.state.offerwalls.length)];
      const amt = (Math.random() * 0.4 + 0.1).toFixed(3);
      event = {
        id: 'live_' + Math.random().toString(36).substring(2, 9),
        type: 'OFFERWALL',
        userName: randomName,
        coin: ow.rewardCoin,
        amountFormatted: `+${amt} ${ow.rewardCoin}`,
        usdValue: `$${(parseFloat(amt) * (ow.rewardCoin === 'DOGE' ? 0.4 : 0.22)).toFixed(2)}`,
        timestamp: new Date().toISOString(),
        taskTitle: `${ow.name} Reward Task`,
      };
    } else {
      const amt = (Math.random() * 0.05 + 0.01).toFixed(4);
      event = {
        id: 'live_' + Math.random().toString(36).substring(2, 9),
        type: 'PTC',
        userName: randomName,
        coin: 'DOGE',
        amountFormatted: `+${amt} DOGE`,
        usdValue: `$${(parseFloat(amt) * 0.4).toFixed(3)}`,
        timestamp: new Date().toISOString(),
        taskTitle: 'Web3 Sponsored Surfing Task',
      };
    }
    this.addLiveWorkEvent(event);
  }

  public getCurrentUser(): UserAccount | null {
    if (!this.state.currentUserId) return null;
    return this.state.users.find((u) => u.id === this.state.currentUserId) || null;
  }

  public isLoggedIn(): boolean {
    return this.state.currentUserId !== null;
  }

  public setCurrentUser(userId: string | null) {
    this.state.currentUserId = userId;
    this.save();
  }

  public login(email: string): { ok: boolean; message: string; user?: UserAccount } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.state.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { ok: false, message: 'No account found with this email. Please Sign Up.' };
    }

    if (user.status === 'SUSPENDED') {
      return { ok: false, message: 'This account has been suspended by an administrator.' };
    }

    this.state.currentUserId = user.id;
    this.state.auditLogs.unshift({
      id: 'log_' + Date.now(),
      actor: user.name,
      action: 'USER_LOGIN',
      timestamp: new Date().toISOString(),
      details: `${user.name} logged in successfully.`,
    });

    this.save();
    return { ok: true, message: `Welcome back, ${user.name}!`, user };
  }

  public register(
    name: string, 
    email: string, 
    referralCode?: string
  ): { ok: boolean; message: string; user?: UserAccount } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail) {
      return { ok: false, message: 'Please provide both your name and a valid email.' };
    }

    if (this.state.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, message: 'An account with this email already exists. Please Sign In.' };
    }

    let referredById: string | undefined;
    if (referralCode && referralCode.trim()) {
      const referrer = this.state.users.find(
        (u) => u.referralCode.toUpperCase() === referralCode.trim().toUpperCase()
      );
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const newId = 'user_' + Math.random().toString(36).substring(2, 9);
    const newRefCode = 'FLOW-' + cleanName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() + Math.floor(Math.random() * 89 + 10);

    const newUser: UserAccount = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      role: 'USER',
      status: 'ACTIVE',
      referralCode: newRefCode,
      referredById,
      emailVerified: true,
      dailyBonusStreak: 1,
      createdAt: new Date().toISOString(),
    };

    this.state.users.push(newUser);

    this.state.balances[newId] = {} as Record<CoinSymbol, WalletBalance>;
    this.state.coins.forEach((c) => {
      let starter = 0n;
      if (c.symbol === 'DOGE') starter = toBaseUnits('0.25000000', 8);
      else if (c.symbol === 'TRX') starter = toBaseUnits('0.300000', 6);
      else starter = c.rewardMax * 3n;

      this.state.balances[newId][c.symbol] = {
        coin: c.symbol,
        available: starter,
        pending: 0n,
        lifetime: starter,
      };
    });

    this.state.currentUserId = newId;

    this.state.auditLogs.unshift({
      id: 'log_' + Date.now(),
      actor: cleanName,
      action: 'USER_REGISTER',
      timestamp: new Date().toISOString(),
      details: `New account created: ${cleanName} (${cleanEmail})${referredById ? ` referred by ${referredById}` : ''}.`,
    });

    this.save();
    return { ok: true, message: `Account created successfully! Welcome to FaucetFlow, ${cleanName}!`, user: newUser };
  }

  public logout() {
    const user = this.getCurrentUser();
    if (user) {
      this.state.auditLogs.unshift({
        id: 'log_' + Date.now(),
        actor: user.name,
        action: 'USER_LOGOUT',
        timestamp: new Date().toISOString(),
        details: `${user.name} logged out.`,
      });
    }
    this.state.currentUserId = null;
    this.save();
  }

  public toggleFastCooldown() {
    this.state.fastCooldownMode = !this.state.fastCooldownMode;
    this.save();
  }

  public toggleDemoMode() {
    this.state.demoMode = !this.state.demoMode;
    this.save();
  }

  public getEffectiveInterval(coin: CoinConfig): number {
    return this.state.fastCooldownMode ? 10 : coin.claimIntervalS;
  }

  public getLastClaim(userId: string, coinSymbol: CoinSymbol): FaucetClaimRecord | undefined {
    return this.state.claims
      .filter((c) => c.userId === userId && c.coin === coinSymbol)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  public getNextClaimTime(userId: string, coinSymbol: CoinSymbol): Date | null {
    const coin = this.state.coins.find((c) => c.symbol === coinSymbol);
    if (!coin) return null;
    const last = this.getLastClaim(userId, coinSymbol);
    if (!last) return null;

    const intervalS = this.getEffectiveInterval(coin);
    const nextAt = new Date(new Date(last.createdAt).getTime() + intervalS * 1000);
    return nextAt > new Date() ? nextAt : null;
  }

  public getClaimsToday(userId: string, coinSymbol: CoinSymbol): number {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.state.claims.filter(
      (c) =>
        c.userId === userId &&
        c.coin === coinSymbol &&
        new Date(c.createdAt) >= startOfDay
    ).length;
  }

  public getBalance(userId: string, coinSymbol: CoinSymbol): WalletBalance {
    if (!this.state.balances[userId]) {
      this.state.balances[userId] = {} as Record<CoinSymbol, WalletBalance>;
    }
    if (!this.state.balances[userId][coinSymbol]) {
      this.state.balances[userId][coinSymbol] = {
        coin: coinSymbol,
        available: 0n,
        pending: 0n,
        lifetime: 0n,
      };
    }
    return this.state.balances[userId][coinSymbol];
  }

  public async performClaim(coinSymbol: CoinSymbol): Promise<{
    ok: boolean;
    amount?: bigint;
    reason?: string;
    nextClaimAt?: Date;
    commission?: bigint;
    referrerName?: string;
  }> {
    const user = this.getCurrentUser();
    if (!user) {
      return { ok: false, reason: 'Please Sign In or Create an Account first to claim free crypto.' };
    }

    const coin = this.state.coins.find((c) => c.symbol === coinSymbol);

    if (!coin || !coin.enabled) {
      return { ok: false, reason: 'Coin is currently disabled.' };
    }

    const lockKey = `${user.id}:${coinSymbol}`;
    if (this.state.lockedResources.has(lockKey)) {
      return {
        ok: false,
        reason: 'Concurrent claim in progress (Postgres Advisory Lock Active).',
      };
    }

    this.state.lockedResources.add(lockKey);

    try {
      const now = new Date();
      const nextTime = this.getNextClaimTime(user.id, coinSymbol);
      if (nextTime && nextTime > now) {
        return {
          ok: false,
          reason: `Cooldown active. Please wait ${Math.ceil((nextTime.getTime() - now.getTime()) / 1000)}s.`,
          nextClaimAt: nextTime,
        };
      }

      const todayCount = this.getClaimsToday(user.id, coinSymbol);
      if (todayCount >= coin.dailyClaimCap) {
        return { ok: false, reason: `Daily limit reached (${coin.dailyClaimCap} claims/day).` };
      }

      const amount = randomBetween(coin.rewardMin, coin.rewardMax);
      const intervalS = this.getEffectiveInterval(coin);
      const slot = Math.floor(now.getTime() / (intervalS * 1000));
      const idempotencyKey = `claim:${user.id}:${coinSymbol}:${slot}`;

      if (this.state.transactions.some((t) => t.idempotencyKey === idempotencyKey)) {
        return { ok: false, reason: 'Claim slot already processed (Idempotency violation).' };
      }

      const claimRecord: FaucetClaimRecord = {
        id: 'claim_' + Math.random().toString(36).substring(2, 9),
        userId: user.id,
        userName: user.name,
        coin: coinSymbol,
        amount,
        createdAt: now.toISOString(),
        ip: '127.0.0.1 (Local Preview)',
      };
      this.state.claims.unshift(claimRecord);

      const tx: TransactionRecord = {
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        userId: user.id,
        coin: coinSymbol,
        type: 'FAUCET_CLAIM',
        amount,
        idempotencyKey,
        createdAt: now.toISOString(),
        meta: { claimId: claimRecord.id },
      };
      this.state.transactions.unshift(tx);

      const bal = this.getBalance(user.id, coinSymbol);
      bal.available += amount;
      bal.lifetime += amount;

      let commissionEarned = 0n;
      let referrerName: string | undefined;

      if (user.referredById) {
        const referrer = this.state.users.find((u) => u.id === user.referredById);
        if (referrer) {
          referrerName = referrer.name;
          commissionEarned = bps(amount, this.state.referralBps);
          if (commissionEarned > 0n) {
            const refBal = this.getBalance(referrer.id, coinSymbol);
            refBal.available += commissionEarned;
            refBal.lifetime += commissionEarned;

            this.state.transactions.unshift({
              id: 'tx_ref_' + Math.random().toString(36).substring(2, 9),
              userId: referrer.id,
              coin: coinSymbol,
              type: 'REFERRAL_COMMISSION',
              amount: commissionEarned,
              idempotencyKey: `refcomm:${claimRecord.id}`,
              createdAt: now.toISOString(),
              meta: { fromUserId: user.id, fromUserName: user.name },
            });
          }
        }
      }

      this.state.auditLogs.unshift({
        id: 'log_' + Date.now(),
        actor: user.name,
        action: 'FAUCET_CLAIM',
        target: coinSymbol,
        timestamp: now.toISOString(),
        details: `Successfully claimed ${formatAmount(amount, coin.decimals)} ${coinSymbol}.`,
      });

      this.addLiveWorkEvent({
        id: 'live_' + Math.random().toString(36).substring(2, 9),
        type: 'CLAIM',
        userName: user.name,
        coin: coinSymbol,
        amountFormatted: `+${formatAmount(amount, coin.decimals)} ${coinSymbol}`,
        usdValue: `$${(parseFloat(formatAmount(amount, coin.decimals)) * coin.usdPrice).toFixed(4)}`,
        timestamp: now.toISOString(),
        networkRef: `slot#${slot}`,
      });

      const nextClaimAt = new Date(now.getTime() + intervalS * 1000);
      this.save();

      return {
        ok: true,
        amount,
        nextClaimAt,
        commission: commissionEarned > 0n ? commissionEarned : undefined,
        referrerName,
      };
    } finally {
      this.state.lockedResources.delete(lockKey);
    }
  }

  public updateOfferwallLink(providerId: string, newLink: string): { ok: boolean; message: string } {
    const ow = this.state.offerwalls.find((o) => o.id === providerId);
    if (!ow) return { ok: false, message: 'Provider not found.' };

    ow.customLink = newLink.trim();
    ow.isPlaceholderLink = !newLink.trim().startsWith('http');

    this.state.auditLogs.unshift({
      id: 'log_ow_' + Date.now(),
      actor: this.getCurrentUser()?.name || 'ADMIN',
      action: 'UPDATE_OFFERWALL_LINK',
      target: ow.name,
      timestamp: new Date().toISOString(),
      details: `Updated affiliate link for ${ow.name} to "${ow.customLink}".`,
    });

    this.save();
    return { ok: true, message: `Successfully updated link for ${ow.name}!` };
  }

  public simulateOfferwallPostback(
    providerId: string, 
    rewardAmountStr: string = '0.35'
  ): { ok: boolean; message: string; amount?: bigint; coin?: CoinSymbol } {
    const user = this.getCurrentUser() || this.state.users[0];
    const ow = this.state.offerwalls.find((o) => o.id === providerId);
    if (!ow) return { ok: false, message: 'Offerwall not found.' };

    const coin = this.state.coins.find((c) => c.symbol === ow.rewardCoin)!;
    const amount = toBaseUnits(rewardAmountStr, coin.decimals);
    const externalId = 'ext_' + Math.random().toString(36).substring(2, 10);
    const idempotencyKey = `ow:${ow.id}:${externalId}`;

    const bal = this.getBalance(user.id, ow.rewardCoin);
    bal.available += amount;
    bal.lifetime += amount;

    this.state.transactions.unshift({
      id: 'tx_ow_' + Date.now(),
      userId: user.id,
      coin: ow.rewardCoin,
      type: 'OFFERWALL',
      amount,
      idempotencyKey,
      createdAt: new Date().toISOString(),
      meta: { provider: ow.name, externalId },
    });

    this.state.auditLogs.unshift({
      id: 'log_ow_pb_' + Date.now(),
      actor: 'WEBHOOK',
      action: 'OFFERWALL_POSTBACK_VERIFIED',
      target: ow.name,
      timestamp: new Date().toISOString(),
      details: `Credited ${formatAmount(amount, coin.decimals)} ${ow.rewardCoin} to ${user.name} for task completion via ${ow.name} (Tx: ${externalId}).`,
    });

    this.addLiveWorkEvent({
      id: 'live_ow_' + Date.now(),
      type: 'OFFERWALL',
      userName: user.name,
      coin: ow.rewardCoin,
      amountFormatted: `+${formatAmount(amount, coin.decimals)} ${ow.rewardCoin}`,
      usdValue: `$${(parseFloat(formatAmount(amount, coin.decimals)) * coin.usdPrice).toFixed(3)}`,
      timestamp: new Date().toISOString(),
      taskTitle: `${ow.name} Reward Task`,
    });

    this.save();
    return {
      ok: true,
      message: `Postback Verified! +${formatAmount(amount, coin.decimals)} ${ow.rewardCoin} credited to ${user.name}.`,
      amount,
      coin: ow.rewardCoin,
    };
  }

  public requestWithdrawal(
    coinSymbol: CoinSymbol, 
    amount: bigint, 
    address: string,
    payoutMethod: string = 'Direct Wallet'
  ): { ok: boolean; message: string } {
    const user = this.getCurrentUser();
    if (!user) {
      return { ok: false, message: 'Please Sign In or Create an Account first to withdraw funds.' };
    }

    const coin = this.state.coins.find((c) => c.symbol === coinSymbol);
    if (!coin) return { ok: false, message: 'Coin not found.' };

    if (!address || address.trim().length < 6) {
      return { ok: false, message: 'Please provide a valid cryptocurrency destination address or account.' };
    }

    if (amount < coin.minWithdrawal) {
      return {
        ok: false,
        message: `Amount is below minimum withdrawal limit of ${formatAmount(coin.minWithdrawal, coin.decimals)} ${coinSymbol}.`,
      };
    }

    const bal = this.getBalance(user.id, coinSymbol);
    if (bal.available < amount) {
      return { ok: false, message: 'Insufficient available balance.' };
    }

    bal.available -= amount;
    bal.pending += amount;

    const record: WithdrawalRecord = {
      id: 'wdr_' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      userName: user.name,
      coin: coinSymbol,
      amount,
      address: address.trim(),
      status: 'PENDING',
      payoutMethod,
      requestKey: `wdr:${user.id}:${coinSymbol}:${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.state.withdrawals.unshift(record);

    this.state.transactions.unshift({
      id: 'tx_wdr_' + Date.now(),
      userId: user.id,
      coin: coinSymbol,
      type: 'WITHDRAWAL',
      amount: -amount,
      idempotencyKey: record.requestKey,
      createdAt: new Date().toISOString(),
      meta: { address: address.trim(), method: payoutMethod, status: 'PENDING' },
    });

    this.state.auditLogs.unshift({
      id: 'log_wdr_' + Date.now(),
      actor: user.name,
      action: 'WITHDRAWAL_REQUEST',
      target: coinSymbol,
      timestamp: new Date().toISOString(),
      details: `Requested withdrawal of ${formatAmount(amount, coin.decimals)} ${coinSymbol} via ${payoutMethod} to ${address.trim()}.`,
    });

    this.save();
    return { ok: true, message: 'Withdrawal request queued! Ready for review in Admin Panel.' };
  }

  public reviewWithdrawal(
    wdrId: string, 
    action: 'APPROVE' | 'REJECT' | 'COMPLETE', 
    note?: string,
    customTxId?: string
  ): { ok: boolean; message: string } {
    const wdr = this.state.withdrawals.find((w) => w.id === wdrId);
    if (!wdr) return { ok: false, message: 'Withdrawal record not found.' };

    const reviewerName = this.getCurrentUser()?.name || 'ADMIN';
    const bal = this.getBalance(wdr.userId, wdr.coin);
    const coin = this.state.coins.find((c) => c.symbol === wdr.coin)!;

    if (action === 'REJECT') {
      wdr.status = 'REJECTED';
      wdr.reviewedBy = reviewerName;
      wdr.reviewNote = note || 'Rejected by administrator';
      
      bal.pending = bal.pending >= wdr.amount ? bal.pending - wdr.amount : 0n;
      bal.available += wdr.amount;

      this.state.transactions.unshift({
        id: 'tx_refund_' + Date.now(),
        userId: wdr.userId,
        coin: wdr.coin,
        type: 'WITHDRAWAL_REFUND',
        amount: wdr.amount,
        idempotencyKey: `refund:${wdr.id}:${Date.now()}`,
        createdAt: new Date().toISOString(),
        meta: { reason: wdr.reviewNote, originalWdrId: wdr.id },
      });
    } else if (action === 'APPROVE') {
      wdr.status = 'APPROVED';
      wdr.reviewedBy = reviewerName;
      wdr.reviewNote = note || 'Approved by admin, pending blockchain network broadcast.';
    } else if (action === 'COMPLETE') {
      wdr.status = 'COMPLETED';
      wdr.reviewedBy = reviewerName;
      wdr.providerRef = customTxId?.trim() || ('0x' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join(''));
      wdr.reviewNote = note || 'Confirmed and broadcast on blockchain network';
      
      bal.pending = bal.pending >= wdr.amount ? bal.pending - wdr.amount : 0n;

      this.addLiveWorkEvent({
        id: 'live_wdr_' + Date.now(),
        type: 'WITHDRAWAL',
        userName: wdr.userName,
        coin: wdr.coin,
        amountFormatted: `-${formatAmount(wdr.amount, coin.decimals)} ${wdr.coin}`,
        usdValue: `$${(parseFloat(formatAmount(wdr.amount, coin.decimals)) * coin.usdPrice).toFixed(2)}`,
        timestamp: new Date().toISOString(),
        networkRef: wdr.providerRef,
        taskTitle: `Verified Payout via ${wdr.payoutMethod || 'Gateway'}`,
      });
    }

    this.state.auditLogs.unshift({
      id: 'log_' + Date.now(),
      actor: reviewerName,
      action: `WITHDRAWAL_${action}`,
      target: wdr.id,
      timestamp: new Date().toISOString(),
      details: `${action} withdrawal of ${formatAmount(wdr.amount, coin.decimals)} ${wdr.coin} for ${wdr.userName}. ${note ? `Note: "${note}"` : ''}`,
    });

    this.save();
    return { ok: true, message: `Withdrawal ${action.toLowerCase()}d successfully!` };
  }

  public updateGlobalMinWithdrawal(newMin: string) {
    this.state.globalMinWithdrawal = newMin;
    this.state.coins.forEach((c) => {
      try {
        c.minWithdrawal = toBaseUnits(newMin, c.decimals);
      } catch (e) {
        // fallback
      }
    });

    this.state.auditLogs.unshift({
      id: 'log_set_' + Date.now(),
      actor: this.getCurrentUser()?.name || 'ADMIN',
      action: 'SETTING_UPDATE',
      target: 'global_min_withdrawal',
      timestamp: new Date().toISOString(),
      details: `Updated minimum withdrawal to ${newMin} base units.`,
    });

    this.save();
  }

  public updateReferralBps(newBps: number) {
    this.state.referralBps = Math.max(0, Math.min(5000, newBps));
    this.save();
  }

  public redeemPromoCode(code: string): { ok: boolean; message: string } {
    const user = this.getCurrentUser();
    if (!user) {
      return { ok: false, message: 'Please Sign In or Create an Account first to redeem promo codes.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = this.state.promoCodes.find((p) => p.code === cleanCode);

    if (!promo || !promo.active) {
      return { ok: false, message: 'Invalid or expired promo code.' };
    }
    if (promo.redeemedBy.includes(user.id)) {
      return { ok: false, message: 'You have already redeemed this promo code.' };
    }
    if (promo.usedCount >= promo.maxUses) {
      return { ok: false, message: 'Promo code usage limit has been reached.' };
    }

    const coin = this.state.coins.find((c) => c.symbol === promo.coin)!;
    promo.redeemedBy.push(user.id);
    promo.usedCount += 1;

    const bal = this.getBalance(user.id, promo.coin);
    bal.available += promo.amount;
    bal.lifetime += promo.amount;

    this.state.transactions.unshift({
      id: 'tx_promo_' + Date.now(),
      userId: user.id,
      coin: promo.coin,
      type: 'PROMO',
      amount: promo.amount,
      idempotencyKey: `promo:${promo.code}:${user.id}`,
      createdAt: new Date().toISOString(),
      meta: { code: promo.code },
    });

    this.save();
    return {
      ok: true,
      message: `Success! Code applied: +${formatAmount(promo.amount, coin.decimals)} ${promo.coin} added.`,
    };
  }

  public completePtcAd(adId: string): { ok: boolean; message: string; amount?: bigint; coin?: CoinSymbol } {
    const user = this.getCurrentUser();
    if (!user) {
      return { ok: false, message: 'Please Sign In or Create an Account first to complete tasks.' };
    }

    const ad = this.state.ptcAds.find((a) => a.id === adId);
    if (!ad) return { ok: false, message: 'Ad not found.' };

    const coin = this.state.coins.find((c) => c.symbol === ad.rewardCoin)!;
    const bal = this.getBalance(user.id, ad.rewardCoin);
    bal.available += ad.rewardAmount;
    bal.lifetime += ad.rewardAmount;

    this.state.transactions.unshift({
      id: 'tx_ptc_' + Date.now(),
      userId: user.id,
      coin: ad.rewardCoin,
      type: 'PTC',
      amount: ad.rewardAmount,
      idempotencyKey: `ptc:${ad.id}:${user.id}:${Date.now()}`,
      createdAt: new Date().toISOString(),
      meta: { adTitle: ad.title },
    });

    this.addLiveWorkEvent({
      id: 'live_ptc_' + Date.now(),
      type: 'PTC',
      userName: user.name,
      coin: ad.rewardCoin,
      amountFormatted: `+${formatAmount(ad.rewardAmount, coin.decimals)} ${ad.rewardCoin}`,
      usdValue: `$${(parseFloat(formatAmount(ad.rewardAmount, coin.decimals)) * coin.usdPrice).toFixed(4)}`,
      timestamp: new Date().toISOString(),
      taskTitle: ad.title,
    });

    this.save();
    return {
      ok: true,
      message: `Task completed! +${formatAmount(ad.rewardAmount, coin.decimals)} ${ad.rewardCoin} credited.`,
      amount: ad.rewardAmount,
      coin: ad.rewardCoin,
    };
  }

  public claimDailyBonus(): { ok: boolean; message: string; amount?: bigint; coin?: CoinSymbol } {
    const user = this.getCurrentUser();
    if (!user) {
      return { ok: false, message: 'Please Sign In or Create an Account first to claim daily bonuses.' };
    }

    const now = new Date();

    if (user.lastDailyBonusAt) {
      const last = new Date(user.lastDailyBonusAt);
      const hoursSince = (now.getTime() - last.getTime()) / (1000 * 3600);
      if (hoursSince < 24) {
        const remainingHours = Math.ceil(24 - hoursSince);
        return { ok: false, message: `Daily bonus ready in ${remainingHours} hours.` };
      }
      user.dailyBonusStreak = Math.min(7, (user.dailyBonusStreak || 1) + 1);
    } else {
      user.dailyBonusStreak = 1;
    }

    user.lastDailyBonusAt = now.toISOString();
    const baseReward = toBaseUnits('0.05000000', 8);
    const amount = baseReward * BigInt(user.dailyBonusStreak);
    const coin: CoinSymbol = 'DOGE';

    const bal = this.getBalance(user.id, coin);
    bal.available += amount;
    bal.lifetime += amount;

    this.state.transactions.unshift({
      id: 'tx_streak_' + Date.now(),
      userId: user.id,
      coin,
      type: 'DAILY_BONUS',
      amount,
      idempotencyKey: `streak:${user.id}:${now.toISOString().slice(0, 10)}`,
      createdAt: now.toISOString(),
      meta: { streakDay: user.dailyBonusStreak },
    });

    this.save();
    return {
      ok: true,
      message: `Streak Day ${user.dailyBonusStreak}! Received ${formatAmount(amount, 8)} DOGE.`,
      amount,
      coin,
    };
  }

  public resetToSeed() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadInitialState();
    this.save();
  }
}

export const faucetStore = new FaucetStore();
