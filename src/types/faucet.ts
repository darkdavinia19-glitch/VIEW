export type CoinSymbol = 'BTC' | 'LTC' | 'DOGE' | 'BCH' | 'TRX' | 'ETH';

export interface CoinConfig {
  symbol: CoinSymbol;
  name: string;
  decimals: number;
  enabled: boolean;
  rewardMin: bigint;
  rewardMax: bigint;
  claimIntervalS: number;
  dailyClaimCap: number;
  minWithdrawal: bigint; // Set to 0.1 base units
  payoutNetwork: string;
  iconColor: string;
  usdPrice: number;
}

export type TxType =
  | 'FAUCET_CLAIM'
  | 'DAILY_BONUS'
  | 'PTC'
  | 'OFFERWALL'
  | 'SHORTLINK'
  | 'REFERRAL_COMMISSION'
  | 'PROMO'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_REFUND'
  | 'ADMIN_ADJUSTMENT';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';

export interface WalletBalance {
  coin: CoinSymbol;
  available: bigint;
  pending: bigint;
  lifetime: bigint;
}

export interface FaucetClaimRecord {
  id: string;
  userId: string;
  userName: string;
  coin: CoinSymbol;
  amount: bigint;
  createdAt: string;
  ip?: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  coin: CoinSymbol;
  type: TxType;
  amount: bigint;
  idempotencyKey: string;
  createdAt: string;
  meta?: Record<string, any>;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  userName: string;
  coin: CoinSymbol;
  amount: bigint;
  address: string;
  status: WithdrawalStatus;
  providerRef?: string;
  payoutMethod?: string; // 'Direct Wallet' | 'FaucetPay' | 'Payeer'
  reviewedBy?: string;
  reviewNote?: string;
  requestKey: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  referralCode: string;
  referredById?: string;
  emailVerified: boolean;
  dailyBonusStreak: number;
  lastDailyBonusAt?: string;
  createdAt: string;
}

export interface PtcAd {
  id: string;
  title: string;
  description: string;
  url: string;
  rewardCoin: CoinSymbol;
  rewardAmount: bigint;
  durationS: number;
  active: boolean;
  completed?: boolean;
}

export interface OfferwallProvider {
  id: string;
  name: string;
  tagline: string;
  category: 'Surveys' | 'Multi-task' | 'Mobile Apps' | 'Rewarded Video';
  badge: string;
  rating: number;
  description: string;
  avgRewardRange: string;
  payoutSpeed: string;
  customLink: string; // Field where user will paste their affiliate link later
  isPlaceholderLink: boolean;
  active: boolean;
  featured?: boolean;
  accentColor: string;
  rewardCoin: CoinSymbol;
}

export interface PromoCodeItem {
  code: string;
  coin: CoinSymbol;
  amount: bigint;
  maxUses: number;
  usedCount: number;
  active: boolean;
  redeemedBy: string[]; // userIds
}

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  target?: string;
  timestamp: string;
  details: string;
}

export interface LiveWorkEvent {
  id: string;
  type: 'CLAIM' | 'OFFERWALL' | 'PTC' | 'WITHDRAWAL' | 'STREAK';
  userName: string;
  coin: CoinSymbol;
  amountFormatted: string;
  usdValue: string;
  timestamp: string;
  networkRef?: string;
  taskTitle?: string;
}
