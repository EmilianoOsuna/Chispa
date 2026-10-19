-- Endurecimiento según los advisors de Supabase.

-- Funciones internas y de triggers: nadie las llama por la API.
revoke execute on function public.check_in_guard(), public.check_in_saved(), public.nudge_push(),
  public.streak_after_insert(), public.streak_before_insert(), public.streak_before_update(),
  public.couple_now(uuid) from public, anon, authenticated;
-- Usadas por políticas RLS (las evalúa authenticated) o solo en pruebas.
revoke execute on function public.is_member(uuid), public.is_partner(uuid), public.my_couple() from public, anon;

alter function public.app_now() set search_path = public;
alter function public.deadline_on(public.streaks, date) set search_path = public;
alter function public.is_due(public.streaks, date) set search_path = public;

-- auth.uid() evaluado una vez por consulta, no por fila.
alter policy "propio o pareja" on public.profiles using (id = (select auth.uid()) or public.is_partner(id));
alter policy "crear propio" on public.profiles with check (id = (select auth.uid()));
alter policy "editar propio" on public.profiles using (id = (select auth.uid())) with check (id = (select auth.uid()));
alter policy "miembro crea" on public.streaks with check (public.is_member(couple_id) and created_by = (select auth.uid()));
alter policy "propio" on public.check_ins with check (user_id = (select auth.uid()) and public.is_member(couple_id));
alter policy "borrar propio" on public.check_ins using (user_id = (select auth.uid()));
alter policy "propia" on public.push_subscriptions using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
