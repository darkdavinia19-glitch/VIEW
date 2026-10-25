import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatAmount } from "@/lib/money";
import ClaimButton from "@/components/ClaimButton";

export const dynamic = "force-dynamic";

export default async function Faucets() {
  const [user, coins] = await Promise.all([
    getCurrentUser(),
    db.coin.findMany({ where: { enabled: true }, orderBy: { symbol: "asc" } }),
  ]);

  const retry: Record<string, string | null> = {};
  if (user) {
    for (const c of coins) {
      const last = await db.faucetClaim.findFirst({
        where: { userId: user.id, coin: c.symbol },
        orderBy: { createdAt: "desc" },
      });
      const at = last ? new Date(last.createdAt.getTime() + c.claimIntervalS * 1000) : null;
      retry[c.symbol] = at && at > new Date() ? at.toISOString() : null;
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Faucets</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coins.map((c) => (
          <div key={c.symbol} className="card space-y-3">
            <h2 className="text-xl font-bold">{c.name} <span className="text-neon-blue">{c.symbol}</span></h2>
            <p className="text-sm text-slate-400">
              Reward: {formatAmount(c.rewardMin, c.decimals)} – {formatAmount(c.rewardMax, c.decimals)} {c.symbol}
              <br />Every {Math.round(c.claimIntervalS / 60)} min · up to {c.dailyClaimCap}/day
            </p>
            {user ? (
              <ClaimButton coin={c.symbol} retryAt={retry[c.symbol]} />
            ) : (
              <Link href="/login" className="btn-ghost w-full text-center">Sign in to claim</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
