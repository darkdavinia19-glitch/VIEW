import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatAmount } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [coins, balances, txs, claimCount, referrals] = await Promise.all([
    db.coin.findMany(),
    db.walletBalance.findMany({ where: { userId: user.id } }),
    db.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.faucetClaim.count({ where: { userId: user.id } }),
    db.referral.findMany({ where: { referrerId: user.id } }),
  ]);
  const dec = Object.fromEntries(coins.map((c) => [c.symbol, c.decimals]));
  const link = `${process.env.APP_URL ?? ""}/register?ref=${user.referralCode}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {!user.emailVerifiedAt && (
        <p role="alert" className="card border-neon-purple/40 text-sm">
          Email not verified. Verification email delivery requires SMTP credentials to be configured.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><div className="text-sm text-slate-400">Total claims</div><div className="text-2xl font-bold">{claimCount}</div></div>
        <div className="card"><div className="text-sm text-slate-400">Referrals</div><div className="text-2xl font-bold">{referrals.length}</div></div>
        <div className="card"><div className="text-sm text-slate-400">Your referral link</div><div className="break-all text-xs text-neon-green">{link}</div></div>
      </div>
      <section className="card">
        <h2 className="mb-3 font-bold">Balances</h2>
        {balances.length === 0 ? <p className="text-sm text-slate-400">No balance yet. Make your first claim!</p> : (
          <ul className="space-y-1 text-sm">
            {balances.map((b) => (
              <li key={b.id}>{b.coin}: {formatAmount(b.available, dec[b.coin])} available · {formatAmount(b.pending, dec[b.coin])} pending · {formatAmount(b.lifetime, dec[b.coin])} lifetime</li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2 className="mb-3 font-bold">Recent transactions</h2>
        {txs.length === 0 ? <p className="text-sm text-slate-400">Nothing yet.</p> : (
          <ul className="space-y-1 text-sm">
            {txs.map((t) => (
              <li key={t.id}>{t.createdAt.toISOString().slice(0, 16).replace("T", " ")} · {t.type} · {formatAmount(t.amount, dec[t.coin])} {t.coin}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
