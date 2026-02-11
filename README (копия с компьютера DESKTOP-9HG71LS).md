This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# Windows (если блокируются *.ps1):
npm.cmd run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Supabase setup (Auth + Postgres + RLS)

1) Create `.env.local` (copy from `.env.local.example`) and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; do NOT expose)

`FOUNDER_USER_ID/FOUNDER_EMAIL` are optional and are not used for RLS (founder role is controlled in DB).

2) Create DB schema + RLS

SQL миграции лежат в папке `supabase/migrations/`:

- `0001_schema.sql` (таблицы + функции)
- `0002_rls.sql` (RLS policies)

Примените их в Supabase Dashboard → SQL Editor (можно просто выполнить по очереди).

3) Mark founder user in DB

Так как Postgres/RLS не видит переменные окружения Next.js, роль founder определяется через таблицу `app_founders`.

- Сначала зарегистрируйтесь (Supabase Auth), найдите свой `user_id` в Supabase Dashboard → Authentication → Users.
- Затем добавьте себя в founders через SQL Editor:

```sql
insert into public.app_founders(user_id)
values ('00000000-0000-0000-0000-000000000000');
```

После этого `public.is_founder()` начнёт возвращать `true` для этого пользователя.

4) Auth pages

В приложении уже есть страницы:

- `/auth/sign-up`
- `/auth/sign-in`
- `/dashboard`

Если включено подтверждение email в Supabase Auth, после регистрации может понадобиться подтвердить почту.

## SP16 clause IDs (exact list)

Автоматическое извлечение пунктов из PDF — эвристика и может давать лишние пункты.
Чтобы зафиксировать точный список пунктов «как в СП», используйте файл:

- `scripts/sp16-ids.override.txt`

Если в нём есть хотя бы один ID, команда `npm run extract:sp16` будет брать пункты только из этого файла.

4) Windows note (Turbopack)

Если вы видите ошибку про слишком длинный путь (path length exceeds max length), dev уже переведён на Webpack (`next dev --webpack`) в `package.json`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
