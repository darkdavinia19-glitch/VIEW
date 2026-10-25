import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { performClaim } from "@/lib/claim";
import { rateLimit } from "@/lib/ratelimit";
import { verifyCaptcha } from "@/lib/captcha";
import { clientIp, jsonSafe, sameOrigin } from "@/lib/http";
import { db } from "@/lib/db";

const schema = z.object({ coin: z.string().min(2).max(10), captcha: z.string().optional() });

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonSafe({ error: "Bad origin" }, 403);
  const user = await getCurrentUser();
  if (!user) return jsonSafe({ error: "Sign in required" }, 401);

  const maint = await db.adminSetting.findUnique({ where: { key: "maintenance_mode" } });
  if (maint?.value === true) return jsonSafe({ error: "Site is under maintenance" }, 503);

  const ip = clientIp(req);
  if (!(await rateLimit(`claim:${user.id}`, 10, 60))) return jsonSafe({ error: "Slow down" }, 429);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonSafe({ error: "Invalid input" }, 400);

  if (!(await verifyCaptcha(parsed.data.captcha, ip))) return jsonSafe({ error: "CAPTCHA failed" }, 400);

  const result = await performClaim(user.id, parsed.data.coin.toUpperCase(), ip);
  if (!result.ok) {
    const messages = {
      coin_disabled: "This faucet is not available.",
      cooldown: "Your next claim isn't ready yet.",
      daily_limit: "You've reached today's claim limit for this coin.",
    };
    return jsonSafe({ error: messages[result.reason], reason: result.reason, retryAt: result.retryAt }, 429);
  }
  return jsonSafe({ ok: true, amount: result.amount, nextClaimAt: result.nextClaimAt, claimsToday: result.claimsToday });
}
