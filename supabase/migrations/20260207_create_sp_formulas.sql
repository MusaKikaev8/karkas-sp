-- Create sp_formulas table for linking formulas to SP clauses
create table if not exists sp_formulas (
  id uuid primary key default gen_random_uuid(),
  sp_code text not null,
  clause_id text not null,
  block_id text not null,
  formula_number text not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create unique index to prevent duplicate formula numbers per clause
create unique index if not exists sp_formulas_unique 
  on sp_formulas(sp_code, clause_id, formula_number);

-- Create index for efficient clause lookup
create index if not exists sp_formulas_clause_idx 
  on sp_formulas(sp_code, clause_id);

-- Create index for block_id lookup
create index if not exists sp_formulas_block_idx 
  on sp_formulas(block_id);

-- Enable RLS
alter table sp_formulas enable row level security;

-- Policy: Anyone can read formulas
create policy "sp_formulas are viewable by everyone"
  on sp_formulas for select
  using (true);

-- Policy: Only founders can insert formulas
create policy "sp_formulas are insertable by founders"
  on sp_formulas for insert
  with check (is_founder());

-- Policy: Only founders can update formulas
create policy "sp_formulas are updatable by founders"
  on sp_formulas for update
  using (is_founder());

-- Policy: Only founders can delete formulas
create policy "sp_formulas are deletable by founders"
  on sp_formulas for delete
  using (is_founder());

-- Add trigger for updated_at
create or replace function update_sp_formulas_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sp_formulas_updated_at
  before update on sp_formulas
  for each row
  execute function update_sp_formulas_updated_at();
