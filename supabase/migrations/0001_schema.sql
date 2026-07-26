-- ============================================================================
-- CryptoCasino — core schema
-- ============================================================================
-- Money is stored as numeric(38,18): crypto needs up to 18 decimals and
-- floating point must never touch a ledger.
-- ----------------------------------------------------------------------------

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── Enums ───────────────────────────────────────────────────────────────────

create type user_role       as enum ('player', 'support', 'admin');
create type account_status  as enum ('active', 'frozen', 'self_excluded', 'banned');
create type kyc_status      as enum ('none', 'pending', 'verified', 'rejected');
create type coin            as enum ('BTC','ETH','USDT','USDC','TRX','SOL','LTC','DOGE');
create type network         as enum ('BTC','ERC20','TRC20','BEP20','SOL','LTC','DOGE');
create type tx_type         as enum ('deposit','withdraw','bet','win','bonus','adjustment','rollback');
create type tx_status       as enum ('pending','processing','confirmed','rejected','failed');
create type bet_status      as enum ('open','won','lost','void','cashed_out');
create type ticket_status   as enum ('open','pending','resolved','closed');
create type ticket_priority as enum ('low','normal','high','urgent');

-- ── Profiles ────────────────────────────────────────────────────────────────
-- One row per auth.users row, created by a trigger on signup.

create table public.profiles (
  id             uuid primary key references auth.users on delete cascade,
  player_id      bigint unique not null,
  email          citext not null,
  nickname       text not null unique
                 check (char_length(nickname) between 3 and 16),
  avatar_id      smallint not null default 0,
  role           user_role not null default 'player',
  status         account_status not null default 'active',
  kyc_status     kyc_status not null default 'none',
  two_factor_enabled boolean not null default false,
  xp             bigint not null default 0,
  wagered_total  numeric(38,18) not null default 0,
  ref_code       text not null unique,
  referred_by    text,
  -- Operator-only fields
  internal_note  text,
  status_reason  text,
  status_changed_at timestamptz,
  status_changed_by uuid references public.profiles(id),
  last_seen_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index profiles_role_idx       on public.profiles(role);
create index profiles_status_idx     on public.profiles(status);
create index profiles_created_at_idx on public.profiles(created_at desc);
create index profiles_nickname_idx   on public.profiles(lower(nickname));

-- Public player ids look like account numbers rather than row counters.
create sequence public.player_id_seq start with 10000000 increment by 1;

-- ── Balances ────────────────────────────────────────────────────────────────
-- One row per (user, coin). Only SECURITY DEFINER functions may write here.

create table public.balances (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  coin      coin not null,
  amount    numeric(38,18) not null default 0 check (amount >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, coin)
);

create index balances_nonzero_idx on public.balances(coin, amount desc) where amount > 0;

-- ── Transactions (the ledger) ───────────────────────────────────────────────
-- Append-only in practice: statuses move forward, amounts never change.

create table public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         tx_type not null,
  coin         coin not null,
  amount       numeric(38,18) not null check (amount > 0),
  fee          numeric(38,18) not null default 0 check (fee >= 0),
  status       tx_status not null default 'pending',
  network      network,
  address      text,
  tx_hash      text,
  -- Balance after this transaction settled; makes statements auditable.
  balance_after numeric(38,18),
  note         text,
  -- Set when an operator created or approved the movement.
  actor_id     uuid references public.profiles(id),
  reference_id uuid,
  created_at   timestamptz not null default now(),
  settled_at   timestamptz
);

create index transactions_user_idx    on public.transactions(user_id, created_at desc);
create index transactions_status_idx  on public.transactions(status, created_at desc);
create index transactions_type_idx    on public.transactions(type, created_at desc);
create index transactions_pending_idx on public.transactions(created_at desc)
  where status in ('pending','processing');

-- ── Deposit addresses ───────────────────────────────────────────────────────
-- Per user, per coin+network. A payment provider would populate these.

create table public.deposit_addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  coin       coin not null,
  network    network not null,
  address    text not null,
  memo       text,
  created_at timestamptz not null default now(),
  unique (user_id, coin, network)
);

-- ── Sports bets ─────────────────────────────────────────────────────────────

create table public.bets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  bet_type      text not null check (bet_type in ('single','combo')),
  selections    jsonb not null,
  stake         numeric(38,18) not null check (stake > 0),
  coin          coin not null,
  total_odds    numeric(12,4) not null check (total_odds >= 1),
  potential_win numeric(38,18) not null,
  payout        numeric(38,18),
  status        bet_status not null default 'open',
  created_at    timestamptz not null default now(),
  settled_at    timestamptz
);

create index bets_user_idx   on public.bets(user_id, created_at desc);
create index bets_status_idx on public.bets(status) where status = 'open';

-- ── Casino rounds ───────────────────────────────────────────────────────────
-- "Where the money went": one row per game round.

create table public.game_rounds (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  game_slug  text not null,
  provider   text,
  coin       coin not null,
  bet_amount numeric(38,18) not null check (bet_amount >= 0),
  win_amount numeric(38,18) not null default 0 check (win_amount >= 0),
  created_at timestamptz not null default now()
);

create index game_rounds_user_idx on public.game_rounds(user_id, created_at desc);
create index game_rounds_game_idx on public.game_rounds(game_slug, created_at desc);

-- ── Player preferences ──────────────────────────────────────────────────────

create table public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  game_id    text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table public.recent_games (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  game_id   text not null,
  played_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create index recent_games_played_idx on public.recent_games(user_id, played_at desc);

-- ── Bonuses ─────────────────────────────────────────────────────────────────

create table public.promo_codes (
  code             text primary key,
  label_key        text not null,
  amount           numeric(38,18) not null check (amount > 0),
  coin             coin not null,
  wager_multiplier numeric(6,2) not null default 1,
  valid_days       integer not null default 7,
  max_claims       integer,
  claims_count     integer not null default 0,
  active           boolean not null default true,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

create table public.user_bonuses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  code           text not null references public.promo_codes(code),
  label_key      text not null,
  amount         numeric(38,18) not null,
  coin           coin not null,
  wager_required numeric(38,18) not null,
  wager_done     numeric(38,18) not null default 0,
  claimed_at     timestamptz not null default now(),
  expires_at     timestamptz not null,
  unique (user_id, code)
);

create index user_bonuses_user_idx on public.user_bonuses(user_id, claimed_at desc);

-- ── Support ─────────────────────────────────────────────────────────────────

create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  subject     text not null,
  topic       text,
  status      ticket_status not null default 'open',
  priority    ticket_priority not null default 'normal',
  assigned_to uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  closed_at   timestamptz
);

create index support_tickets_user_idx   on public.support_tickets(user_id, updated_at desc);
create index support_tickets_status_idx on public.support_tickets(status, updated_at desc);

create table public.support_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,
  sender_id  uuid references public.profiles(id) on delete set null,
  is_staff   boolean not null default false,
  body       text not null check (char_length(body) between 1 and 4000),
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index support_messages_ticket_idx on public.support_messages(ticket_id, created_at);

-- ── Notifications ───────────────────────────────────────────────────────────

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  key        text not null,
  values     jsonb,
  href       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- ── Session log (device / IP / geo) ─────────────────────────────────────────
-- Written on sign-in and periodically refreshed. Visible to the account owner
-- (so they can spot unknown devices) and to staff for fraud review.

create table public.user_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  ip           inet,
  user_agent   text,
  device_type  text,
  browser      text,
  os           text,
  country      text,
  city         text,
  is_current   boolean not null default true,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at   timestamptz
);

create index user_sessions_user_idx on public.user_sessions(user_id, last_seen_at desc);
create index user_sessions_ip_idx   on public.user_sessions(ip);

-- ── Admin audit log ─────────────────────────────────────────────────────────
-- Every operator action against a player account lands here. Insert-only.

create table public.admin_actions (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid not null references public.profiles(id),
  target_user  uuid references public.profiles(id) on delete set null,
  action       text not null,
  details      jsonb,
  ip           inet,
  created_at   timestamptz not null default now()
);

create index admin_actions_actor_idx  on public.admin_actions(actor_id, created_at desc);
create index admin_actions_target_idx on public.admin_actions(target_user, created_at desc);

-- ── updated_at triggers ─────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger support_tickets_touch
  before update on public.support_tickets
  for each row execute function public.touch_updated_at();

-- ── Signup trigger ──────────────────────────────────────────────────────────
-- Creates the profile and zeroed balances the moment auth.users gets a row,
-- so the app never has to create them client-side.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nickname text;
  v_player_id bigint;
  v_suffix int := 0;
begin
  v_player_id := nextval('public.player_id_seq');

  v_nickname := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
    split_part(new.email, '@', 1)
  );
  v_nickname := regexp_replace(v_nickname, '[^a-zA-Z0-9_]', '', 'g');
  if char_length(v_nickname) < 3 then
    v_nickname := 'player' || v_player_id::text;
  end if;
  v_nickname := left(v_nickname, 16);

  -- Nicknames are unique; fall back to a numbered variant on collision.
  while exists (select 1 from public.profiles where lower(nickname) = lower(v_nickname)) loop
    v_suffix := v_suffix + 1;
    v_nickname := left(v_nickname, 16 - char_length(v_suffix::text)) || v_suffix::text;
  end loop;

  insert into public.profiles (id, player_id, email, nickname, ref_code, referred_by, avatar_id)
  values (
    new.id,
    v_player_id,
    new.email,
    v_nickname,
    upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6)),
    nullif(upper(trim(new.raw_user_meta_data ->> 'ref_code')), ''),
    (v_player_id % 12)::smallint
  );

  insert into public.balances (user_id, coin)
  select new.id, c
  from unnest(enum_range(null::coin)) as c;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
