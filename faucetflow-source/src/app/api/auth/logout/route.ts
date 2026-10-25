import { NextRequest } from "next/server";
import { destroySession } from "@/lib/auth";
import { jsonSafe, sameOrigin } from "@/lib/http";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonSafe({ error: "Bad origin" }, 403);
  await destroySession();
  return jsonSafe({ ok: true });
}
