import { NextRequest } from "next/server";
import { z } from "zod";
import { checkLogin, createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp, jsonSafe, sameOrigin } from "@/lib/http";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonSafe({ error: "Bad origin" }, 403);
  const ip = clientIp(req);
  if (!(await rateLimit(`login:${ip}`, 20, 900))) return jsonSafe({ error: "Too many attempts" }, 429);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonSafe({ error: "Invalid input" }, 400);

  const result = await checkLogin(parsed.data.email, parsed.data.password);
  if (result === "locked") return jsonSafe({ error: "Account temporarily locked. Try again later." }, 423);
  if (result === "suspended") return jsonSafe({ error: "Account suspended" }, 403);
  if (result === "invalid") return jsonSafe({ error: "Invalid email or password" }, 401);

  await createSession(result.id, ip, req.headers.get("user-agent") ?? undefined);
  return jsonSafe({ ok: true });
}
