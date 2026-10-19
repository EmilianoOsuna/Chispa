begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.mx'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.mx');
insert into public.profiles (id, name) values
  ('00000000-0000-0000-0000-00000000000a', 'Emi'),
  ('00000000-0000-0000-0000-00000000000b', 'Hannah');

set local app.now = '2026-10-19 12:00:00-06';
insert into public.couples (id, invite_code, timezone, paired_at, closed_through)
  values ('c0000000-0000-0000-0000-000000000001', 'CCCCCC', 'America/Mexico_City', now(), '2026-10-18');
insert into public.couple_members (couple_id, user_id, color) values
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'flame'),
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'sky');
insert into public.streaks (id, couple_id, name, icon, frequency, mode, deadline, reminder, created_by) values
  ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Dormir', 'dormir', 'daily', 'together', '23:30', true, '00000000-0000-0000-0000-00000000000a'),
  ('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Leer', 'leer', 'daily', 'together', '23:30', false, '00000000-0000-0000-0000-00000000000a');
insert into public.check_ins (streak_id, user_id, local_date)
  values ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', '2026-10-19');

set local app.now = '2026-10-19 20:00:00-06'; -- 3.5 h antes: nada
select is((select count(*)::int from public.claim_reminders()), 0, 'antes de la ventana de 2 h no hay recordatorios');

set local app.now = '2026-10-19 21:30:00-06';
select is((select array_agg(user_id::text) from public.claim_reminders()), array['00000000-0000-0000-0000-00000000000a'],
  'solo Emi (pendiente) recibe; Hannah ya cumplió; racha sin recordatorio se ignora');
set local app.now = '2026-10-19 22:00:00-06';
select is((select count(*)::int from public.claim_reminders()), 0, 'máximo un recordatorio por racha, persona y día');

set local app.now = '2026-10-19 23:40:00-06';
delete from public.reminders_sent;
select is((select count(*)::int from public.claim_reminders()), 0, 'pasada la hora límite no se recuerda');

select * from finish();
rollback;
