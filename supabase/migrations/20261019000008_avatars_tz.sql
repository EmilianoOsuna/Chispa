-- Avatares DiceBear y zona horaria editable (GPS).

alter table public.profiles
  add column avatar_style text check (avatar_style in ('adventurer', 'bigSmile', 'funEmoji', 'lorelei', 'notionists', 'thumbs')),
  add column avatar_seed text check (char_length(avatar_seed) <= 40);

create function public.set_timezone(p_timezone text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from pg_timezone_names where name = p_timezone) then raise exception 'invalid_timezone'; end if;
  update couples set timezone = p_timezone where id = my_couple();
  if not found then raise exception 'not_member'; end if;
end $$;
revoke execute on function public.set_timezone(text) from public, anon;
grant execute on function public.set_timezone(text) to authenticated;

create or replace function public.today_state() returns jsonb
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
    'members', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'name', p.name, 'color', m.color,
        'avatar_style', p.avatar_style, 'avatar_seed', p.avatar_seed) order by m.color)
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


-- Cambios de nombre/avatar de la pareja en vivo (RLS limita a uno mismo y la pareja).
alter publication supabase_realtime add table public.profiles;
