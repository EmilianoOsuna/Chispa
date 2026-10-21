-- Zona horaria por persona y cierre a medianoche (como Duolingo).
-- El día de cada quien termina a SU medianoche; el día D de la pareja cierra cuando terminó para los dos.

---------------------------------------------------------------------------
-- Zona en el perfil

alter table public.profiles add column timezone text;
update public.profiles p set timezone = c.timezone
  from public.couple_members m join public.couples c on c.id = m.couple_id
  where m.user_id = p.id;
update public.profiles set timezone = 'UTC' where timezone is null;
alter table public.profiles alter column timezone set default 'UTC', alter column timezone set not null;

-- Una zona inválida rompería `at time zone` en el cierre de todas las parejas.
create function public.profile_timezone_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if not exists (select 1 from pg_timezone_names where name = new.timezone) then raise exception 'invalid_timezone'; end if;
  return new;
end $$;
create trigger profile_timezone_guard before insert or update of timezone on public.profiles
  for each row execute function public.profile_timezone_guard();

create function public.user_today(p_user uuid) returns date
language sql stable security definer set search_path = public as $$
  select (app_now() at time zone timezone)::date from profiles where id = p_user
$$;

-- Día abierto de la pareja: el del miembro que va más atrás.
create function public.couple_today(p_couple uuid) returns date
language sql stable security definer set search_path = public as $$
  select min(user_today(user_id)) from couple_members where couple_id = p_couple
$$;

drop function public.set_timezone(text); -- la app actualiza profiles.timezone directo (RLS + guard)

---------------------------------------------------------------------------
-- Hora límite → hora del recordatorio (misma hora a la que salía la push: límite − 2 h)

drop function public.deadline_on(public.streaks, date);
alter table public.streaks rename column deadline to reminder_time;
update public.streaks set reminder_time = reminder_time - interval '2 hours';
alter table public.streaks alter column reminder_time set default '21:30',
  drop column pending_deadline, drop column pending_from;

---------------------------------------------------------------------------
-- Emparejamiento y rachas

drop function public.create_couple(text);
create function public.create_couple() returns public.couples
language plpgsql security definer set search_path = public as $$
declare
  c couples;
  v_code text;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from profiles where id = auth.uid()) then raise exception 'no_profile'; end if;
  if exists (select 1 from couple_members where user_id = auth.uid()) then raise exception 'already_paired'; end if;
  loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      into v_code from generate_series(1, 6);
    exit when not exists (select 1 from couples where invite_code = v_code);
  end loop;
  insert into couples (invite_code, closed_through)
    values (v_code, user_today(auth.uid()) - 1) returning * into c;
  insert into couple_members (couple_id, user_id, color) values (c.id, auth.uid(), 'flame');
  return c;
end $$;
revoke execute on function public.create_couple() from public, anon;
grant execute on function public.create_couple() to authenticated;

create or replace function public.streak_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_today date;
begin
  v_today := couple_today(new.couple_id);
  new.start_date := v_today;
  new.closed_through := v_today - 1;
  new.archived_at := null;
  new.archived_on := null;
  return new;
end $$;

-- Frecuencia/modo inmutables; archivar fija archived_on.
create or replace function public.streak_before_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.couple_id <> old.couple_id or new.frequency <> old.frequency or new.mode <> old.mode
     or new.weekly_target is distinct from old.weekly_target or new.start_date <> old.start_date
     or new.created_by <> old.created_by then
    raise exception 'immutable_field';
  end if;
  if auth.uid() is null then return new; end if; -- service role / cierre
  new.closed_through := old.closed_through;
  if old.archived_at is not null then
    new.archived_at := old.archived_at;
    new.archived_on := old.archived_on;
  elsif new.archived_at is not null then
    new.archived_at := app_now();
    new.archived_on := couple_today(old.couple_id);
  else
    new.archived_on := null;
  end if;
  return new;
end $$;

---------------------------------------------------------------------------
-- Check-ins: fecha local de quien marca; nunca en un día ya cerrado (cubre viajes al oeste).

create or replace function public.check_in_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  s streaks;
  v_user uuid;
  v_today date;
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
  v_today := user_today(v_user);

  if tg_op = 'INSERT' then
    new.local_date := v_today;
    if s.archived_at is not null then raise exception 'archived'; end if;
    if not is_due(s, v_today) then raise exception 'not_due'; end if;
  elsif old.local_date <> v_today then
    raise exception 'day_closed';
  end if;
  if v_today <= s.closed_through then raise exception 'day_closed'; end if;

  if tg_op = 'INSERT' then return new; end if;
  return old;
end $$;

create or replace function public.check_in_saved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from nudges n
    where n.streak_id = new.streak_id and n.to_user = new.user_id and n.kind = 'nudge'
      and (n.created_at at time zone (select timezone from profiles where id = new.user_id))::date = new.local_date
  ) then
    perform unlock(new.couple_id, 'saved');
  end if;
  return null;
end $$;

---------------------------------------------------------------------------
-- Cierre: el día D se cierra cuando ya terminó para ambos miembros.

create or replace function public.close_due_days() returns void
language plpgsql security definer set search_path = public as $$
declare
  c couples; s streaks;
  v_until date; d date;
  v_flame uuid; v_sky uuid;
begin
  for c in select * from couples for update skip locked loop
    select user_id into v_flame from couple_members where couple_id = c.id and color = 'flame';
    select user_id into v_sky from couple_members where couple_id = c.id and color = 'sky';
    -- ponytail: pareja de uno = sky es el mismo flame; las filas duplicadas chocan con la PK y se ignoran
    v_sky := coalesce(v_sky, v_flame);
    v_until := couple_today(c.id); -- primer día que aún no termina para alguno de los dos

    for s in select * from streaks where couple_id = c.id and closed_through < v_until - 1 loop
      d := s.closed_through + 1;
      while d < v_until and (s.archived_on is null or d < s.archived_on) loop
        perform close_streak_day(s, d, v_flame, v_sky);
        d := d + 1;
      end loop;
      update streaks set closed_through = d - 1 where id = s.id and closed_through < d - 1;
    end loop;

    d := c.closed_through + 1;
    while d < v_until loop
      perform close_couple_day(c, d, v_flame, v_sky);
      d := d + 1;
    end loop;
    update couples set closed_through = d - 1 where id = c.id;
  end loop;
end $$;

---------------------------------------------------------------------------
-- Protector: sobre la fecha local de quien lo usa, mientras ese día siga abierto.

create or replace function public.use_freeze(p_streak uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s streaks; v_today date;
begin
  select * into s from streaks where id = p_streak;
  if not found or not is_member(s.couple_id) then raise exception 'not_member'; end if;
  perform 1 from couples where id = s.couple_id for update;
  v_today := user_today(auth.uid());
  if s.archived_at is not null or not is_due(s, v_today) then raise exception 'not_due'; end if;
  if v_today <= s.closed_through then raise exception 'day_closed'; end if;
  if (select freezes from couples where id = s.couple_id) < 1 then raise exception 'no_freezes'; end if;
  insert into freeze_uses (couple_id, streak_id, local_date, used_by)
    values (s.couple_id, s.id, v_today, auth.uid());
  update couples set freezes = freezes - 1 where id = s.couple_id;
  perform unlock(s.couple_id, 'saved');
exception when unique_violation then
  raise exception 'already_protected';
end $$;

---------------------------------------------------------------------------
-- Recordatorios: a la hora elegida en la zona de cada miembro (ventana de 1 h), una vez por día local.

create or replace function public.claim_reminders() returns table (
  user_id uuid, streak_id uuid, streak_name text, at_stake int
)
language sql security definer set search_path = public as $$
  with now_local as (
    select m.couple_id, m.user_id, (app_now() at time zone p.timezone) as ts
    from couple_members m join profiles p on p.id = m.user_id
  ),
  candidates as (
    select n.user_id, s.id as streak_id, s.name as streak_name, n.ts::date as local_date,
           coalesce(sc.current, 0) as at_stake
    from streaks s
    join now_local n on n.couple_id = s.couple_id
    left join streak_counters sc on sc.streak_id = s.id and sc.user_id = n.user_id
    where s.reminder and s.archived_at is null and is_due(s, n.ts::date)
      and n.ts::time >= s.reminder_time and n.ts::time - s.reminder_time < interval '1 hour'
      and n.ts::date > s.closed_through
      and not exists (select 1 from freeze_uses f where f.streak_id = s.id and f.local_date = n.ts::date)
      and case when s.frequency = 'weekly' then
            extract(isodow from n.ts::date) = 7
            and (select count(*) from check_ins ci where ci.streak_id = s.id and ci.user_id = n.user_id
                   and ci.local_date between n.ts::date - 6 and n.ts::date) < s.weekly_target
          else
            not exists (select 1 from check_ins ci where ci.streak_id = s.id and ci.user_id = n.user_id
                          and ci.local_date = n.ts::date)
          end
  ),
  claimed as (
    insert into reminders_sent (streak_id, user_id, local_date)
    select streak_id, user_id, local_date from candidates
    on conflict do nothing
    returning streak_id, user_id
  )
  select c.user_id, c.streak_id, c.streak_name, c.at_stake
  from candidates c join claimed k using (streak_id, user_id)
$$;

---------------------------------------------------------------------------
-- Lecturas para la UI: todo relativo a la fecha local de quien consulta.

create or replace function public.today_state() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  c couples;
  v_tz text; v_now timestamp; v_today date; v_ws date;
begin
  select co.* into c from couples co join couple_members m on m.couple_id = co.id where m.user_id = auth.uid();
  if not found then return null; end if;
  select timezone into v_tz from profiles where id = auth.uid();
  v_now := app_now() at time zone v_tz;
  v_today := v_now::date;
  v_ws := v_today - (extract(isodow from v_today)::int - 1);

  return jsonb_build_object(
    'me', auth.uid(),
    'now', to_char(v_now, 'YYYY-MM-DD"T"HH24:MI:SS'),
    'today', v_today,
    'timezone', v_tz,
    'couple', jsonb_build_object('id', c.id, 'invite_code', c.invite_code,
      'freezes', c.freezes, 'best_streak', c.best_streak, 'paired_at', c.paired_at),
    'members', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'name', p.name, 'color', m.color,
        'avatar_style', p.avatar_style, 'avatar_seed', p.avatar_seed, 'today', user_today(m.user_id)) order by m.color)
      from couple_members m join profiles p on p.id = m.user_id where m.couple_id = c.id), '[]'),
    'closed_streak', coalesce((select streak_after from couple_days where couple_id = c.id order by local_date desc limit 1), 0),
    'week', coalesce((select jsonb_agg(jsonb_build_object('date', local_date, 'state', state) order by local_date)
      from couple_days where couple_id = c.id and local_date between v_ws and v_ws + 6), '[]'),
    'sparks', coalesce((select sum(sparks) from couple_sparks where couple_id = c.id), 0),
    'last_nudge', (select jsonb_build_object('id', n.id, 'from_user', n.from_user, 'streak_id', n.streak_id,
        'kind', n.kind, 'body', n.body, 'created_at', n.created_at)
      from nudges n where n.couple_id = c.id and n.to_user = auth.uid()
        and (n.created_at at time zone v_tz)::date = v_today
      order by n.created_at desc limit 1),
    'streaks', coalesce((select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'icon', s.icon, 'frequency', s.frequency, 'weekly_target', s.weekly_target,
        'mode', s.mode, 'reminder', s.reminder, 'reminder_time', s.reminder_time,
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
          from streak_counters sc where sc.streak_id = s.id), '{}'),
        -- Si voy adelantado, ayer sigue abierto hasta la medianoche de mi pareja: la UI lo suma al conteo.
        -- ponytail: solo rachas diarias y un día de desfase; semanales esperan al cierre
        'prev', case when s.frequency <> 'weekly' and s.closed_through < v_today - 1 then jsonb_build_object(
          'due', is_due(s, v_today - 1),
          'protected', exists (select 1 from freeze_uses f where f.streak_id = s.id and f.local_date = v_today - 1),
          'done', (select jsonb_object_agg(m.user_id, exists (select 1 from check_ins ci
            where ci.streak_id = s.id and ci.user_id = m.user_id and ci.local_date = v_today - 1))
            from couple_members m where m.couple_id = c.id)) end
      ) order by s.created_at)
      from streaks s where s.couple_id = c.id and s.archived_at is null), '[]')
  );
end $$;

create or replace function public.month_calendar(p_year int, p_month int) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  c couples; v_today date; v_first date; v_last date;
begin
  select co.* into c from couples co join couple_members m on m.couple_id = co.id where m.user_id = auth.uid();
  if not found then return null; end if;
  v_today := user_today(auth.uid());
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
-- Limpieza

drop function public.couple_now(uuid);
alter table public.couples drop column timezone;

revoke execute on function public.profile_timezone_guard(), public.user_today(uuid), public.couple_today(uuid)
  from public, anon, authenticated;
