# Social Network

A full-stack social feed application with posts, comments, replies, and likes.

## Stack

- **Backend:** Laravel 12 (PHP 8.2+), JWT auth via `tymon/jwt-auth`, queued image processing via `intervention/image`
- **Frontend:** React 19 + Vite, React Router, React Query, Axios
- **Database:** SQLite by default (configurable to MySQL)
- **Queue/Cache:** Database driver by default (Redis supported via Predis)

## Features

- Email/password registration and login (JWT)
- Create posts with optional image upload (resized asynchronously via a queue job, with `image_status` tracking: `processing` / `ready` / `failed`)
- Comments and threaded replies on posts
- Likes on posts and comments (polymorphic), with a "who liked this" modal
- Visibility-aware feed (paginated, optimized with `withCount`/`withExists`)
- Dark mode toggle

## Project Structure

```
backend/    Laravel API (app/, routes/api.php, database/)
frontend/   React + Vite SPA (src/pages, src/components, src/api)
```

## Getting Started

### Backend (`backend/`)

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve
```

In a separate terminal, run the queue worker (required for image processing):

```bash
php artisan queue:listen
```

### Frontend (`frontend/`)

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/storage` to `http://localhost:8000`, so the backend must be running on that port.

## Running Tests

```bash
cd backend
php artisan test
```
