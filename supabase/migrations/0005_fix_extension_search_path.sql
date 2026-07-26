-- ============================================================================
-- Fix: pgcrypto lives in the `extensions` schema on Supabase
-- ============================================================================
-- handle_new_user() and get_deposit_address() call gen_random_bytes() and
-- digest(), which pgcrypto provides. Both functions pin search_path to public
-- for safety, so those calls resolved to nothing and every signup failed with
-- "Database error saving new user". Adding `extensions` to the search path
-- fixes it while keeping the path explicit.
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
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
    upper(substr(md5(random()::text || new.id::text), 1, 6)),
    nullif(upper(trim(new.raw_user_meta_data ->> 'ref_code')), ''),
    (v_player_id % 12)::smallint
  );

  insert into public.balances (user_id, coin)
  select new.id, c
  from unnest(enum_range(null::coin)) as c;

  return new;
end;
$$;

create or replace function public.get_deposit_address(p_coin coin, p_network network)
returns public.deposit_addresses
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_row public.deposit_addresses;
  v_seed text;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select * into v_row
  from public.deposit_addresses
  where user_id = v_user and coin = p_coin and network = p_network;

  if found then
    return v_row;
  end if;

  -- Deterministic per user+coin+network. md5 is built in, so this works
  -- regardless of where pgcrypto happens to be installed.
  v_seed := md5(v_user::text || p_coin::text || p_network::text)
         || md5(p_network::text || v_user::text);

  insert into public.deposit_addresses (user_id, coin, network, address)
  values (
    v_user, p_coin, p_network,
    case p_network
      when 'BTC'   then 'bc1q' || substr(v_seed, 1, 38)
      when 'TRC20' then 'T'    || substr(v_seed, 1, 33)
      when 'ERC20' then '0x'   || substr(v_seed, 1, 40)
      when 'BEP20' then '0x'   || substr(v_seed, 1, 40)
      when 'SOL'   then substr(v_seed, 1, 44)
      when 'LTC'   then 'ltc1q' || substr(v_seed, 1, 38)
      when 'DOGE'  then 'D'    || substr(v_seed, 1, 33)
    end
  )
  returning * into v_row;

  return v_row;
end;
$$;
