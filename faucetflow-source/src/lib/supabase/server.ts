import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Per-request client acting as the signed-in user (reads the auth cookie). */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            /* called from a Server Component: middleware refreshes the session */
          }
        },
      },
    },
  );
}

/** Privileged client. SERVER ONLY. Bypasses RLS, so never import from client code. */
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  });
}
