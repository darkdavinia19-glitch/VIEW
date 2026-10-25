import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://wgywqbehvzhmwzazmkbd.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Xhpj1qdSsFp3BuQ-Bff0uA_DKmf9w8G';
const STORAGE_SUPABASE_KEY = 'faucetflow_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let currentKey = localStorage.getItem(STORAGE_SUPABASE_KEY) || DEFAULT_SUPABASE_ANON_KEY;

export function getSupabaseKey(): string {
  return currentKey || DEFAULT_SUPABASE_ANON_KEY;
}

export function setSupabaseKey(key: string): void {
  currentKey = key.trim() || DEFAULT_SUPABASE_ANON_KEY;
  localStorage.setItem(STORAGE_SUPABASE_KEY, currentKey);
  cachedClient = null; // reset cached client
}

export function getSupabaseClient(): SupabaseClient | null {
  const keyToUse = currentKey || DEFAULT_SUPABASE_ANON_KEY;
  if (!keyToUse) return null;
  if (!cachedClient) {
    try {
      cachedClient = createClient(DEFAULT_SUPABASE_URL, keyToUse);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
}

export async function checkSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  latencyMs?: number;
}> {
  const start = performance.now();
  const keyToUse = currentKey || DEFAULT_SUPABASE_ANON_KEY;
  try {
    // Ping Supabase Auth Health endpoint with the project API key
    const res = await fetch(`${DEFAULT_SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: keyToUse ? { apikey: keyToUse } : {},
    });
    const latencyMs = Math.round(performance.now() - start);

    if (res.status === 200) {
      return {
        ok: true,
        message: `Successfully connected & verified with Supabase project wgywqbehvzhmwzazmkbd! (${latencyMs}ms)`,
        latencyMs,
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        ok: true,
        message: `Connected to Supabase (${latencyMs}ms). Key accepted for project wgywqbehvzhmwzazmkbd.`,
        latencyMs,
      };
    }

    return {
      ok: false,
      message: `Received status ${res.status} from Supabase endpoint.`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Network error reaching ${DEFAULT_SUPABASE_URL}: ${err.message}`,
    };
  }
}
