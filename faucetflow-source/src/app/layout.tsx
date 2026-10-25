import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FaucetFlow — Earn small crypto rewards",
  description: "Claim crypto faucet rewards, complete verified tasks, and withdraw once you reach the minimum.",
};

const nav = [
  ["Home", "/"],
  ["Faucets", "/faucets"],
  ["Dashboard", "/dashboard"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const demo = process.env.APP_MODE !== "production";
  return (
    <html lang="en">
      <body>
        {demo && (
          <div role="status" className="bg-neon-purple/20 py-1 text-center text-xs">
            DEMO MODE: balances are a test ledger and cannot be withdrawn.
          </div>
        )}
        <header className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href="/" className="text-xl font-extrabold text-neon-blue">
            Faucet<span className="text-neon-green">Flow</span>
          </Link>
          <nav aria-label="Main" className="hidden gap-6 text-sm md:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-neon-blue">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2">
            <Link href="/login" className="btn-ghost">Sign In</Link>
            <Link href="/register" className="btn-primary">Sign Up</Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <footer className="mx-auto mt-16 max-w-6xl border-t border-white/10 p-4 text-xs text-slate-400">
          <p>
            Rewards are small and depend on advertising and offer revenue. Only verified activity is credited.
            Withdrawals are marked complete only after the payout provider confirms them. Please use responsibly.
          </p>
          <p className="mt-2 space-x-4">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/responsible-use">Responsible use</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
