-- Reglas de negocio: tiempo, check-ins, emparejamiento, cierre de días, chispas, protectores y toques.

-- "Ahora" sobreescribible solo por superusuario/pruebas (set app.now = '...'). PostgREST no permite SET.
create function public.app_now() returns timestamptz
language sql stable as $$
  select coalesce(nullif(current_setting('app.now', true), '')::timestamptz, now())
$$;

create function public.couple_now(p_couple uuid) returns timestamp
language sql stable security definer set search_path = public as $$
  select app_now() at time zone timezone from couples where id = p_couple
$$;

create function public.deadline_on(s public.streaks, d date) returns time
language sql immutable as $$
  select case when s.pending_from is not null and d >= s.pending_from then s.pending_deadline else s.deadline end
$$;

create function public.is_due(s public.streaks, d date) returns boolean
language sql immutable as $$
  select d >= s.start_date
     and (s.archived_on is null or d < s.archived_on)
     and (s.frequency <> 'weekdays' or extract(isodow from d) <= 5)
$$;

create function public.my_couple() returns uuid
language sql stable security definer set search_path = public as $$
  select couple_id from couple_members where user_id = auth.uid()
$$;

create function public.unlock(p_couple uuid, p_code text) returns void
language sql security definer set search_path = public as $$
  insert into achievements (couple_id, code) values (p_couple, p_code) on conflict do nothing
$$;

---------------------------------------------------------------------------
-- Emparejamiento

create function public.create_couple(p_timezone text) returns public.couples
language plpgsql security definer set search_path = public as $$
declare
  c couples;
  v_code text;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from profiles where id = auth.uid()) then raise exception 'no_profile'; end if;
  if exists (select 1 from couple_members where user_id = auth.uid()) then raise exception 'already_paired'; end if;
  if not exists (select 1 from pg_timezone_names where name = p_timezone) then raise exception 'invalid_timezone'; end if;
  loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      into v_code from generate_series(1, 6);
    exit when not exists (select 1 from couples where invite_code = v_code);
  end loop;
  insert into couples (invite_code, timezone) values (v_code, p_timezone) returning * into c;
  insert into couple_members (couple_id, user_id, color) values (c.id, auth.uid(), 'flame');
  return c;
end $$;

create function public.join_couple(p_code text) returns public.couples
language plpgsql security definer set search_path = public as $$
declare
  c couples;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from profiles where id = auth.uid()) then raise exception 'no_profile'; end if;
  if exists (select 1 from couple_members where user_id = auth.uid()) then raise exception 'already_paired'; end if;
  select * into c from couples where invite_code = upper(trim(p_code)) for update;
  if not found then raise exception 'invalid_code'; end if;
  if (select count(*) from couple_members where couple_id = c.id) >= 2 then raise exception 'couple_full'; end if;
  insert into couple_members (couple_id, user_id, color) values (c.id, auth.uid(), 'sky');
  update couples set paired_at = app_now(),
    closed_through = (app_now() at time zone timezone)::date - 1
  where id = c.id returning * into c;
  return c;
end $$;

---------------------------------------------------------------------------
-- Rachas

create function public.streak_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_today date;
begin
  if not exists (select 1 from couples where id = new.couple_id and paired_at is not null) then
    raise exception 'not_paired';
  end if;
  v_today := couple_now(new.couple_id)::date;
  new.start_date := v_today;
  new.closed_through := v_today - 1;
  new.pending_deadline := null;
  new.pending_from := null;
  new.archived_at := null;
  new.archived_on := null;
  return new;
end $$;
create trigger streak_before_insert before insert on public.streaks
  for each row execute function public.streak_before_insert();

create function public.streak_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into streak_counters (streak_id, user_id)
    select new.id, user_id from couple_members where couple_id = new.couple_id;
  return null;
end $$;
create trigger streak_after_insert after insert on public.streaks
  for each row execute function public.streak_after_insert();

-- Frecuencia/modo inmutables; la hora límite nueva aplica desde mañana; archivar fija archived_on.
create function public.streak_before_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_today date; v_current time;
begin
  if new.couple_id <> old.couple_id or new.frequency <> old.frequency or new.mode <> old.mode
     or new.weekly_target is distinct from old.weekly_target or new.start_date <> old.start_date
     or new.created_by <> old.created_by then
    raise exception 'immutable_field';
  end if;
  if auth.uid() is null then return new; end if; -- service role / cierre
  v_today := couple_now(old.couple_id)::date;
  new.closed_through := old.closed_through;
  new.pending_deadline := old.pending_deadline;
  new.pending_from := old.pending_from;
  v_current := deadline_on(old, v_today);
  if new.deadline is distinct from old.deadline then
    if new.deadline <> v_current then
      new.pending_deadline := new.deadline;
      new.pending_from := v_today + 1;
    else
      new.pending_deadline := null;
      new.pending_from := null;
    end if;
    new.deadline := v_current;
  end if;
  if old.archived_at is not null then
    new.archived_at := old.archived_at;
    new.archived_on := old.archived_on;
  elsif new.archived_at is not null then
    new.archived_at := app_now();
    new.archived_on := v_today;
  else
    new.archived_on := null;
  end if;
  return new;
end $$;
create trigger streak_before_update before update on public.streaks
  for each row execute function public.streak_before_update();

---------------------------------------------------------------------------
-- Check-ins: la fecha la pone el servidor; solo hoy, antes de la hora límite, propio.

create function public.check_in_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  s streaks;
  v_now timestamp;
  v_user uuid;
  v_date date;
begin
  if tg_op = 'INSERT' then
    select * into s from streaks where id = new.streak_id;
    if not found then raise exception 'streak_not_found'; end if;
    new.couple_id := s.couple_id;
    if auth.uid() is null then return new; end if; -- datos de prueba / service role
    v_user := new.user_id;
  else
    if auth.uid() is null then return old; end if;
    select * into s from streaks where id = old.streak_id;
    v_user := old.user_id;
  end if;

  if v_user <> auth.uid() then raise exception 'not_yours'; end if;
  if not is_member(s.couple_id) then raise exception 'not_member'; end if;
  v_now := couple_now(s.couple_id);

  if tg_op = 'INSERT' then
    new.local_date := v_now::date;
    v_date := new.local_date;
    if s.archived_at is not null then raise exception 'archived'; end if;
    if not is_due(s, v_date) then raise exception 'not_due'; end if;
  else
    v_date := old.local_date;
    if v_date <> v_now::date then raise exception 'day_closed'; end if;
  end if;

  if v_now::time >= deadline_on(s, v_date) then raise exception 'day_closed'; end if;

  if tg_op = 'INSERT' then return new; end if;
  return old;
end $$;
create trigger check_in_guard before insert or delete on public.check_ins
  for each row execute function public.check_in_guard();

-- "Racha salvada": check-in tras un toque de la pareja ese mismo día.
create function public.check_in_saved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from nudges n
    where n.streak_id = new.streak_id and n.to_user = new.user_id and n.kind = 'nudge'
      and (n.created_at at time zone (select timezone from couples where id = new.couple_id))::date = new.local_date
  ) then
    perform unlock(new.couple_id, 'saved');
  end if;
  return null;
end $$;
create trigger check_in_saved after insert on public.check_ins
  for each row execute function public.check_in_saved();

---------------------------------------------------------------------------
-- Chispas: derivadas del historial. 10 por check-in + 10 si la pareja también cumplió esa racha ese día.

create view public.couple_sparks with (security_invoker = true) as
  select ci.couple_id, ci.user_id,
         sum(10 + case when exists (
           select 1 from public.check_ins o
           where o.streak_id = ci.streak_id and o.local_date = ci.local_date and o.user_id <> ci.user_id
         ) then 10 else 0 end)::int as sparks
  from public.check_ins ci
  group by ci.couple_id, ci.user_id;

---------------------------------------------------------------------------
-- Cierre de días (pg_cron). Idempotente.

create function public.close_streak_day(s public.streaks, d date, p_flame uuid, p_sky uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_f boolean; v_s boolean; v_prot boolean; v_ok boolean;
begin
  if s.frequency = 'weekly' then
    if extract(isodow from d) <> 7 then return; end if;
    v_f := (select count(*) from check_ins where streak_id = s.id and user_id = p_flame and local_date between d - 6 and d) >= s.weekly_target;
    v_s := (select count(*) from check_ins where streak_id = s.id and user_id = p_sky and local_date between d - 6 and d) >= s.weekly_target;
    v_prot := exists (select 1 from freeze_uses where streak_id = s.id and local_date between d - 6 and d);
    -- primera semana incompleta: solo cuenta si se cumplió
    if d - 6 < s.start_date and not ((v_f and v_s) or v_prot) then return; end if;
  else
    if not is_due(s, d) then return; end if;
    v_f := exists (select 1 from check_ins where streak_id = s.id and user_id = p_flame and local_date = d);
    v_s := exists (select 1 from check_ins where streak_id = s.id and user_id = p_sky and local_date = d);
    v_prot := exists (select 1 from freeze_uses where streak_id = s.id and local_date = d);
  end if;

  insert into streak_days (streak_id, local_date, user_id, done, protected)
  values (s.id, d, p_flame, v_f, v_prot), (s.id, d, p_sky, v_s, v_prot)
  on conflict do nothing;

  if s.mode = 'together' then
    v_ok := (v_f and v_s) or v_prot;
    update streak_counters
       set current = case when v_ok then current + 1 else 0 end,
           best = greatest(best, case when v_ok then current + 1 else 0 end)
     where streak_id = s.id;
  else
    update streak_counters
       set current = case when (case when user_id = p_flame then v_f else v_s end) or v_prot then current + 1 else 0 end,
           best = greatest(best, case when (case when user_id = p_flame then v_f else v_s end) or v_prot then current + 1 else 0 end)
     where streak_id = s.id;
  end if;

  if s.icon = 'dormir' and exists (select 1 from streak_counters where streak_id = s.id and current >= 30) then
    perform unlock(s.couple_id, 'sleep30');
  end if;
end $$;

create function public.close_couple_day(c public.couples, d date, p_flame uuid, p_sky uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_due int; v_fa boolean; v_sa boolean; v_ok boolean; v_prot boolean;
  v_state text; v_prev int; v_after int;
begin
  select count(*),
         coalesce(bool_and(f.done), false),
         coalesce(bool_and(k.done), false),
         coalesce(bool_and((f.done and k.done) or f.protected), false),
         coalesce(bool_or(f.protected and not (f.done and k.done)), false)
    into v_due, v_fa, v_sa, v_ok, v_prot
    from streaks s
    join streak_days f on f.streak_id = s.id and f.local_date = d and f.user_id = p_flame
    join streak_days k on k.streak_id = s.id and k.local_date = d and k.user_id = p_sky
   where s.couple_id = c.id and s.frequency <> 'weekly';

  v_state := case when v_due = 0 then 'neutral' when v_ok and v_prot then 'protected' when v_ok then 'perfect' else 'broken' end;
  select streak_after into v_prev from couple_days where couple_id = c.id and local_date < d order by local_date desc limit 1;
  v_prev := coalesce(v_prev, 0);
  v_after := case v_state when 'broken' then 0 when 'neutral' then v_prev else v_prev + 1 end;

  insert into couple_days (couple_id, local_date, state, flame_all, sky_all, streak_after)
  values (c.id, d, v_state, v_due > 0 and v_fa, v_due > 0 and v_sa, v_after)
  on conflict do nothing;

  update couples set
    best_streak = greatest(best_streak, v_after),
    freezes = case when v_state = 'perfect' and v_after % 7 = 0 then least(freezes + 1, 2) else freezes end
  where id = c.id;

  if v_after >= 7 then perform unlock(c.id, 'week'); end if;
  if v_after >= 50 then perform unlock(c.id, 'fifty'); end if;
  if v_after >= 100 then perform unlock(c.id, 'hundred'); end if;
end $$;

create function public.close_due_days() returns void
language plpgsql security definer set search_path = public as $$
declare
  c couples; s streaks;
  v_now timestamp; v_today date; d date;
  v_flame uuid; v_sky uuid;
begin
  for c in select * from couples where paired_at is not null for update skip locked loop
    v_now := app_now() at time zone c.timezone;
    v_today := v_now::date;
    select user_id into v_flame from couple_members where couple_id = c.id and color = 'flame';
    select user_id into v_sky from couple_members where couple_id = c.id and color = 'sky';

    for s in select * from streaks where couple_id = c.id and closed_through < v_today loop
      d := s.closed_through + 1;
      while (d < v_today or (d = v_today and v_now::time >= deadline_on(s, d)))
            and (s.archived_on is null or d < s.archived_on) loop
        perform close_streak_day(s, d, v_flame, v_sky);
        d := d + 1;
      end loop;
      update streaks set closed_through = d - 1 where id = s.id and closed_through < d - 1;
    end loop;

    d := c.closed_through + 1;
    while d < v_today loop
      perform close_couple_day(c, d, v_flame, v_sky);
      d := d + 1;
    end loop;
    update couples set closed_through = d - 1 where id = c.id;
  end loop;
end $$;

---------------------------------------------------------------------------
-- Protector y toques

create function public.use_freeze(p_streak uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s streaks; v_now timestamp;
begin
  select * into s from streaks where id = p_streak;
  if not found or not is_member(s.couple_id) then raise exception 'not_member'; end if;
  perform 1 from couples where id = s.couple_id for update;
  v_now := couple_now(s.couple_id);
  if s.archived_at is not null or not is_due(s, v_now::date) then raise exception 'not_due'; end if;
  if v_now::time >= deadline_on(s, v_now::date) then raise exception 'day_closed'; end if;
  if (select freezes from couples where id = s.couple_id) < 1 then raise exception 'no_freezes'; end if;
  insert into freeze_uses (couple_id, streak_id, local_date, used_by)
    values (s.couple_id, s.id, v_now::date, auth.uid());
  update couples set freezes = freezes - 1 where id = s.couple_id;
  perform unlock(s.couple_id, 'saved');
exception when unique_violation then
  raise exception 'already_protected';
end $$;

create function public.send_nudge(p_streak uuid, p_body text default null, p_kind text default 'nudge')
returns public.nudges
language plpgsql security definer set search_path = public as $$
declare s streaks; v_to uuid; n nudges;
begin
  select * into s from streaks where id = p_streak;
  if not found or not is_member(s.couple_id) then raise exception 'not_member'; end if;
  select user_id into v_to from couple_members where couple_id = s.couple_id and user_id <> auth.uid();
  if v_to is null then raise exception 'not_paired'; end if;
  if exists (
    select 1 from nudges where from_user = auth.uid() and streak_id = p_streak and kind = p_kind
      and created_at > app_now() - interval '10 minutes'
  ) then raise exception 'rate_limited'; end if;
  insert into nudges (couple_id, streak_id, from_user, to_user, kind, body)
    values (s.couple_id, s.id, auth.uid(), v_to, p_kind, nullif(trim(p_body), ''))
    returning * into n;
  return n;
end $$;

---------------------------------------------------------------------------
-- Lecturas agregadas para la UI

create function public.today_state() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  c couples;
  v_now timestamp; v_today date; v_ws date;
begin
  select co.* into c from couples co join couple_members m on m.couple_id = co.id where m.user_id = auth.uid();
  if not found then return null; end if;
  v_now := app_now() at time zone c.timezone;
  v_today := v_now::date;
  v_ws := v_today - (extract(isodow from v_today)::int - 1);

  return jsonb_build_object(
    'me', auth.uid(),
    'now', to_char(v_now, 'YYYY-MM-DD"T"HH24:MI:SS'),
    'today', v_today,
    'couple', jsonb_build_object('id', c.id, 'invite_code', c.invite_code, 'timezone', c.timezone,
      'freezes', c.freezes, 'best_streak', c.best_streak, 'paired_at', c.paired_at),
    'members', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'name', p.name, 'color', m.color) order by m.color)
      from couple_members m join profiles p on p.id = m.user_id where m.couple_id = c.id), '[]'),
    'closed_streak', coalesce((select streak_after from couple_days where couple_id = c.id order by local_date desc limit 1), 0),
    'week', coalesce((select jsonb_agg(jsonb_build_object('date', local_date, 'state', state) order by local_date)
      from couple_days where couple_id = c.id and local_date between v_ws and v_ws + 6), '[]'),
    'sparks', coalesce((select sum(sparks) from couple_sparks where couple_id = c.id), 0),
    'last_nudge', (select jsonb_build_object('id', n.id, 'from_user', n.from_user, 'streak_id', n.streak_id,
        'kind', n.kind, 'body', n.body, 'created_at', n.created_at)
      from nudges n where n.couple_id = c.id and n.to_user = auth.uid()
        and (n.created_at at time zone c.timezone)::date = v_today
      order by n.created_at desc limit 1),
    'streaks', coalesce((select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'icon', s.icon, 'frequency', s.frequency, 'weekly_target', s.weekly_target,
        'mode', s.mode, 'reminder', s.reminder,
        'deadline', deadline_on(s, v_today), 'next_deadline', deadline_on(s, v_today + 1),
        'due_today', is_due(s, v_today),
        'closed_through', s.closed_through,
        'protected', exists (select 1 from freeze_uses f where f.streak_id = s.id
          and f.local_date between (case when s.frequency = 'weekly' then v_ws else v_today end) and v_today),
        'done', (select jsonb_object_agg(m.user_id, exists (select 1 from check_ins ci
          where ci.streak_id = s.id and ci.user_id = m.user_id and ci.local_date = v_today))
          from couple_members m where m.couple_id = c.id),
        'week_count', (select jsonb_object_agg(m.user_id, (select count(*) from check_ins ci
          where ci.streak_id = s.id and ci.user_id = m.user_id and ci.local_date between v_ws and v_today))
          from couple_members m where m.couple_id = c.id),
        'counters', coalesce((select jsonb_object_agg(sc.user_id, jsonb_build_object('current', sc.current, 'best', sc.best))
          from streak_counters sc where sc.streak_id = s.id), '{}')
      ) order by s.created_at)
      from streaks s where s.couple_id = c.id and s.archived_at is null), '[]')
  );
end $$;

create function public.month_calendar(p_year int, p_month int) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  c couples; v_today date; v_first date; v_last date;
begin
  select co.* into c from couples co join couple_members m on m.couple_id = co.id where m.user_id = auth.uid();
  if not found then return null; end if;
  v_today := (app_now() at time zone c.timezone)::date;
  v_first := make_date(p_year, p_month, 1);
  v_last := (v_first + interval '1 month')::date - 1;

  return jsonb_build_object(
    'today', v_today,
    'first', v_first,
    'last', v_last,
    'paired_at', c.paired_at,
    'days', coalesce((select jsonb_agg(jsonb_build_object('date', local_date, 'state', state,
        'flame_all', flame_all, 'sky_all', sky_all) order by local_date)
      from couple_days where couple_id = c.id and local_date between v_first and v_last), '[]'),
    'perfect_days', (select count(*) from couple_days where couple_id = c.id
      and local_date between v_first and v_last and state = 'perfect'),
    'compliance', (select jsonb_object_agg(m.user_id, jsonb_build_object(
        'done', closed.done + live.done, 'due', closed.due + live.due))
      from couple_members m
      cross join lateral (
        select count(*) filter (where sd.done) as done, count(*) as due
        from streak_days sd join streaks s on s.id = sd.streak_id
        where s.couple_id = c.id and sd.user_id = m.user_id and sd.local_date between v_first and least(v_last, v_today - 1)
      ) closed
      cross join lateral (
        select count(*) filter (where exists (select 1 from check_ins ci where ci.streak_id = s.id
                 and ci.user_id = m.user_id and ci.local_date = v_today)) as done,
               count(*) filter (where exists (select 1 from check_ins ci where ci.streak_id = s.id
                 and ci.user_id = m.user_id and ci.local_date = v_today)) as due
        from streaks s
        where s.couple_id = c.id and s.frequency <> 'weekly' and is_due(s, v_today)
          and v_today between v_first and v_last and s.closed_through < v_today
      ) live
      where m.couple_id = c.id)
  );
end $$;

---------------------------------------------------------------------------
-- Permisos de ejecución

revoke execute on function public.close_due_days(), public.close_streak_day(public.streaks, date, uuid, uuid),
  public.close_couple_day(public.couples, date, uuid, uuid), public.unlock(uuid, text)
  from public, anon, authenticated;
revoke execute on function public.create_couple(text), public.join_couple(text), public.use_freeze(uuid),
  public.send_nudge(uuid, text, text), public.today_state(), public.month_calendar(int, int)
  from public, anon;
grant execute on function public.create_couple(text), public.join_couple(text), public.use_freeze(uuid),
  public.send_nudge(uuid, text, text), public.today_state(), public.month_calendar(int, int)
  to authenticated;
