import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE = "ff_session";
const SESSION_DAYS = 14;
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = sha256;

export function newReferralCode(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function createSession(userId: string, ip?: string, userAgent?: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.session.create({
    data: { tokenHash: sha256(token), userId, ip, userAgent, expiresAt },
  });
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const token = cookies().get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
  cookies().delete(COOKIE);
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  if (session.user.status !== "ACTIVE") return null;
  return session.user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

/** Returns the user on success, or a reason string on failure. */
export async function checkLogin(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const dummy = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO5y3m4cF0C3m8vJrX1b0d8m1Z8Q8Z8Zy";
  const ok = await verifyPassword(password, user?.passwordHash ?? dummy);
  if (!user) return "invalid" as const;
  if (user.lockedUntil && user.lockedUntil > new Date()) return "locked" as const;
  if (!ok) {
    const failed = user.failedLogins + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLogins: failed >= MAX_FAILED ? 0 : failed,
        lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      },
    });
    return "invalid" as const;
  }
  if (user.status !== "ACTIVE") return "suspended" as const;
  await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
  return user;
}
