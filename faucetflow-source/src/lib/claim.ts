import { Prisma } from "@prisma/client";
import { db } from "./db";
import { bps, randomBetween } from "./money";

export type ClaimResult =
  | { ok: true; amount: bigint; nextClaimAt: Date; claimsToday: number }
  | { ok: false; reason: "coin_disabled" | "cooldown" | "daily_limit"; retryAt?: Date };

const DEFAULT_REFERRAL_BPS = 1000; // 10%, overridable via AdminSetting "referral_commission_bps"

async function referralBps(tx: Prisma.TransactionClient): Promise<number> {
  const s = await tx.adminSetting.findUnique({ where: { key: "referral_commission_bps" } });
  return typeof s?.value === "number" ? s.value : DEFAULT_REFERRAL_BPS;
}

/**
 * Performs a faucet claim atomically.
 *
 * Safety properties:
 *  - A per-(user,coin) Postgres advisory lock serialises concurrent claims,
 *    so two parallel requests cannot both pass the cooldown check.
 *  - The Transaction.idempotencyKey unique constraint is a second line of
 *    defence: the same claim slot can never be credited twice.
 *  - Reward amount is chosen server-side; the client sends nothing but the coin.
 */
export async function performClaim(
  userId: string,
  coinSymbol: string,
  ip?: string,
  now: Date = new Date(),
): Promise<ClaimResult> {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId + ":" + coinSymbol}))`;

    const coin = await tx.coin.findUnique({ where: { symbol: coinSymbol } });
    if (!coin || !coin.enabled) return { ok: false, reason: "coin_disabled" } as const;

    const last = await tx.faucetClaim.findFirst({
      where: { userId, coin: coinSymbol },
      orderBy: { createdAt: "desc" },
    });
    if (last) {
      const retryAt = new Date(last.createdAt.getTime() + coin.claimIntervalS * 1000);
      if (retryAt > now) return { ok: false, reason: "cooldown", retryAt } as const;
    }

    const dayStart = new Date(now);
    dayStart.setUTCHours(0, 0, 0, 0);
    const claimsToday = await tx.faucetClaim.count({
      where: { userId, coin: coinSymbol, createdAt: { gte: dayStart } },
    });
    if (claimsToday >= coin.dailyClaimCap) {
      const retryAt = new Date(dayStart.getTime() + 86400_000);
      return { ok: false, reason: "daily_limit", retryAt } as const;
    }

    const amount = randomBetween(coin.rewardMin, coin.rewardMax);
    const slot = Math.floor(now.getTime() / (coin.claimIntervalS * 1000));
    const claim = await tx.faucetClaim.create({
      data: { userId, coin: coinSymbol, amount, ip, createdAt: now },
    });

    await tx.transaction.create({
      data: {
        userId,
        coin: coinSymbol,
        type: "FAUCET_CLAIM",
        amount,
        idempotencyKey: `claim:${userId}:${coinSymbol}:${slot}`,
        meta: { claimId: claim.id },
      },
    });
    await tx.walletBalance.upsert({
      where: { userId_coin: { userId, coin: coinSymbol } },
      create: { userId, coin: coinSymbol, available: amount, lifetime: amount },
      update: { available: { increment: amount }, lifetime: { increment: amount } },
    });

    // Referral commission: paid from platform funds on top of the user's reward.
    const user = await tx.user.findUnique({ where: { id: userId }, select: { referredById: true } });
    if (user?.referredById) {
      const commission = bps(amount, await referralBps(tx));
      if (commission > 0n) {
        await tx.transaction.create({
          data: {
            userId: user.referredById,
            coin: coinSymbol,
            type: "REFERRAL_COMMISSION",
            amount: commission,
            idempotencyKey: `refcomm:${claim.id}`,
            meta: { fromUserId: userId },
          },
        });
        await tx.walletBalance.upsert({
          where: { userId_coin: { userId: user.referredById, coin: coinSymbol } },
          create: { userId: user.referredById, coin: coinSymbol, available: commission, lifetime: commission },
          update: { available: { increment: commission }, lifetime: { increment: commission } },
        });
        await tx.referral.update({
          where: { referredId: userId },
          data: { totalEarned: { increment: commission } },
        });
      }
    }

    return {
      ok: true,
      amount,
      claimsToday: claimsToday + 1,
      nextClaimAt: new Date(now.getTime() + coin.claimIntervalS * 1000),
    } as const;
  });
}
