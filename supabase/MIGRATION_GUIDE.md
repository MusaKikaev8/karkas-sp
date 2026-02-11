# Применение миграции для таблицы sp_formulas

## Быстрый способ (Через Supabase Dashboard)

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor** (левое меню)
4. Создайте новый запрос (New Query)
5. Скопируйте и вставьте содержимое файла `supabase/migrations/0004_sp_formulas.sql`
6. Нажмите **Run** (или F5)

## Что создаёт миграция

✅ **Таблица `sp_formulas`**
- Связывает формулы с пунктами СП
- Хранит номер формулы (например, "5.2-1")
- Позволяет переопределять заголовок формулы

✅ **RLS политики**
- Все могут читать формулы
- Только founders могут добавлять/редактировать/удалять

✅ **Индексы**
- Уникальный индекс на (sp_code, clause_id, formula_number)
- Индексы для быстрого поиска по пункту и блоку

✅ **Триггер**
- Автообновление поля `updated_at`

## После применения миграции

Формулы станут доступны:
- **Admin**: `/admin/sp/[code]` - управление формулами через FormulaManager
- **Public**: `/sp/[code]?clause=[id]` - просмотр формул с интерактивными расчётами

## Альтернатива (с DATABASE_URL)

Если у вас есть DATABASE_URL в `.env.local`:

```bash
node scripts/run-migration.mjs
```

DATABASE_URL можно получить в:
Supabase Dashboard → Settings → Database → Connection string (Session mode)
