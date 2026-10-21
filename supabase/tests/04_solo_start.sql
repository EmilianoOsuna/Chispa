begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.mx'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.mx');
insert into public.profiles (id, name, timezone) values
  ('00000000-0000-0000-0000-00000000000a', 'Emi', 'America/Mexico_City'),
  ('00000000-0000-0000-0000-00000000000b', 'Hanna', 'America/Mexico_City');

-- Lunes: Emi crea la pareja y una racha sin esperar a Hanna
set local app.now = '2026-10-19 12:00:00-06';
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
select public.create_couple();
select lives_ok($$
  insert into public.streaks (id, couple_id, name, icon, frequency, mode, created_by)
  values ('50000000-0000-0000-0000-000000000001', public.my_couple(), 'Ejercicio', 'ejercicio', 'daily', 'together', auth.uid())
$$, 'puede crear rachas sin pareja');
select lives_ok($$ insert into public.check_ins (streak_id, user_id) values ('50000000-0000-0000-0000-000000000001', auth.uid()) $$,
  'puede marcar sin pareja');
reset role;
update public.couples set invite_code = 'SOLO22' where id = (select couple_id from public.couple_members where user_id = '00000000-0000-0000-0000-00000000000a');

-- Martes: se cierra el lunes con un solo miembro
set local app.now = '2026-10-20 08:00:00-06';
select public.close_due_days();
select is((select current from public.streak_counters where user_id = '00000000-0000-0000-0000-00000000000a'), 1, 'racha de uno cuenta');
select is((select state from public.couple_days where couple_id = (select couple_id from public.couple_members where user_id = '00000000-0000-0000-0000-00000000000a') and local_date = '2026-10-19'), 'perfect', 'día perfecto de uno');

-- Martes: Hanna se une; no se reinicia nada y hereda el contador Juntos
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;
select public.join_couple('SOLO22');
reset role;
select is((select current from public.streak_counters where user_id = '00000000-0000-0000-0000-00000000000b'), 1, 'Hanna hereda el contador Juntos');
select is((select closed_through from public.couples where id = (select couple_id from public.couple_members where user_id = '00000000-0000-0000-0000-00000000000a')), '2026-10-19'::date, 'unirse no reinicia el historial');
select ok((select paired_at is not null from public.couples where id = (select couple_id from public.couple_members where user_id = '00000000-0000-0000-0000-00000000000a')), 'la pareja queda completa');

select * from finish();
rollback;
