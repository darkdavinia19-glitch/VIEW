import { db } from "./db";

/**
 * Fixed-window rate limiter stored in Postgres so it works across
 * serverless instances. Returns true if the request is allowed.
 */
export async function rateLimit(key: string, limit: number, windowS: number): Promise<boolean> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowS * 1000);
  const row = await db.$transaction(async (tx) => {
    const existing = await tx.rateLimit.findUnique({ where: { key } });
    if (!existing || existing.windowStart < cutoff) {
      return tx.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      });
    }
    return tx.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  });
  return row.count <= limit;
}
