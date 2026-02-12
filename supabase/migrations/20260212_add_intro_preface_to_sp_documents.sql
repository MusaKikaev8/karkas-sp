-- Add intro and preface fields to sp_documents table
alter table if exists sp_documents
  add column if not exists intro text,
  add column if not exists preface text;

-- Add comments for documentation
comment on column sp_documents.intro is 'Введение в нормативный документ';
comment on column sp_documents.preface is 'Предисловие к документу';
