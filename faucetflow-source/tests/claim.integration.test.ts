// Integration tests: need a real, migrated Postgres. Run with a throwaway database:
//   DATABASE_URL=postgresql://... npx prisma migrate deploy && npm test
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

d("claim engine", () => {
  let db: typeof import("@/lib/db").db;
  let performClaim: typeof import("@/lib/claim").performClaim;
  let userId: string;
  let referrerId: string;

  beforeAll(async () => {
    ({ db } = await import("@/lib/db"));
    ({ performClaim } = await import("@/lib/claim"));
    await db.coin.upsert({
      where: { symbol: "TST" },
      create: { symbol: "TST", name: "Test", decimals: 8, rewardMin: 100n, rewardMax: 200n, minWithdrawal: 1000n, claimIntervalS: 300, dailyClaimCap: 3 },
      update: { claimIntervalS: 300, dailyClaimCap: 3 },
    });
    const suffix = Date.now();
    const referrer = await db.user.create({ data: { email: `ref${suffix}@t.dev`, referralCode: `R${suffix}` } });
    const user = await db.user.create({ data: { email: `u${suffix}@t.dev`, referralCode: `U${suffix}`, referredById: referrer.id } });
    await db.referral.create({ data: { referrerId: referrer.id, referredId: user.id } });
    userId = user.id;
    referrerId = referrer.id;
  });

  afterAll(async () => db?.$disconnect());

  it("credits a claim and a referral commission", async () => {
    const r = await performClaim(userId, "TST");
    expect(r.ok).toBe(true);
    const bal = await db.walletBalance.findUnique({ where: { userId_coin: { userId, coin: "TST" } } });
    expect(bal!.available >= 100n && bal!.available <= 200n).toBe(true);
    const refBal = await db.walletBalance.findUnique({ where: { userId_coin: { userId: referrerId, coin: "TST" } } });
    expect(refBal!.available).toBeGreaterThan(0n);
  });

  it("blocks a second claim during cooldown", async () => {
    const r = await performClaim(userId, "TST");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("cooldown");
  });

  it("allows only one of many concurrent claims", async () => {
    const fresh = await db.user.create({ data: { email: `c${Date.now()}@t.dev`, referralCode: `C${Date.now()}` } });
    const results = await Promise.all(Array.from({ length: 8 }, () => performClaim(fresh.id, "TST")));
    expect(results.filter((r) => r.ok).length).toBe(1);
  });

  it("enforces the daily limit", async () => {
    const u = await db.user.create({ data: { email: `d${Date.now()}@t.dev`, referralCode: `D${Date.now()}` } });
    const t0 = new Date();
    t0.setUTCHours(1, 0, 0, 0);
    const outcomes = [];
    for (let i = 0; i < 4; i++) outcomes.push(await performClaim(u.id, "TST", undefined, new Date(t0.getTime() + i * 301_000)));
    expect(outcomes.slice(0, 3).every((o) => o.ok)).toBe(true);
    expect(outcomes[3].ok).toBe(false);
  });
});
