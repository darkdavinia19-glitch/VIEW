# FaucetFlow

Next.js + Prisma + PostgreSQL crypto faucet platform. **This repository is a work in progress: see the status table.**

## Quick start

```bash
npm install
cp .env.example .env        # set DATABASE_URL, APP_URL, SESSION_SECRET
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Run tests: `npm test` (money tests always run; claim tests run when `DATABASE_URL` points at a throwaway database).

## Modes

- `APP_MODE=demo` (default): a visible banner is shown; balances are a test ledger and **cannot be withdrawn**.
- `APP_MODE=production`: CAPTCHA fails closed without keys; features that need providers stay off until credentials exist.

## Status

| Module | Status |
| --- | --- |
| Config, schema (all required tables), seed | Done |
| Email/password register, login, logout, sessions, lockout, rate limits | Done |
| Faucet claim engine (cooldown, daily cap, advisory lock, idempotency, referral commission) | Done |
| Landing, faucets, login/register, dashboard pages | Done (basic) |
| Email verification and password reset | Tokens stored; **needs SMTP credentials** to send |
| Google login | Not started; **needs Google OAuth credentials** |
| CAPTCHA | Wired; **needs hCaptcha keys** (client widget not yet added) |
| Withdrawals + admin review | Next |
| Admin dashboard | Next |
| PTC ads, shortlinks, daily bonus, promo codes, leaderboard | Next |
| Offerwalls | Callback table ready; **needs provider account + postback secret** |
| Payout provider integration | **Needs provider API key**; nothing is marked paid without provider confirmation |

## Security notes

Sessions are random tokens stored hashed; cookies are HttpOnly + SameSite=Lax; mutating routes check `Origin`; passwords use bcrypt; amounts are BigInt base units; rewards are credited inside DB transactions with unique idempotency keys.

## Deploy

Vercel plus a managed Postgres (Neon, Supabase, etc.). Set all env vars, run `npx prisma migrate deploy` and `npm run db:seed`.
