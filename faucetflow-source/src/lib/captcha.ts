/**
 * CAPTCHA verification (hCaptcha-compatible siteverify endpoint).
 * REQUIRES EXTERNAL CREDENTIALS: CAPTCHA_SECRET_KEY.
 * - demo mode without a key: skipped (the UI shows a "demo" notice).
 * - production without a key: fails closed, requests are rejected.
 */
export async function verifyCaptcha(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.CAPTCHA_SECRET_KEY;
  if (!secret) return process.env.APP_MODE !== "production";
  if (!token) return false;
  try {
    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
