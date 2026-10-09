# Salary Tracker (Веб-трекер денег)

Современное веб-приложение для учёта доходов, расходов и финансовой аналитики.

## Стек технологий

- **Frontend**: React 19, Vite, Recharts, CSS Modules
- **Backend**: Node.js, Express, JWT авторизация, Serverless Functions
- **База данных**: [Turso](https://turso.tech) (libSQL / SQLite в облаке)
- **Хостинг и CI/CD**: [Vercel](https://vercel.com) с автоматическим деплоем из GitHub

## Быстрый запуск локально

1. Установите зависимости:
   ```bash
   npm run build:client
   npm install
   ```

2. Настройте файл окружения `.env` (см. `.env.example`):
   ```env
   TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   TURSO_AUTH_TOKEN=your-turso-auth-token
   JWT_SECRET=your-secret-key
   ```

3. Запустите проект:
   ```bash
   npm run dev:server   # Бэкенд на порту 3001
   npm run dev:client   # Фронтенд на порту 5173
   ```

## Автоматический деплой

Проект подключён к Vercel. При каждом `git push origin main` Vercel автоматически собирает клиентскую и серверную части и развёртывает обновления.
