import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Real numbers only: zero is shown honestly if nothing has happened yet.
  const [users, claims, coins] = await Promise.all([
    db.user.count(),
    db.faucetClaim.count(),
    db.coin.findMany({ where: { enabled: true }, orderBy: { symbol: "asc" } }),
  ]);
  const completed = await db.withdrawal.count({ where: { status: "COMPLETED" } });

  return (
    <div className="space-y-16">
      <section className="py-16 text-center">
        <h1 className="text-4xl font-extrabold md:text-6xl">
          Claim crypto rewards,{" "}
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green bg-clip-text text-transparent">
            the honest way
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Claim on a timer, complete verified tasks, invite friends, and withdraw once you reach the minimum.
        </p>
        <Link href="/register" className="btn-primary mt-8">Start claiming</Link>
      </section>

      <section aria-label="Platform statistics" className="grid gap-4 sm:grid-cols-3">
        {[
          ["Members", users],
          ["Total claims", claims],
          ["Completed payouts", completed],
        ].map(([label, n]) => (
          <div key={label as string} className="card text-center">
            <div className="text-3xl font-bold text-neon-green">{n as number}</div>
            <div className="text-sm text-slate-400">{label as string}</div>
          </div>
        ))}
      </section>

      <section aria-label="Supported coins">
        <h2 className="mb-4 text-2xl font-bold">Supported coins</h2>
        <div className="flex flex-wrap gap-3">
          {coins.map((c) => (
            <span key={c.symbol} className="card px-4 py-2 text-sm">{c.symbol} · {c.name}</span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">FAQ</h2>
        <details className="card mb-2"><summary>How much can I earn?</summary>
          <p className="mt-2 text-slate-400">Faucet rewards are tiny by design. Earnings depend on activity and are never guaranteed.</p>
        </details>
        <details className="card"><summary>When are withdrawals paid?</summary>
          <p className="mt-2 text-slate-400">After you hit the minimum, requests are reviewed and sent through the payout provider. Status shows Completed only once the provider confirms.</p>
        </details>
      </section>
    </div>
  );
}
