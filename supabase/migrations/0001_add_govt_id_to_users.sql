-- This migration adds a column for agent verification IDs and sets up the necessary security policies.

-- 1. Add the government_id_url column to the users table
-- This allows storing the URL for the uploaded agent ID.
alter table public.users add column if not exists government_id_url text;


-- 2. Enable Row Level Security (RLS) on the users table
-- This is a crucial security step. If it's already enabled, this command does nothing.
alter table public.users enable row level security;


-- 3. Drop existing policies if they exist, to ensure a clean slate.
drop policy if exists "Allow authenticated user to read their own profile" on public.users;
drop policy if exists "Allow authenticated user to update their own profile" on public.users;


-- 4. Create policy to allow users to view their own profile.
-- This allows a logged-in user to fetch their own data from the 'users' table.
create policy "Allow authenticated user to read their own profile"
on public.users for select
to authenticated
using ( auth.uid() = id );


-- 5. Create policy to allow users to update their own profile.
-- This allows a logged-in user to update their own record in the 'users' table.
-- The specific fields they can update are controlled by the server-side code (in agent-actions.ts).
create policy "Allow authenticated user to update their own profile"
on public.users for update
to authenticated
using ( auth.uid() = id )
with check ( auth.uid() = id );
