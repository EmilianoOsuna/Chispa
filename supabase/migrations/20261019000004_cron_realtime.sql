create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.schedule('close-due-days', '*/5 * * * *', 'select public.close_due_days()');

alter publication supabase_realtime add table public.check_ins, public.nudges, public.couple_members, public.streaks;
