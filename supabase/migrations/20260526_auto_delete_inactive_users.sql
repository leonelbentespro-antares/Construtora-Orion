-- Auto-delete users who registered but never contracted a lawyer within 60 days
-- Uses pg_cron (enabled by default on Supabase)

-- 1. Function: delete inactive users
create or replace function delete_inactive_users()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete auth users whose profile shows no paid consultation after 60 days
  -- auth.users cascade deletes the profile via FK
  delete from auth.users
  where id in (
    select p.id
    from public.profiles p
    where p.has_paid_consultation = false
      and p.created_at < now() - interval '60 days'
  );
end;
$$;

-- 2. Schedule: run every day at 03:00 UTC
select cron.schedule(
  'delete-inactive-users-daily',
  '0 3 * * *',
  $$ select delete_inactive_users(); $$
);
