-- Add sample hierarchical clauses for СП20
-- This is test data for demonstrating the tree structure

-- First, ensure СП20 document exists
insert into sp_documents (code, title, year, status)
values ('СП20', 'СП 20.13330.2016 "Нагрузки и воздействия"', 2016, 'действует')
on conflict (code) do nothing;

-- Add root clauses (top-level sections)
insert into sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
values 
  ('СП20', '1', '1. Общие сведения', null, '# 1. Общие сведения\nОсновные положения и требования к определению нагрузок.'),
  ('СП20', '2', '2. Нагрузки и воздействия', null, '# 2. Нагрузки и воздействия\nКлассификация и виды нагрузок.'),
  ('СП20', '3', '3. Постоянные нагрузки', null, '# 3. Постоянные нагрузки\nОпределение и расчет постоянных нагрузок.'),
  ('СП20', '4', '4. Временные нагрузки', null, '# 4. Временные нагрузки\nТекущее сечение и частные нагрузки.')
on conflict (sp_code, clause_id) do nothing;

-- Add subsections under clause 1
insert into sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
select 
  'СП20', '1.1', '1.1. Область применения', 
  (select id from sp_clauses_tree where sp_code = 'СП20' and clause_id = '1' limit 1),
  '## 1.1. Область применения\nНастоящий стандарт применяется при проектировании зданий и сооружений.'
union all
select 
  'СП20', '1.2', '1.2. Нормативные ссылки', 
  (select id from sp_clauses_tree where sp_code = 'СП20' and clause_id = '1' limit 1),
  '## 1.2. Нормативные ссылки\nОсновные нормативные документы в области строительства.'
on conflict (sp_code, clause_id) do nothing;

-- Add deep nested sections (3 levels)
insert into sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
select 
  'СП20', '2.1', '2.1. Классификация нагрузок', 
  (select id from sp_clauses_tree where sp_code = 'СП20' and clause_id = '2' limit 1),
  '## 2.1. Классификация нагрузок\nПостоянные, временные, особые нагрузки.'
union all
select 
  'СП20', '2.1.1', '2.1.1. Постоянные нагрузки', 
  (select id from sp_clauses_tree where sp_code = 'СП20' and clause_id = '2.1' limit 1),
  '### 2.1.1. Постоянные нагрузки\nВес конструкций и элементов здания.'
union all
select 
  'СП20', '2.1.1.1', '2.1.1.1. Вес стен', 
  (select id from sp_clauses_tree where sp_code = 'СП20' and clause_id = '2.1.1' limit 1),
  '#### 2.1.1.1. Вес стен\nОпределение массы стеновых конструкций по материалам.'
union all
select 
  'СП20', '2.1.2', '2.1.2. Временные нагрузки', 
  (select id from sp_clauses_tree where sp_code = 'СП20' and clause_id = '2.1' limit 1),
  '### 2.1.2. Временные нагрузки\nГрузы в производстве и эксплуатации.'
on conflict (sp_code, clause_id) do nothing;

-- Add more sections for sections 3 and 4
insert into sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
select 
  'СП20', '3.1', '3.1. Определение постоянных нагрузок', 
  (select id from sp_clauses_tree where sp_code = 'СП20' and clause_id = '3' limit 1),
  '## 3.1. Определение постоянных нагрузок\nПорядок расчета постоянных нагрузок.'
union all
select 
  'СП20', '4.1', '4.1. Временные нагрузки', 
  (select id from sp_clauses_tree where sp_code = 'СП20' and clause_id = '4' limit 1),
  '## 4.1. Временные нагрузки\nВремя действия и характер изменения.'
on conflict (sp_code, clause_id) do nothing;
