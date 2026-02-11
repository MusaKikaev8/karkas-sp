# ✅ Система формул готова к применению!

## Что было сделано

### 1. Backend
- ✅ [API /api/formulas/compute](app/api/formulas/compute/route.ts) - серверные расчёты формул
- ✅ [API /api/sp/[code]/formulas](app/api/sp/[code]/formulas/route.ts) - CRUD операции с формулами
- ✅ [FormulaBlockView](components/FormulaBlockView.tsx) - интерактивный виджет с расчётами

### 2. Admin панель
- ✅ [FormulaManager](components/admin/FormulaManager.tsx) - управление формулами в пунктах СП
- ✅ Интегрирован в [/admin/sp/[code]](app/admin/sp/[code]/page.tsx) для пунктов и подпунктов

### 3. Public view
- ✅ [SpClauseView](components/SpClauseView.tsx) загружает формулы из БД
- ✅ Отображает формулы с номерами (например, "5.2-1")
- ✅ Интерактивные расчёты через FormulaBlockView

### 4. Database
- ✅ [SQL миграция](supabase/migrations/0004_sp_formulas.sql) готова
- ⏳ **ТРЕБУЕТСЯ ПРИМЕНИТЬ МИГРАЦИЮ** (см. ниже)

## 🚀 Следующий шаг: Применить миграцию

### Способ 1: Supabase Dashboard (рекомендуется)

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Скопируйте содержимое [0004_sp_formulas.sql](supabase/migrations/0004_sp_formulas.sql)
5. Вставьте и нажмите **Run**

### Способ 2: DATABASE_URL (если есть прямое подключение)

1. Добавьте в `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
   ```
2. Запустите:
   ```bash
   node scripts/run-migration.mjs
   ```

## После применения миграции

### Тестирование
```bash
node scripts/test-formulas-api.mjs
```

### Использование

**Admin** (нужна роль founder):
1. Откройте `/admin/sp/СП296.1325800.2017` (замените на ваш СП)
2. Найдите нужный пункт
3. Используйте **FormulaManager** для добавления формул:
   - Номер: например "5.2-1"
   - Блок: выберите из списка (steel-stress, geometry, unit-conversions)
   - Заголовок: опционально, переопределяет стандартный

**Public**:
4. Откройте `/sp/СП296.1325800.2017?clause=5.2`
5. Формулы отобразятся с интерактивными полями для расчёта

## Архитектура

```
┌─────────────────────────────────────────────────────────┐
│  Component: SpClauseView / FormulaManager               │
│  ↓ fetch                                                 │
│  API: /api/sp/[code]/formulas                           │
│  ↓ load from DB                                          │
│  Table: sp_formulas                                      │
│  • sp_code, clause_id, formula_number                   │
│  • block_id (ссылка на FORMULA_REGISTRY)                │
│  • title (опциональный кастомный заголовок)             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Component: FormulaBlockView                            │
│  ↓ onChange (debounced 250ms)                           │
│  API: /api/formulas/compute                             │
│  ↓ calculate                                             │
│  Registry: FORMULA_REGISTRY[block_id].calculate()       │
└─────────────────────────────────────────────────────────┘
```

## Доступные формулы (FORMULA_REGISTRY)

Текущие блоки в [lib/formulas/registry.ts](lib/formulas/registry.ts):
- `steel-stress` - Расчёт напряжений в стали
- `geometry` - Геометрические расчёты (площадь, момент инерции)
- `unit-conversions` - Конвертация единиц измерения

## Следующие функции (в планах)

- [ ] `sp_tables` - таблицы нормативных данных
- [ ] Внутренний поиск по СП
- [ ] Cross-reference links между пунктами (автолинки "см. п. 5.2")
- [ ] Расширенные формулы для конкретных СП
