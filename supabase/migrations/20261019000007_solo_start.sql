-- Usar Chispa antes de que se una la pareja + aviso (push y realtime) cuando se une.

-- La pareja cuenta días desde que se crea, no desde que se completa.
update public.couples set closed_through = coalesce(closed_through, (created_at at time zone timezone)::date - 1);
alter table public.couples alter column closed_through set not null;

create or replace function public.create_couple(p_timezone text) returns public.couples
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
  insert into couples (invite_code, timezone, closed_through)
    values (v_code, p_timezone, (app_now() at time zone p_timezone)::date - 1) returning * into c;
  insert into couple_members (couple_id, user_id, color) values (c.id, auth.uid(), 'flame');
  return c;
end $$;

-- Al unirse: no reinicia el historial; hereda los contadores de las rachas Juntos.
create or replace function public.join_couple(p_code text) returns public.couples
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
  insert into streak_counters (streak_id, user_id, current, best)
    select s.id, auth.uid(),
           case when s.mode = 'together' then coalesce(sc.current, 0) else 0 end,
           case when s.mode = 'together' then coalesce(sc.best, 0) else 0 end
    from streaks s left join streak_counters sc on sc.streak_id = s.id
    where s.couple_id = c.id
  on conflict do nothing;
  update couples set paired_at = app_now() where id = c.id returning * into c;
  return c;
end $$;

-- Rachas desde el primer día, aunque la pareja no se haya unido.
create or replace function public.streak_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_today date;
begin
  v_today := couple_now(new.couple_id)::date;
  new.start_date := v_today;
  new.closed_through := v_today - 1;
  new.pending_deadline := null;
  new.pending_from := null;
  new.archived_at := null;
  new.archived_on := null;
  return new;
end $$;

-- Cierre: con un solo miembro, ese miembro cuenta como "los dos".
create or replace function public.close_due_days() returns void
language plpgsql security definer set search_path = public as $$
declare
  c couples; s streaks;
  v_now timestamp; v_today date; d date;
  v_flame uuid; v_sky uuid;
begin
  for c in select * from couples for update skip locked loop
    v_now := app_now() at time zone c.timezone;
    v_today := v_now::date;
    select user_id into v_flame from couple_members where couple_id = c.id and color = 'flame';
    select user_id into v_sky from couple_members where couple_id = c.id and color = 'sky';
    -- ponytail: pareja de uno = sky es el mismo flame; las filas duplicadas chocan con la PK y se ignoran
    v_sky := coalesce(v_sky, v_flame);

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

-- Recordatorios también para parejas de uno.
create or replace function public.claim_reminders() returns table (
  user_id uuid, streak_id uuid, streak_name text, at_stake int
)
language sql security definer set search_path = public as $$
  with now_local as (
    select c.id as couple_id, (app_now() at time zone c.timezone) as ts from couples c
  ),
  candidates as (
    select m.user_id, s.id as streak_id, s.name as streak_name, n.ts::date as local_date,
           coalesce(sc.current, 0) as at_stake
    from streaks s
    join now_local n on n.couple_id = s.couple_id
    join couple_members m on m.couple_id = s.couple_id
    left join streak_counters sc on sc.streak_id = s.id and sc.user_id = m.user_id
    where s.reminder and s.archived_at is null and is_due(s, n.ts::date)
      and n.ts::time < deadline_on(s, n.ts::date)
      and n.ts::time >= deadline_on(s, n.ts::date) - interval '2 hours'
      and not exists (select 1 from freeze_uses f where f.streak_id = s.id and f.local_date = n.ts::date)
      and case when s.frequency = 'weekly' then
            extract(isodow from n.ts::date) = 7
            and (select count(*) from check_ins ci where ci.streak_id = s.id and ci.user_id = m.user_id
                   and ci.local_date between n.ts::date - 6 and n.ts::date) < s.weekly_target
          else
            not exists (select 1 from check_ins ci where ci.streak_id = s.id and ci.user_id = m.user_id
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

-- Push al creador cuando su pareja se une.
create function public.partner_joined_push() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.color = 'sky' then
    perform call_push(jsonb_build_object('mode', 'joined', 'couple_id', new.couple_id, 'user_id', new.user_id));
  end if;
  return null;
end $$;
create trigger partner_joined_push after insert on public.couple_members
  for each row execute function public.partner_joined_push();
revoke execute on function public.partner_joined_push() from public, anon, authenticated;

-- Realtime en todo lo que la UI muestra de la pareja.
alter publication supabase_realtime add table public.couples, public.couple_days, public.achievements, public.freeze_uses;
