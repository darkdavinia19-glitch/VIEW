"use client";
import { useEffect, useState } from "react";

export default function ClaimButton({ coin, retryAt }: { coin: string; retryAt: string | null }) {
  const [next, setNext] = useState<number>(retryAt ? new Date(retryAt).getTime() : 0);
  const [now, setNow] = useState(Date.now());
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, Math.ceil((next - now) / 1000));

  async function claim() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/faucet/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ coin }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setNext(new Date(data.nextClaimAt).getTime());
      setMsg(`Claimed ${data.amount} base units of ${coin}.`);
    } else {
      if (data.retryAt) setNext(new Date(data.retryAt).getTime());
      setMsg(data.error ?? "Claim failed");
    }
  }

  return (
    <div>
      <button onClick={claim} disabled={busy || left > 0} className="btn-primary w-full">
        {left > 0 ? `Next claim in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : `Claim ${coin}`}
      </button>
      {msg && <p role="status" className="mt-2 text-sm text-slate-300">{msg}</p>}
    </div>
  );
}
