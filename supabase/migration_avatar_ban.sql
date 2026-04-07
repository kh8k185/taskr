-- =============================================
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add avatar_url and banned to profiles
alter table public.profiles
  add column if not exists avatar_url  text default null,
  add column if not exists banned      boolean not null default false;

-- 2. Create avatars storage bucket (public read)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- 3. Storage policy: users can upload their own avatar
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public avatar read"
  on storage.objects for select
  using (bucket_id = 'avatars');
