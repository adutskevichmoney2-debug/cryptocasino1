# Service layer — the swap boundary

Everything the UI treats as "backend data" goes through this folder. The point is
that replacing the mock implementation with Supabase later touches **only this
folder** — no component, page or store changes.

## Rules

1. **UI imports `services` from `@/services` and types from `@/services/types`. Nothing else.**
   Components and stores must never import from `@/services/mock/*`, never touch
   `localStorage` directly, and never read a fixture file. This is enforced by an
   ESLint `no-restricted-imports` rule.
2. **Every method is async and returns `Promise`.** Even where the mock could answer
   synchronously — a real network call cannot.
3. **Fallible operations return `Result<T>`**, never throw. Errors carry a stable
   `code` (`auth/email-taken`, `wallet/insufficient-funds`, …) that the UI renders
   through i18n as `t('errors.' + code)`. Never put user-facing English in a service.
4. **Subscriptions mirror Supabase shapes** and return an `Unsubscribe` function:
   `onAuthChange` ≈ `onAuthStateChange`, `subscribeOdds` ≈ a realtime channel.
5. **No `Math.random()` or `Date.now()` in anything that affects render output.**
   Use the seeded PRNG in `@/lib/rng` so server and client agree — random values in
   render paths cause hydration mismatches. Ids and timestamps created inside event
   handlers are fine.

## Layout

```
services/
  index.ts        the `services` singleton — the only public entry
  types.ts        interfaces, Result<T>, domain models
  mock/
    *.mock.ts     implementations backed by localStorage
    db.ts         SSR-safe localStorage adapter, `cc:db:*` keys (≈ Supabase tables)
    latency.ts    delay() + Emitter
    fixtures/     static seed data (games, sports, coins, promos, help articles)
  supabase/
    *.supabase.ts implementations backed by Supabase (auth, tables, RPC, realtime)
    errors.ts     Postgres/GoTrue errors → the stable `code` strings above
    realtime.ts   per-user channel helpers that rebind across sign-in/sign-out
  shared/
    games.ts      the static casino catalogue, used by both backends
    sports.ts     events, markets and the seeded odds drift, used by both
    bonus.ts      VIP ladder maths and race periods
    help.ts       help articles, search ranking and the canned chat answers
```

## Picking a backend

Both implementations exist and satisfy the same interfaces. `index.ts` chooses one
at module load:

```ts
export const services: Services = isSupabaseConfigured
  ? createSupabaseServices()
  : createMockServices();
```

`isSupabaseConfigured` (from `@/lib/supabase/client`) is simply "are
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` both set". With no env
vars the app runs entirely on the mock layer, so a fresh clone works with zero setup;
add the two variables and the same UI talks to Postgres instead. Nothing else in the
app reads those variables.

## What Supabase actually stores

Only user data. Games, providers, sport events, markets, odds, promotions, VIP levels,
coin metadata, USD rates and help articles have no tables in `supabase/migrations` —
they are catalogue content, and both backends read them from `shared/` (which in turn
reads `mock/fixtures/`). The Supabase services hit the database for profiles, balances,
transactions, bets, favourites, recent games, bonuses, tickets and notifications, and
call the SECURITY DEFINER RPC in `0003_functions.sql` for anything that moves money.

`errors.ts` maps the machine strings those functions raise (`insufficient_funds`,
`invalid_code`, `already_claimed`, …) and GoTrue's prose ("Invalid login credentials")
onto the same `code` values the mocks emit, so the translations under `errors` in
`messages/*.json` keep working across both backends.

## Provider integration point

`Game.launchUrl` is `null` throughout the demo. A licensed provider returns a launch
URL per game/session; `GameFrame` renders the placeholder while it is null and the
iframe once it is set. The spot is marked in `components/casino/GameFrame.tsx`.
