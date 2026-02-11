-- Restrict SP write access to founders only.

alter table public.sp_documents enable row level security;
alter table public.sp_clauses enable row level security;
alter table public.sp_clause_calculators enable row level security;

-- Public read

drop policy if exists "Anyone can read sp_documents" on public.sp_documents;
create policy "Anyone can read sp_documents"
  on public.sp_documents for select
  using (true);

drop policy if exists "Anyone can read sp_clauses" on public.sp_clauses;
create policy "Anyone can read sp_clauses"
  on public.sp_clauses for select
  using (true);

drop policy if exists "Anyone can read sp_clause_calculators" on public.sp_clause_calculators;
create policy "Anyone can read sp_clause_calculators"
  on public.sp_clause_calculators for select
  using (true);

-- Founder-only write

drop policy if exists "Authenticated users can insert sp_documents" on public.sp_documents;
drop policy if exists "Authenticated users can update sp_documents" on public.sp_documents;
drop policy if exists "Authenticated users can delete sp_documents" on public.sp_documents;

create policy "Founder can insert sp_documents"
  on public.sp_documents for insert
  to authenticated
  with check (public.is_founder());

create policy "Founder can update sp_documents"
  on public.sp_documents for update
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

create policy "Founder can delete sp_documents"
  on public.sp_documents for delete
  to authenticated
  using (public.is_founder());

create policy "Founder can insert sp_clauses"
  on public.sp_clauses for insert
  to authenticated
  with check (public.is_founder());

create policy "Founder can update sp_clauses"
  on public.sp_clauses for update
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

create policy "Founder can delete sp_clauses"
  on public.sp_clauses for delete
  to authenticated
  using (public.is_founder());

create policy "Founder can insert sp_clause_calculators"
  on public.sp_clause_calculators for insert
  to authenticated
  with check (public.is_founder());

create policy "Founder can update sp_clause_calculators"
  on public.sp_clause_calculators for update
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

create policy "Founder can delete sp_clause_calculators"
  on public.sp_clause_calculators for delete
  to authenticated
  using (public.is_founder());
