-- Notificaciones push: pg_net llama a la Edge Function `push` (URL y secreto en Vault).

create function public.call_push(p_payload jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_url text; v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_secret';
  if v_url is null or v_secret is null then return; end if; -- push no configurado
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', v_secret),
    body := p_payload
  );
end $$;

-- Reserva (una sola vez por racha, persona y día) los recordatorios que tocan ahora:
-- miembros pendientes a 2 h o menos de la hora límite. Semanales: solo el domingo si no llegan a la meta.
create function public.claim_reminders() returns table (
  user_id uuid, streak_id uuid, streak_name text, at_stake int
)
language sql security definer set search_path = public as $$
  with now_local as (
    select c.id as couple_id, (app_now() at time zone c.timezone) as ts
    from couples c where c.paired_at is not null
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

create function public.nudge_push() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform call_push(jsonb_build_object('mode', 'nudge', 'nudge_id', new.id));
  return null;
end $$;
create trigger nudge_push after insert on public.nudges
  for each row execute function public.nudge_push();

revoke execute on function public.call_push(jsonb), public.claim_reminders() from public, anon, authenticated;

select cron.schedule('push-reminders', '*/5 * * * *', $$select public.call_push('{"mode":"reminders"}')$$);
