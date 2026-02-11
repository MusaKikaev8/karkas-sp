-- Schema for: clause texts + comments
-- NOTE: Do NOT store нормативный текст в репозитории. Контент вводится founder'ом через UI и хранится в БД.

create extension if not exists pgcrypto;

-- Entity type / visibility enums
do $$ begin
  create type comment_entity_type as enum ('clause', 'calc');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type comment_visibility as enum ('pending', 'public', 'private');
exception
  when duplicate_object then null;
end $$;

-- Optional helper table to mark founder accounts (since DB cannot read app env vars)
-- Insert your founder user_id after sign-up.
create table if not exists app_founders (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

alter table app_founders enable row level security;

-- By default: nobody can read this table from client.
-- Service role bypasses RLS.
create policy "app_founders_no_select" on app_founders
  for select
  using (false);

-- Clause texts
create table if not exists sp_clause_texts (
  id uuid primary key default gen_random_uuid(),
  sp_code text not null,
  clause_id text not null,
  content_md text not null,
  source_url text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

create unique index if not exists sp_clause_texts_sp_clause_unique
  on sp_clause_texts (sp_code, clause_id);

-- Comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  entity_type comment_entity_type not null,
  entity_key text not null,
  author_id uuid not null,
  body text not null,
  visibility comment_visibility not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz null,
  approved_by uuid null
);

create index if not exists comments_entity_idx on comments(entity_key, visibility, created_at);
create index if not exists comments_author_idx on comments(author_id, created_at);

-- Helper function: is current user founder?
create or replace function public.is_founder()
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.app_founders f where f.user_id = auth.uid()
  );
$$;

-- Automatically keep updated_at/updated_by for clause texts
create or replace function public.set_sp_clause_texts_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

do $$ begin
  create trigger trg_sp_clause_texts_updated
  before insert or update on public.sp_clause_texts
  for each row execute function public.set_sp_clause_texts_updated();
exception
  when duplicate_object then null;
end $$;
