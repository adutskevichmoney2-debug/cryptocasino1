-- ============================================================================
-- Assigning a custom public player id
-- ============================================================================
-- Operators sometimes need to hand out a specific account number (a vanity id
-- like 77777777, or restoring an id after a migration). Only an admin may do
-- it, the id must be free, and the sequence is advanced so future signups can
-- never collide with a manually assigned number.
-- ----------------------------------------------------------------------------

create or replace function public.admin_set_player_id(
  p_user_id   uuid,
  p_player_id bigint
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_old bigint;
  v_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  -- Keep ids looking like account numbers: 4 to 12 digits.
  if p_player_id is null or p_player_id < 1000 or p_player_id > 999999999999 then
    raise exception 'player_id_invalid' using errcode = 'P0001';
  end if;

  select player_id into v_old from public.profiles where id = p_user_id;
  if v_old is null then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if v_old = p_player_id then
    select * into v_profile from public.profiles where id = p_user_id;
    return v_profile;
  end if;

  if exists (select 1 from public.profiles where player_id = p_player_id) then
    raise exception 'player_id_taken' using errcode = 'P0001';
  end if;

  update public.profiles set player_id = p_player_id where id = p_user_id
  returning * into v_profile;

  -- Push the generator past this number so an automatic signup cannot reuse it.
  if p_player_id >= (select last_value from public.player_id_seq) then
    perform setval('public.player_id_seq', p_player_id + 1, false);
  end if;

  insert into public.admin_actions (actor_id, target_user, action, details)
  values (v_actor, p_user_id, 'account.player_id',
          jsonb_build_object('from', v_old, 'to', p_player_id));

  return v_profile;
end;
$$;

grant execute on function public.admin_set_player_id(uuid, bigint) to authenticated;
