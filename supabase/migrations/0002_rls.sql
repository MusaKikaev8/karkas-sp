-- RLS policies

-- sp_clause_texts
alter table public.sp_clause_texts enable row level security;

-- Everyone can read official texts
drop policy if exists "sp_clause_texts_select_all" on public.sp_clause_texts;
create policy "sp_clause_texts_select_all" on public.sp_clause_texts
  for select
  using (true);

-- Only founder can insert/update/delete
drop policy if exists "sp_clause_texts_write_founder" on public.sp_clause_texts;
create policy "sp_clause_texts_write_founder" on public.sp_clause_texts
  for all
  using (public.is_founder())
  with check (public.is_founder());


-- comments
alter table public.comments enable row level security;

-- Public comments visible to everyone
drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments
  for select
  using (visibility = 'public');

-- Pending/private visible to author + founder
drop policy if exists "comments_select_mine_or_founder" on public.comments;
create policy "comments_select_mine_or_founder" on public.comments
  for select
  to authenticated
  using (
    author_id = auth.uid()
    or public.is_founder()
  );

-- Insert: any authed user can create pending/private for self; founder can create public
drop policy if exists "comments_insert_rules" on public.comments;
create policy "comments_insert_rules" on public.comments
  for insert
  to authenticated
  with check (
    (
      author_id = auth.uid()
      and visibility in ('pending', 'private')
    )
    or (
      public.is_founder()
      and visibility = 'public'
    )
  );

-- Update: founder can approve/make public; (optional) author can edit own pending/private body
drop policy if exists "comments_update_founder" on public.comments;
create policy "comments_update_founder" on public.comments
  for update
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

-- Delete: author can delete own pending/private; founder can delete any
drop policy if exists "comments_delete_rules" on public.comments;
create policy "comments_delete_rules" on public.comments
  for delete
  to authenticated
  using (
    public.is_founder()
    or (
      author_id = auth.uid()
      and visibility in ('pending', 'private')
    )
  );
