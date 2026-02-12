-- Rebuild СП20 clauses tree with proper hierarchy
-- Delete old data
DELETE FROM sp_clauses_tree WHERE sp_code = 'СП20';

-- Insert root clauses
INSERT INTO sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
VALUES 
  ('СП20', '1', '1. Общие сведения', null, '# 1. Общие сведения'),
  ('СП20', '2', '2. Нагрузки и воздействия', null, '# 2. Нагрузки и воздействия'),
  ('СП20', '3', '3. Постоянные нагрузки', null, '# 3. Постоянные нагрузки'),
  ('СП20', '4', '4. Временные нагрузки', null, '# 4. Временные нагрузки');

-- Get IDs of root clauses for reference
-- Note: You might need to fetch these after INSERT above

-- Insert level 2 clauses (under clause 1)
INSERT INTO sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
SELECT 
  'СП20', '1.1', '1.1. Область применения',
  (SELECT id FROM sp_clauses_tree WHERE sp_code = 'СП20' AND clause_id = '1' LIMIT 1),
  '## 1.1. Область применения'
UNION ALL
SELECT
  'СП20', '1.2', '1.2. Нормативные ссылки',
  (SELECT id FROM sp_clauses_tree WHERE sp_code = 'СП20' AND clause_id = '1' LIMIT 1),
  '## 1.2. Нормативные ссылки';

-- Insert level 2 clauses (under clause 2)
INSERT INTO sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
SELECT
  'СП20', '2.1', '2.1. Классификация нагрузок',
  (SELECT id FROM sp_clauses_tree WHERE sp_code = 'СП20' AND clause_id = '2' LIMIT 1),
  '## 2.1. Классификация нагрузок';

-- Insert level 3 clauses (under clause 2.1)
INSERT INTO sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
SELECT
  'СП20', '2.1.1', '2.1.1. Постоянные нагрузки',
  (SELECT id FROM sp_clauses_tree WHERE sp_code = 'СП20' AND clause_id = '2.1' LIMIT 1),
  '### 2.1.1. Постоянные нагрузки'
UNION ALL
SELECT
  'СП20', '2.1.2', '2.1.2. Временные нагрузки',
  (SELECT id FROM sp_clauses_tree WHERE sp_code = 'СП20' AND clause_id = '2.1' LIMIT 1),
  '### 2.1.2. Временные нагрузки';

-- Insert level 4 clauses (under clause 2.1.1)
INSERT INTO sp_clauses_tree (sp_code, clause_id, title, parent_id, content_md)
SELECT
  'СП20', '2.1.1.1', '2.1.1.1. Вес стен',
  (SELECT id FROM sp_clauses_tree WHERE sp_code = 'СП20' AND clause_id = '2.1.1' LIMIT 1),
  '#### 2.1.1.1. Вес стен';
