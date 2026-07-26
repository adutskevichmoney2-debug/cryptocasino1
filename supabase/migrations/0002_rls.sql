-- ============================================================================
-- Row Level Security
-- ============================================================================
-- Rule of thumb: players read their own rows and write almost nothing directly.
-- Anything touching money goes through SECURITY DEFINER functions in 0003 so a
-- compromised anon key can never move a balance.
-- ----------------------------------------------------------------------------

-- ── Role helpers ────────────────────────────────────────────────────────────
-- STABLE + SECURITY DEFINER so policies can call them without recursing into
-- the profiles policies they are used by.

create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('support','admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ── Enable RLS everywhere ───────────────────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.balances          enable row level security;
alter table public.transactions      enable row level security;
alter table public.deposit_addresses enable row level security;
alter table public.bets              enable row level security;
alter table public.game_rounds       enable row level security;
alter table public.favorites         enable row level security;
alter table public.recent_games      enable row level security;
alter table public.promo_codes       enable row level security;
alter table public.user_bonuses      enable row level security;
alter table public.support_tickets   enable row level security;
alter table public.support_messages  enable row level security;
alter table public.notifications     enable row level security;
alter table public.user_sessions     enable row level security;
alter table public.admin_actions     enable row level security;

-- ── Profiles ────────────────────────────────────────────────────────────────

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_staff());

-- Players may edit presentation only. Role, status, balances and KYC state are
-- deliberately excluded: the WITH CHECK clause pins them to their old values.
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
    and player_id = (select player_id from public.profiles where id = auth.uid())
    and kyc_status = (select kyc_status from public.profiles where id = auth.uid())
  );

create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ── Balances (read-only to clients) ─────────────────────────────────────────

create policy balances_select on public.balances
  for select using (user_id = auth.uid() or public.is_staff());

-- ── Transactions (read-only to clients) ─────────────────────────────────────

create policy transactions_select on public.transactions
  for select using (user_id = auth.uid() or public.is_staff());

-- ── Deposit addresses ───────────────────────────────────────────────────────

create policy deposit_addresses_select on public.deposit_addresses
  for select using (user_id = auth.uid() or public.is_staff());

-- ── Bets & rounds (read-only; created through RPC) ──────────────────────────

create policy bets_select on public.bets
  for select using (user_id = auth.uid() or public.is_staff());

create policy game_rounds_select on public.game_rounds
  for select using (user_id = auth.uid() or public.is_staff());

-- ── Favorites / recent games (players own these outright) ───────────────────

create policy favorites_all on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy favorites_staff_read on public.favorites
  for select using (public.is_staff());

create policy recent_games_all on public.recent_games
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy recent_games_staff_read on public.recent_games
  for select using (public.is_staff());

-- ── Promo codes ─────────────────────────────────────────────────────────────

create policy promo_codes_select on public.promo_codes
  for select using (active or public.is_staff());

create policy promo_codes_admin on public.promo_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- ── User bonuses ────────────────────────────────────────────────────────────

create policy user_bonuses_select on public.user_bonuses
  for select using (user_id = auth.uid() or public.is_staff());

-- ── Support ─────────────────────────────────────────────────────────────────

create policy support_tickets_select on public.support_tickets
  for select using (user_id = auth.uid() or public.is_staff());

create policy support_tickets_insert on public.support_tickets
  for insert with check (user_id = auth.uid());

create policy support_tickets_update_staff on public.support_tickets
  for update using (public.is_staff()) with check (public.is_staff());

create policy support_messages_select on public.support_messages
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

-- A player may only post as themselves, only on their own ticket, and never
-- with the staff flag set.
create policy support_messages_insert on public.support_messages
  for insert with check (
    sender_id = auth.uid()
    and (
      (is_staff = false and exists (
        select 1 from public.support_tickets t
        where t.id = ticket_id and t.user_id = auth.uid()
      ))
      or (is_staff = true and public.is_staff())
    )
  );

create policy support_messages_update_staff on public.support_messages
  for update using (public.is_staff()) with check (public.is_staff());

-- ── Notifications ───────────────────────────────────────────────────────────

create policy notifications_select on public.notifications
  for select using (user_id = auth.uid() or public.is_staff());

-- Only the read flag is user-writable; RPC creates the rows.
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Sessions ────────────────────────────────────────────────────────────────

create policy user_sessions_select on public.user_sessions
  for select using (user_id = auth.uid() or public.is_staff());

create policy user_sessions_update_own on public.user_sessions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Admin audit log (admins read; nobody writes directly) ───────────────────

create policy admin_actions_select on public.admin_actions
  for select using (public.is_admin());

-- ── Realtime ────────────────────────────────────────────────────────────────
-- Realtime respects RLS, so these are safe to publish.

alter publication supabase_realtime add table public.support_messages;
alter publication supabase_realtime add table public.support_tickets;
alter publication supabase_realtime add table public.balances;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.notifications;
