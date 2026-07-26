# Backend setup — Supabase + Vercel

The app runs without a backend: with no environment variables set it uses the
local mock data layer. Everything below switches it onto a real database.

---

## 1. Create the Supabase project

1. Sign in at <https://supabase.com> → **New project**.
2. Name it `cryptocasino`, pick the region closest to your players, and set a
   strong database password (save it — it is shown once).
3. Wait for provisioning (~2 minutes).

## 2. Apply the migrations

Open **SQL Editor** in the Supabase dashboard and run the four files from
`supabase/migrations/` **in order**, one at a time, waiting for each to succeed:

| Order | File | What it creates |
|---|---|---|
| 1 | `0001_schema.sql` | Tables, enums, indexes, signup trigger |
| 2 | `0002_rls.sql` | Row level security policies, realtime publication |
| 3 | `0003_functions.sql` | Money-moving RPC and operator actions |
| 4 | `0004_seed.sql` | Promo codes, demo-funds helper |

If a statement fails, fix it before running the next file — later migrations
depend on earlier ones.

## 3. Auth settings

**Authentication → Providers → Email**

- Enable **Email**.
- For local testing turn **Confirm email** off, so signups log in immediately.
  Turn it back on before exposing the site publicly.

**Authentication → URL Configuration**

- Site URL: `http://localhost:3000` while developing, your Vercel URL later.
- Redirect URLs: add both `http://localhost:3000/**` and
  `https://<your-app>.vercel.app/**`.

## 4. Local environment

Copy `.env.example` to `.env.local` and fill it from
**Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` is gitignored. The service-role key bypasses every access rule —
keep it out of the browser bundle and out of commits.

Restart `npm run dev` after editing env files; Next.js only reads them at boot.

## 5. Make yourself an administrator

Register through the site normally, then run this once in the SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign out and back in, then open `/admin`.

Roles:

| Role | Can do |
|---|---|
| `player` | Own account only |
| `support` | Read all players, handle tickets, set KYC status |
| `admin` | Everything: balances, account status, roles, audit log |

## 6. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel link
```

Add the environment variables (repeat for `preview` and `development` if you
want branch deploys to work):

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production
```

Then:

```bash
vercel --prod
```

Afterwards go back to Supabase → **Authentication → URL Configuration** and add
the production domain to Site URL and Redirect URLs, otherwise sign-in links
bounce back to localhost.

Alternatively connect the GitHub repository in the Vercel dashboard, paste the
same variables under **Settings → Environment Variables**, and every push to
`main` deploys automatically.

---

## How the pieces fit together

**Sign-up.** `supabase.auth.signUp` creates the `auth.users` row. The
`on_auth_user_created` trigger immediately writes a `profiles` row (assigning
the public 8-digit `player_id`, a unique nickname and a referral code) and a
zeroed `balances` row per coin. The app never creates those itself, so there is
no window where a session exists without a profile.

**Money.** Clients cannot `UPDATE` balances — RLS grants select only. Every
movement goes through a `SECURITY DEFINER` function in `0003_functions.sql`
which locks the balance row, checks for overdraft, writes the new amount and
appends a `transactions` row carrying `balance_after`. A tampered client payload
cannot inflate a payout: `place_bet` recomputes the combined odds server-side.

**Operator actions.** `admin_adjust_balance`, `admin_review_transaction`,
`admin_set_account_status`, `admin_set_kyc_status`, `admin_set_role` and
`admin_add_note` each verify the caller's role in SQL and append to
`admin_actions`. The audit trail cannot be edited from the client — there is no
insert or update policy on that table.

**Sessions.** `/api/session` runs server-side, where the real client IP and the
platform's geo headers are visible, parses the User-Agent and calls
`record_session`. Repeat visits from the same device refresh the existing row
instead of piling up duplicates. Players see their own sessions; staff see all
of them for fraud review.

**Support.** Tickets and messages are ordinary tables with realtime enabled, so
a staff reply appears in the player's chat widget without polling, and a player
message lands in the operator inbox the same way. RLS keeps each player scoped
to their own tickets.

## Connecting real crypto payments later

Deposits are credited by an operator today (`admin_review_transaction`). To
automate them:

1. Add a payment provider and store the address it issues in
   `deposit_addresses` instead of the deterministic placeholder produced by
   `get_deposit_address`.
2. Add a webhook route that verifies the provider's signature, then calls
   `apply_ledger` with `type => 'deposit'` — reuse the existing function so the
   ledger invariants still hold.
3. Drop `credit_demo_funds`; it exists only so the wallet can be explored
   without a provider.

Real-money operation additionally requires a gambling licence in the
jurisdictions you serve, plus KYC/AML processing that actually verifies
identity — the current KYC screens are interface only.
