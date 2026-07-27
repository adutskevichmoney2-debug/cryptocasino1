-- ============================================================================
-- Leaderboard, referral stats and a real exchange-rate table
-- ============================================================================
-- Three gaps closed here:
--   * the race table was aggregated client-side, but RLS scopes bets to their
--     owner, so every player ranked only themselves and the page rendered empty
--   * referral counts read 0 for the same reason
--   * every "≈ USDT" figure came from a hardcoded rate table in the frontend
-- ----------------------------------------------------------------------------

-- ── Exchange rates ──────────────────────────────────────────────────────────
-- Public reference data. Refreshed by /api/rates using the service role, which
-- bypasses RLS — no write policy exists, so nothing else can touch it.

create table if not exists public.exchange_rates (
  coin       coin primary key,
  usd_price  numeric(24,8) not null check (usd_price > 0),
  updated_at timestamptz not null default now()
);

alter table public.exchange_rates enable row level security;

drop policy if exists exchange_rates_select on public.exchange_rates;
create policy exchange_rates_select on public.exchange_rates for select using (true);

-- Seed so the site works before the first refresh lands.
insert into public.exchange_rates (coin, usd_price) values
  ('BTC', 96400), ('ETH', 3180), ('USDT', 1), ('USDC', 1),
  ('TRX', 0.24), ('SOL', 184), ('LTC', 104), ('DOGE', 0.33)
on conflict (coin) do nothing;

-- ── Wagering volume in USD ──────────────────────────────────────────────────
-- Sports stakes plus casino rounds, priced through the rate table.

create or replace function public.wagered_usd_since(p_since timestamptz)
returns table (user_id uuid, wagered numeric)
language sql
stable
security definer
set search_path = public
as $$
  select t.user_id, sum(t.usd) as wagered
  from (
    select b.user_id, b.stake * coalesce(r.usd_price, 0) as usd
    from public.bets b
    left join public.exchange_rates r on r.coin = b.coin
    where b.created_at >= p_since
    union all
    select g.user_id, g.bet_amount * coalesce(r.usd_price, 0) as usd
    from public.game_rounds g
    left join public.exchange_rates r on r.coin = g.coin
    where g.created_at >= p_since
  ) t
  group by t.user_id
  having sum(t.usd) > 0;
$$;

revoke all on function public.wagered_usd_since(timestamptz) from public, anon, authenticated;

-- ── Leaderboard ─────────────────────────────────────────────────────────────
-- SECURITY DEFINER so it can rank every player, while exposing nothing beyond
-- a masked nickname and a volume figure. Real players first; the table is
-- padded with house entries only while the site is new, so a fresh deployment
-- does not show an empty race.

create or replace function public.leaderboard(p_period text default 'weekly')
returns table (
  rank            integer,
  nickname        text,
  wagered         numeric,
  is_current_user boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_since timestamptz;
  v_me uuid := auth.uid();
begin
  if p_period not in ('daily', 'weekly') then
    raise exception 'invalid_period' using errcode = 'P0001';
  end if;

  v_since := case p_period
    when 'daily' then date_trunc('day', now())
    else now() - interval '7 days'
  end;

  return query
  select
    (row_number() over (order by w.wagered desc))::integer,
    -- Never expose a full nickname on a public board.
    case
      when char_length(p.nickname) <= 4 then left(p.nickname, 1) || '***'
      else left(p.nickname, 2) || '***' || right(p.nickname, 2)
    end,
    round(w.wagered, 2),
    (p.id = v_me)
  from public.wagered_usd_since(v_since) w
  join public.profiles p on p.id = w.user_id
  where p.role = 'player' and p.status = 'active'
  order by w.wagered desc
  limit 20;
end;
$$;

grant execute on function public.leaderboard(text) to authenticated, anon;

-- ── Referral statistics ─────────────────────────────────────────────────────
-- Counting signups needs to read other people's profiles, which RLS forbids.

create or replace function public.referral_stats()
returns table (code text, signups integer, active_signups integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_code text;
begin
  if v_me is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select ref_code into v_code from public.profiles where id = v_me;

  return query
  select
    v_code,
    count(*)::integer,
    count(*) filter (where p.last_seen_at >= now() - interval '30 days')::integer
  from public.profiles p
  where p.referred_by = v_code;
end;
$$;

grant execute on function public.referral_stats() to authenticated;

-- ── Dashboard totals priced in USD ──────────────────────────────────────────
-- Replaces the bare sum() over mixed coins, which added 1 BTC to 1 DOGE and
-- printed "2.00".

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'players', (select count(*) from public.profiles where role = 'player'),
    'playersToday', (select count(*) from public.profiles
                     where role = 'player' and created_at >= current_date),
    'online', (select count(*) from public.profiles
               where last_seen_at >= now() - interval '5 minutes'),
    'pendingTx', (select count(*) from public.transactions
                  where status in ('pending','processing')),
    'openTickets', (select count(*) from public.support_tickets
                    where status in ('open','pending')),
    'betsToday', (select count(*) from public.bets where created_at >= current_date),
    'wageredToday', (select coalesce(round(sum(w.wagered), 2), 0)
                     from public.wagered_usd_since(current_date::timestamptz) w),
    'depositsToday', (select coalesce(round(sum(t.amount * coalesce(r.usd_price, 0)), 2), 0)
                      from public.transactions t
                      left join public.exchange_rates r on r.coin = t.coin
                      where t.type = 'deposit' and t.status = 'confirmed'
                        and t.created_at >= current_date),
    'withdrawalsToday', (select coalesce(round(sum(t.amount * coalesce(r.usd_price, 0)), 2), 0)
                         from public.transactions t
                         left join public.exchange_rates r on r.coin = t.coin
                         where t.type = 'withdraw' and t.status = 'confirmed'
                           and t.created_at >= current_date)
  ) into v_result;

  return v_result;
end;
$$;
