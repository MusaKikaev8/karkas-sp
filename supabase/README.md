# Настройка базы данных для СП

## Шаги для настройки Supabase

1. **Откройте SQL Editor в Supabase Dashboard**
   - Перейдите на https://supabase.com/dashboard
   - Выберите ваш проект
   - Откройте раздел "SQL Editor"

2. **Выполните миграцию**
   - Скопируйте содержимое файла `supabase/migrations/001_create_sp_tables.sql`
   - Вставьте в SQL Editor
   - Нажмите "Run"

3. **Проверьте таблицы**
   - Перейдите в раздел "Table Editor"
   - Должны появиться таблицы: `sp_documents`, `sp_clauses`, `sp_clause_calculators`

4. **Добавьте переменные окружения**
   Создайте файл `.env.local` в корне проекта:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Структура таблиц

### sp_documents
- `id` - UUID (primary key)
- `code` - код СП (уникальный)
- `title` - название
- `year` - год
- `status` - статус (действует/проект/утратил силу)
- `source_url` - ссылка на источник
- `created_at`, `updated_at` - временные метки

### sp_clauses
- `id` - UUID (primary key)
- `sp_code` - код СП (foreign key)
- `clause_id` - номер пункта (например, "5.2")
- `title` - название пункта
- `summary` - описание

### sp_clause_calculators
- Связь между пунктами СП и калькуляторами
