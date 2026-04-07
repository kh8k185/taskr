-- =============================================
-- TASKR DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- =============================================

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  display_name text not null default 'User',
  avatar_initial text not null default 'U',
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 2. Tasks
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  text        text not null,
  priority    text not null default 'medium' check (priority in ('high','medium','low')),
  category    text not null default 'personal',
  due         date,
  done        boolean not null default false,
  pinned      boolean not null default false,
  notes       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. Subtasks
create table if not exists public.subtasks (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  text        text not null,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles  enable row level security;
alter table public.tasks      enable row level security;
alter table public.subtasks   enable row level security;

-- Profiles: users can read their own, admins can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow profile inserts (called after signup)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Tasks: users own their tasks
create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Subtasks: access via task ownership
create policy "Users manage own subtasks"
  on public.subtasks for all
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = subtasks.task_id
      and tasks.user_id = auth.uid()
    )
  );

-- =============================================
-- ADMIN POLICY (service role bypasses RLS)
-- For the admin page, use the Supabase service
-- role key in a server function / edge function.
-- =============================================

-- =============================================
-- MAKE YOURSELF AN ADMIN
-- Replace 'your-email@example.com' below
-- =============================================
-- update public.profiles
--   set is_admin = true
-- where email = 'your-email@example.com';

-- =============================================
-- HELPER: auto-update updated_at on tasks
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();
