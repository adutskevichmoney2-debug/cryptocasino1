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
  index.ts        createServices() + the `services` singleton — the only public entry
  types.ts        interfaces, Result<T>, domain models
  mock/
    *.mock.ts     implementations backed by localStorage
    db.ts         SSR-safe localStorage adapter, `cc:db:*` keys (≈ Supabase tables)
    latency.ts    delay() + Emitter
    fixtures/     static seed data (games, sports, coins, promos, help articles)
```

## Swapping in Supabase

1. Add `services/supabase/*.supabase.ts` implementing the same interfaces from `types.ts`.
2. In `index.ts`, pick the implementation:
   ```ts
   export const services: Services =
     process.env.NEXT_PUBLIC_DATA_BACKEND === "supabase"
       ? createSupabaseServices()
       : createMockServices();
   ```
3. Map Postgres/PostgREST errors onto the same `code` strings the mocks emit, so the
   existing translated error messages keep working.

## Provider integration point

`Game.launchUrl` is `null` throughout the demo. A licensed provider returns a launch
URL per game/session; `GameFrame` renders the placeholder while it is null and the
iframe once it is set. The spot is marked in `components/casino/GameFrame.tsx`.
