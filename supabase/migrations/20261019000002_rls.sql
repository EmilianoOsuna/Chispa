-- Aislamiento por pareja: todo se decide en la base de datos.

create function public.is_member(p_couple uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from couple_members where couple_id = p_couple and user_id = auth.uid())
$$;

create function public.is_partner(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from couple_members a join couple_members b on a.couple_id = b.couple_id
    where a.user_id = auth.uid() and b.user_id = p_user
  )
$$;

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.streaks enable row level security;
alter table public.check_ins enable row level security;
alter table public.streak_days enable row level security;
alter table public.streak_counters enable row level security;
alter table public.couple_days enable row level security;
alter table public.freeze_uses enable row level security;
alter table public.nudges enable row level security;
alter table public.achievements enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reminders_sent enable row level security;

create policy "propio o pareja" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_partner(id));
create policy "crear propio" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "editar propio" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "miembro" on public.couples for select to authenticated using (public.is_member(id));
create policy "miembro" on public.couple_members for select to authenticated using (public.is_member(couple_id));

create policy "miembro" on public.streaks for select to authenticated using (public.is_member(couple_id));
create policy "miembro crea" on public.streaks for insert to authenticated
  with check (public.is_member(couple_id) and created_by = auth.uid());
create policy "miembro edita" on public.streaks for update to authenticated
  using (public.is_member(couple_id)) with check (public.is_member(couple_id));

create policy "miembro" on public.check_ins for select to authenticated using (public.is_member(couple_id));
create policy "propio" on public.check_ins for insert to authenticated
  with check (user_id = auth.uid() and public.is_member(couple_id));
create policy "borrar propio" on public.check_ins for delete to authenticated using (user_id = auth.uid());

create policy "miembro" on public.streak_days for select to authenticated
  using (exists (select 1 from public.streaks s where s.id = streak_id and public.is_member(s.couple_id)));
create policy "miembro" on public.streak_counters for select to authenticated
  using (exists (select 1 from public.streaks s where s.id = streak_id and public.is_member(s.couple_id)));
create policy "miembro" on public.couple_days for select to authenticated using (public.is_member(couple_id));
create policy "miembro" on public.freeze_uses for select to authenticated using (public.is_member(couple_id));
create policy "miembro" on public.nudges for select to authenticated using (public.is_member(couple_id));
create policy "miembro" on public.achievements for select to authenticated using (public.is_member(couple_id));

create policy "propia" on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- reminders_sent: sin políticas, solo service role.

revoke all on public.reminders_sent from anon, authenticated;
revoke insert, update, delete on public.couples, public.couple_members, public.streak_days,
  public.streak_counters, public.couple_days, public.freeze_uses, public.nudges, public.achievements
  from anon, authenticated;
revoke all on all tables in schema public from anon;
