import { NextRequest, NextResponse } from "next/server";

export const clientIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    // BigInt is not JSON-serialisable: send amounts as strings.
  });

export const bigintReplacer = (_: string, v: unknown) => (typeof v === "bigint" ? v.toString() : v);

export function jsonSafe(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data, bigintReplacer), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * CSRF defence for cookie-authenticated POSTs: require the Origin header
 * to match APP_URL. Combined with SameSite=Lax cookies.
 */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const app = process.env.APP_URL;
  return !!app && new URL(app).origin === origin;
}
