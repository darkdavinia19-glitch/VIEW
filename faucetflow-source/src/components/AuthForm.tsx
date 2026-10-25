"use client";
import { useState } from "react";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(f.get("email")),
      password: String(f.get("password")),
    };
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (mode === "register" && ref) body.ref = ref;
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong");
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">{mode === "login" ? "Sign in" : "Create account"}</h1>
      <label className="block text-sm">Email
        <input name="email" type="email" required autoComplete="email" className="input mt-1" />
      </label>
      <label className="block text-sm">Password
        <input name="password" type="password" required minLength={mode === "register" ? 10 : 1}
          autoComplete={mode === "login" ? "current-password" : "new-password"} className="input mt-1" />
      </label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button disabled={busy} className="btn-primary w-full">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}</button>
    </form>
  );
}
