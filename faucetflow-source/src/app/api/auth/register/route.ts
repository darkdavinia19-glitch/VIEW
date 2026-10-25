import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword, hashToken, newReferralCode, newToken } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { verifyCaptcha } from "@/lib/captcha";
import { clientIp, jsonSafe, sameOrigin } from "@/lib/http";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(10).max(128),
  ref: z.string().max(32).optional(),
  captcha: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonSafe({ error: "Bad origin" }, 403);
  const ip = clientIp(req);
  if (!(await rateLimit(`register:${ip}`, 5, 3600))) {
    return jsonSafe({ error: "Too many sign-ups from this network. Try later." }, 429);
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonSafe({ error: "Invalid input (password needs 10+ characters)" }, 400);
  const { email, password, ref, captcha } = parsed.data;

  if (!(await verifyCaptcha(captcha, ip))) return jsonSafe({ error: "CAPTCHA failed" }, 400);

  const normalized = email.toLowerCase();
  if (await db.user.findUnique({ where: { email: normalized } })) {
    // Generic message avoids confirming which emails are registered.
    return jsonSafe({ error: "Could not create account with those details" }, 400);
  }

  const referrer = ref ? await db.user.findUnique({ where: { referralCode: ref.toUpperCase() } }) : null;
  // Self-referral is impossible at signup (new account), but block same-IP referral farming.
  const sameIpReferral = referrer && (await db.user.findFirst({ where: { id: referrer.id, signupIp: ip } }));

  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email: normalized,
        passwordHash: await hashPassword(password),
        referralCode: newReferralCode(),
        signupIp: ip,
        referredById: referrer && !sameIpReferral ? referrer.id : null,
      },
    });
    if (u.referredById) await tx.referral.create({ data: { referrerId: u.referredById, referredId: u.id } });
    const token = newToken();
    await tx.emailToken.create({
      data: {
        tokenHash: hashToken(token),
        purpose: "verify",
        userId: u.id,
        expiresAt: new Date(Date.now() + 24 * 3600_000),
      },
    });
    // EMAIL DELIVERY REQUIRES SMTP CREDENTIALS (see .env.example). Until sendMail is
    // wired to a provider, verification links are NOT sent and accounts stay unverified.
    return u;
  });

  await createSession(user.id, ip, req.headers.get("user-agent") ?? undefined);
  return jsonSafe({ ok: true, emailVerified: false });
}
