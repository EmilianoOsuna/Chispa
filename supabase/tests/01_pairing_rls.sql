begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

-- Usuarios: a+b (pareja 1), c+d (pareja 2), e (sobrante)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.mx'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.mx'),
  ('00000000-0000-0000-0000-00000000000c', 'c@test.mx'),
  ('00000000-0000-0000-0000-00000000000d', 'd@test.mx'),
  ('00000000-0000-0000-0000-00000000000e', 'e@test.mx');
insert into public.profiles (id, name) values
  ('00000000-0000-0000-0000-00000000000a', 'Emi'),
  ('00000000-0000-0000-0000-00000000000b', 'Hanna'),
  ('00000000-0000-0000-0000-00000000000c', 'Caro'),
  ('00000000-0000-0000-0000-00000000000d', 'Dani'),
  ('00000000-0000-0000-0000-00000000000e', 'Eli');

create schema t;
grant usage on schema t to authenticated;
create table t.ids (k text primary key, v uuid);
grant select on t.ids to authenticated;

set local app.now = '2026-10-14 12:00:00-06'; -- miércoles

-- A crea pareja
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
select lives_ok($$ select public.create_couple() $$, 'A crea pareja');
select throws_ok($$ select public.create_couple() $$, 'already_paired', 'A no puede crear otra');
reset role;
update public.couples set invite_code = 'AAAAAA' where id = (select couple_id from public.couple_members where user_id = '00000000-0000-0000-0000-00000000000a');

-- B se une
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$ select public.join_couple('ZZZZZZ') $$, 'invalid_code', 'código inválido rechazado');
select lives_ok($$ select public.join_couple(' aaaaaa ') $$, 'B se une con el código (sin importar mayúsculas/espacios)');
reset role;

-- E no cabe
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000e","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$ select public.join_couple('AAAAAA') $$, 'couple_full', 'tercer miembro rechazado');
reset role;
select is((select count(*)::int from public.couple_members where user_id = '00000000-0000-0000-0000-00000000000e'), 0, 'E no quedó en ninguna pareja');

-- C + D
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);
set local role authenticated;
select public.create_couple();
reset role;
update public.couples set invite_code = 'BBBBBB' where id = (select couple_id from public.couple_members where user_id = '00000000-0000-0000-0000-00000000000c');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);
set local role authenticated;
select public.join_couple('BBBBBB');
reset role;

insert into t.ids select 'ab', id from public.couples where invite_code = 'AAAAAA';

-- A crea una racha diaria (límite 21:00) y una entre semana
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
select lives_ok($$
  insert into public.streaks (id, couple_id, name, icon, frequency, mode, reminder_time, created_by) values
  ('10000000-0000-0000-0000-000000000001', public.my_couple(), 'Ejercicio', 'ejercicio', 'daily', 'together', '21:00', auth.uid()),
  ('10000000-0000-0000-0000-000000000002', public.my_couple(), 'Leer', 'leer', 'weekdays', 'solo', '23:59', auth.uid())
$$, 'A crea rachas');
select lives_ok($$ insert into public.check_ins (streak_id, user_id) values ('10000000-0000-0000-0000-000000000001', auth.uid()) $$,
  'A marca su check-in');
select throws_ok($$ insert into public.check_ins (streak_id, user_id) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b') $$,
  'not_yours', 'A no puede marcar por B');
select is((select count(*)::int from public.profiles), 2, 'A ve solo su perfil y el de su pareja');
select throws_ok($$ insert into public.couple_days values ((select v from t.ids where k = 'ab'), '2026-10-13', 'perfect', true, true, 99) $$,
  '42501', null, 'el cliente no puede escribir resultados/chispas');
reset role;

-- C (otra pareja) no ve ni escribe nada de A+B
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*)::int from public.streaks), 0, 'C no ve rachas ajenas');
select is((select count(*)::int from public.check_ins), 0, 'C no ve check-ins ajenos');
select throws_ok($$ insert into public.streaks (couple_id, name, icon, frequency, mode, created_by)
  values ((select v from t.ids where k = 'ab'), 'X', 'agua', 'daily', 'together', auth.uid()) $$,
  '42501', null, 'C no puede crear rachas en otra pareja');
select throws_ok($$ insert into public.check_ins (streak_id, user_id) values ('10000000-0000-0000-0000-000000000001', auth.uid()) $$,
  'not_member', 'C no puede marcar rachas ajenas');
select is(public.today_state() -> 'couple' ->> 'invite_code', 'BBBBBB', 'today_state devuelve solo la pareja propia');
reset role;

select * from finish();
rollback;
