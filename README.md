# NovaMind AI

Production-ready foundation for an AI chatbot SaaS using React TypeScript, Vite, Tailwind CSS, Laravel 12, MySQL, Sanctum, Axios, and React Router.

## Folder Structure

```text
NovaMind AI
├── backend/
│   └── back/
│       ├── app/
│       │   ├── Http/
│       │   │   ├── Controllers/Api/
│       │   │   ├── Requests/
│       │   │   └── Resources/
│       │   ├── Models/
│       │   └── Providers/
│       ├── config/
│       ├── database/
│       │   ├── factories/
│       │   ├── migrations/
│       │   └── seeders/
│       └── routes/
│           ├── api.php
│           └── web.php
└── frontend/
    └── front/
        ├── src/
        │   ├── components/
        │   ├── context/
        │   ├── layouts/
        │   ├── lib/
        │   ├── pages/
        │   ├── routes/
        │   └── types/
        ├── .env.example
        └── vite.config.ts
```

## Frontend Architecture

- `src/lib/api.ts`: Axios client with `VITE_API_URL` and bearer token handling.
- `src/context/AuthContext.tsx`: register, login, logout, forgot password, reset password, remember-me storage, and auth hydration.
- `src/routes/ProtectedRoute.tsx`: guards private routes.
- `src/pages`: login, register, forgot password, reset password, and dashboard.
- `src/components`: brand, form fields, and buttons.
- `src/index.css`: Tailwind CSS v4 import plus dark glassmorphism base styles.

## Backend Architecture

- `routes/api.php`: public auth routes plus `auth:sanctum` protected chat, message, and settings routes.
- `app/Http/Controllers/Api`: API controllers for auth, chats, messages, and settings.
- `app/Http/Requests`: request validation for auth and protected resources.
- `app/Http/Resources`: consistent JSON response shapes.
- `app/Models`: `User`, `Chat`, `Message`, and `Setting` relationships.
- `config/cors.php`: local React origin support.
- `app/Providers/AppServiceProvider.php`: password reset URLs point to the React reset page.

## Required Dependencies

Backend:

```bash
composer install
composer require "laravel/framework:^12.0" "laravel/sanctum:^4.0"
```

Frontend:

```bash
npm install
npm install axios react-router-dom lucide-react tailwindcss @tailwindcss/vite
```

## Environment Configuration



Frontend `frontend/front/.env`:

```env
VITE_APP_NAME="NovaMind AI"
VITE_API_URL=http://localhost:8000/api
```

## Installation Guide

1. Create the MySQL database:

```sql
CREATE DATABASE novamind_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Install and migrate the backend:

```bash
cd backend/back
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

3. Install and run the frontend:

```bash
cd frontend/front
npm install
copy .env.example .env
npm run dev
```

4. Open `http://localhost:5173`.

## Database Architecture

Users:

- `id`
- `name`
- `username`
- `email`
- `password`
- `avatar`
- `created_at`
- Laravel auth support: `email_verified_at`, `remember_token`, `updated_at`

Chats:

- `id`
- `user_id`
- `title`
- `pinned`
- `created_at`
- Laravel audit support: `updated_at`

Messages:

- `id`
- `chat_id`
- `role`
- `content`
- `created_at`
- Laravel audit support: `updated_at`

Settings:

- `id`
- `user_id`
- `theme`
- `language`
- `model`
- Laravel audit support: `created_at`, `updated_at`

Sanctum:

- `personal_access_tokens`

Relationships:

- User has many chats.
- User has one settings record.
- Chat belongs to user.
- Chat has many messages.
- Message belongs to chat.
- Setting belongs to user.

## API Routes

Public:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Protected:

- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/chats`
- `POST /api/chats`
- `GET /api/chats/{chat}`
- `PUT/PATCH /api/chats/{chat}`
- `DELETE /api/chats/{chat}`
- `POST /api/chats/{chat}/messages`
- `GET /api/settings`
- `PUT/PATCH /api/settings`
