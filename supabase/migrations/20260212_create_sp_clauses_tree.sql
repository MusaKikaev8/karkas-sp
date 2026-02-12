-- Create universal hierarchical clauses table
create table if not exists sp_clauses_tree (
  id uuid primary key default gen_random_uuid(),
  sp_code text not null,
  clause_id text not null,
  title text not null,
  parent_id uuid null references sp_clauses_tree(id) on delete cascade,
  content_md text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint sp_clauses_tree_unique unique(sp_code, clause_id)
);

-- Create indexes for efficient queries
create index if not exists sp_clauses_tree_sp_code_idx on sp_clauses_tree(sp_code);
create index if not exists sp_clauses_tree_parent_idx on sp_clauses_tree(parent_id);
create index if not exists sp_clauses_tree_clause_id_idx on sp_clauses_tree(clause_id);

-- Enable RLS
alter table sp_clauses_tree enable row level security;

-- Policy: Anyone can read clauses
create policy "sp_clauses_tree are viewable by everyone"
  on sp_clauses_tree for select
  using (true);

-- Policy: Only founders can insert
create policy "sp_clauses_tree are insertable by founders"
  on sp_clauses_tree for insert
  with check (is_founder());

-- Policy: Only founders can update
create policy "sp_clauses_tree are updatable by founders"
  on sp_clauses_tree for update
  using (is_founder());

-- Policy: Only founders can delete
create policy "sp_clauses_tree are deletable by founders"
  on sp_clauses_tree for delete
  using (is_founder());

-- Add trigger for updated_at
create or replace function update_sp_clauses_tree_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger sp_clauses_tree_updated_at
before update on sp_clauses_tree
for each row execute function update_sp_clauses_tree_updated_at();

-- Migrate data from sp_clauses to sp_clauses_tree
insert into sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
select sp_code, clause_id, title, null, null
from sp_clauses
on conflict (sp_code, clause_id) do nothing;

-- Migrate data from sp_subclauses to sp_clauses_tree
-- Find parent clause and link by parent_id
insert into sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
select 
  sc.sp_code,
  sc.subclause_id,
  sc.title,
  (select id from sp_clauses_tree where sp_code = sc.sp_code and clause_id = sc.parent_clause_id limit 1),
  null
from sp_subclauses sc
on conflict (sp_code, clause_id) do nothing;

-- Mark old tables as deprecated (keep for backward compatibility during transition)
comment on table sp_clauses is 'DEPRECATED: Use sp_clauses_tree instead';
comment on table sp_subclauses is 'DEPRECATED: Use sp_clauses_tree instead';
