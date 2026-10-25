import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonSafe } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonSafe({ error: "Sign in required" }, 401);

  const [balances, recent, claimCount, referrals] = await Promise.all([
    db.walletBalance.findMany({ where: { userId: user.id } }),
    db.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.faucetClaim.count({ where: { userId: user.id } }),
    db.referral.findMany({ where: { referrerId: user.id } }),
  ]);

  return jsonSafe({
    email: user.email,
    emailVerified: !!user.emailVerifiedAt,
    referralCode: user.referralCode,
    balances,
    recentTransactions: recent,
    totalClaims: claimCount,
    referralCount: referrals.length,
    referralEarnings: referrals.reduce((s, r) => s + r.totalEarned, 0n),
  });
}
