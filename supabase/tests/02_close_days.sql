begin;
create extension if not exists pgtap with schema extensions;
select plan(25);

-- Pareja A (flame) + B (sky), America/Mexico_City (UTC-6). Semana del lunes 5 de octubre de 2026.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.mx'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.mx');
insert into public.profiles (id, name) values
  ('00000000-0000-0000-0000-00000000000a', 'Emi'),
  ('00000000-0000-0000-0000-00000000000b', 'Hanna');

set local app.now = '2026-10-05 12:00:00-06';
insert into public.couples (id, invite_code, timezone, paired_at, closed_through)
  values ('c0000000-0000-0000-0000-000000000001', 'CCCCCC', 'America/Mexico_City', now(), '2026-10-04');
insert into public.couple_members (couple_id, user_id, color) values
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'flame'),
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'sky');

insert into public.streaks (id, couple_id, name, icon, frequency, weekly_target, mode, deadline, created_by) values
  ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Ejercicio', 'ejercicio', 'daily', null, 'together', '23:30', '00000000-0000-0000-0000-00000000000a'),
  ('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Leer', 'leer', 'weekdays', null, 'solo', '23:59', '00000000-0000-0000-0000-00000000000a'),
  ('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Agua', 'agua', 'weekly', 2, 'together', '23:59', '00000000-0000-0000-0000-00000000000a');

-- s1 juntos: B falla el martes 6 y el domingo 11 (domingo protegido)
insert into public.check_ins (streak_id, user_id, local_date)
select '50000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-00000000000a'::uuid, d::date
  from generate_series('2026-10-05'::date, '2026-10-11', '1 day') d
union all
select '50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', d::date
  from unnest(array['2026-10-05', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10']) d
-- s2 entre semana: ambos lunes a viernes
union all
select '50000000-0000-0000-0000-000000000002', u, d::date
  from generate_series('2026-10-05'::date, '2026-10-09', '1 day') d,
       unnest(array['00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b']::uuid[]) u
-- s3 semanal meta 2: ambos lunes y martes
union all
select '50000000-0000-0000-0000-000000000003', u, d::date
  from unnest(array['2026-10-05', '2026-10-06']) d,
       unnest(array['00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b']::uuid[]) u;
insert into public.freeze_uses (couple_id, streak_id, local_date, used_by)
  values ('c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '2026-10-11', '00000000-0000-0000-0000-00000000000a');

set local app.now = '2026-10-12 08:00:00-06';
select public.close_due_days();

select is((select current from public.streak_counters where streak_id = '50000000-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-00000000000a'), 5,
  'juntos: martes reinicia, domingo protegido cuenta → 5');
select is((select best from public.streak_counters where streak_id = '50000000-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-00000000000b'), 5, 'mejor racha 5');
select is((select current from public.streak_counters where streak_id = '50000000-0000-0000-0000-000000000002' and user_id = '00000000-0000-0000-0000-00000000000b'), 5,
  'entre semana: fin de semana no rompe → 5');
select is((select current from public.streak_counters where streak_id = '50000000-0000-0000-0000-000000000003' and user_id = '00000000-0000-0000-0000-00000000000a'), 1,
  'semanal: semana cumplida → 1');
select is((select state from public.couple_days where couple_id = 'c0000000-0000-0000-0000-000000000001' and local_date = '2026-10-06'), 'broken', 'martes roto');
select is((select array[flame_all, sky_all] from public.couple_days where couple_id = 'c0000000-0000-0000-0000-000000000001' and local_date = '2026-10-06'), array[true, false], 'martes: solo Emi cumplió todo');
select is((select state from public.couple_days where couple_id = 'c0000000-0000-0000-0000-000000000001' and local_date = '2026-10-11'), 'protected', 'domingo protegido');
select is((select streak_after from public.couple_days where couple_id = 'c0000000-0000-0000-0000-000000000001' and local_date = '2026-10-11'), 5, 'racha en pareja 5 al domingo');
select is((select best_streak from public.couples where id = 'c0000000-0000-0000-0000-000000000001'), 5, 'mejor racha de pareja 5');

select public.close_due_days();
select is((select current from public.streak_counters where streak_id = '50000000-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-00000000000a'), 5,
  'cierre idempotente');

-- lunes 12 y martes 13 perfectos → 7 días → protector + logro
insert into public.check_ins (streak_id, user_id, local_date)
select s, u, d::date
  from unnest(array['50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002']::uuid[]) s,
       unnest(array['00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b']::uuid[]) u,
       unnest(array['2026-10-12', '2026-10-13']) d;
set local app.now = '2026-10-14 08:00:00-06';
select public.close_due_days();
select is((select streak_after from public.couple_days where couple_id = 'c0000000-0000-0000-0000-000000000001' and local_date = '2026-10-13'), 7, '7 días en pareja');
select is((select freezes from public.couples where id = 'c0000000-0000-0000-0000-000000000001'), 1, 'gana 1 protector a los 7 días perfectos');
select ok(exists (select 1 from public.achievements where code = 'week' and couple_id = 'c0000000-0000-0000-0000-000000000001'), 'logro Primera semana');

-- RPCs como A
set local app.now = '2026-10-14 12:00:00-06';
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
select lives_ok($$ select public.use_freeze('50000000-0000-0000-0000-000000000002') $$, 'usa protector');
select is((select freezes from public.couples where id = 'c0000000-0000-0000-0000-000000000001'), 0, 'protector descontado');
select throws_ok($$ select public.use_freeze('50000000-0000-0000-0000-000000000001') $$, 'no_freezes', 'sin protectores');
select lives_ok($$ select public.send_nudge('50000000-0000-0000-0000-000000000001', '¡Vamos!') $$, 'envía toque');
select throws_ok($$ select public.send_nudge('50000000-0000-0000-0000-000000000001', 'otra vez') $$, 'rate_limited', 'límite de 10 min');
update public.streaks set deadline = '20:00' where id = '50000000-0000-0000-0000-000000000001';
select is((select array[deadline::text, pending_deadline::text, pending_from::text] from public.streaks where id = '50000000-0000-0000-0000-000000000001'),
  array['23:30:00', '20:00:00', '2026-10-15'], 'cambio de hora límite aplica mañana');
select is(jsonb_array_length(public.today_state() -> 'streaks'), 3, 'today_state lista 3 rachas');

set local app.now = '2026-10-14 23:45:00-06';
select throws_ok($$ insert into public.check_ins (streak_id, user_id) values ('50000000-0000-0000-0000-000000000001', auth.uid()) $$,
  'day_closed', 'check-in después de la hora límite rechazado');
reset role;

select public.close_due_days();
select is((select current from public.streak_counters where streak_id = '50000000-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-00000000000a'), 0,
  'pasada la hora límite sin cumplir, la racha se apaga');
select is((select closed_through from public.streaks where id = '50000000-0000-0000-0000-000000000002'), '2026-10-13'::date,
  'racha con límite 23:59 aún abierta a las 23:45');

set local app.now = '2026-10-17 12:00:00-06';
set local role authenticated;
select throws_ok($$ insert into public.check_ins (streak_id, user_id) values ('50000000-0000-0000-0000-000000000002', auth.uid()) $$,
  'not_due', 'entre semana no se marca en sábado');
reset role;

select is((select sparks from public.couple_sparks where user_id = '00000000-0000-0000-0000-00000000000a'), 340,
  'chispas: 10 por check-in + 10 si la pareja también cumplió');

select * from finish();
rollback;
