-- Esquema base de Chispa (design.md §7)

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 40),
  created_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique check (invite_code ~ '^[A-Z2-9]{6}$'),
  timezone text not null,
  freezes int not null default 0 check (freezes between 0 and 2),
  best_streak int not null default 0,
  closed_through date, -- último día de pareja cerrado por close_due_days()
  paired_at timestamptz,
  created_at timestamptz not null default now()
);

-- unique(couple_id, color) con 2 colores posibles = máximo 2 miembros
create table public.couple_members (
  couple_id uuid not null references public.couples on delete cascade,
  user_id uuid not null unique references public.profiles on delete cascade,
  color text not null check (color in ('flame', 'sky')),
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (couple_id, color)
);

create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  icon text not null check (icon in ('agua', 'ejercicio', 'dormir', 'leer', 'meditar', 'comer')),
  frequency text not null check (frequency in ('daily', 'weekdays', 'weekly')),
  weekly_target int,
  mode text not null check (mode in ('together', 'solo')),
  deadline time not null default '23:59',
  pending_deadline time, -- cambio de hora límite que aplica desde pending_from
  pending_from date,
  reminder boolean not null default true,
  start_date date not null,
  closed_through date not null, -- último día cerrado de esta racha
  archived_at timestamptz,
  archived_on date,
  created_by uuid not null references public.profiles,
  created_at timestamptz not null default now(),
  check ((frequency = 'weekly') = (weekly_target is not null)),
  check (weekly_target is null or weekly_target between 1 and 6)
);
create index on public.streaks (couple_id);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  streak_id uuid not null references public.streaks on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  local_date date not null,
  created_at timestamptz not null default now(),
  unique (streak_id, user_id, local_date)
);
create index on public.check_ins (couple_id, local_date);

-- Resultado de cada racha por día cerrado (semanales: fila en el domingo)
create table public.streak_days (
  streak_id uuid not null references public.streaks on delete cascade,
  local_date date not null,
  user_id uuid not null references public.profiles on delete cascade,
  done boolean not null,
  protected boolean not null default false,
  primary key (streak_id, local_date, user_id)
);

create table public.streak_counters (
  streak_id uuid not null references public.streaks on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  current int not null default 0,
  best int not null default 0,
  primary key (streak_id, user_id)
);

create table public.couple_days (
  couple_id uuid not null references public.couples on delete cascade,
  local_date date not null,
  state text not null check (state in ('perfect', 'protected', 'broken', 'neutral')),
  flame_all boolean not null,
  sky_all boolean not null,
  streak_after int not null, -- racha en pareja al cerrar este día
  primary key (couple_id, local_date)
);

create table public.freeze_uses (
  couple_id uuid not null references public.couples on delete cascade,
  streak_id uuid not null references public.streaks on delete cascade,
  local_date date not null,
  used_by uuid not null references public.profiles,
  created_at timestamptz not null default now(),
  primary key (streak_id, local_date)
);

create table public.nudges (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  streak_id uuid references public.streaks on delete cascade,
  from_user uuid not null references public.profiles on delete cascade,
  to_user uuid not null references public.profiles on delete cascade,
  kind text not null check (kind in ('nudge', 'high_five')),
  body text check (char_length(body) <= 140),
  created_at timestamptz not null default now()
);
create index on public.nudges (couple_id, created_at desc);

create table public.achievements (
  couple_id uuid not null references public.couples on delete cascade,
  code text not null,
  unlocked_at timestamptz not null default now(),
  primary key (couple_id, code)
);

create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.profiles on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table public.reminders_sent (
  streak_id uuid not null references public.streaks on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  local_date date not null,
  primary key (streak_id, user_id, local_date)
);
