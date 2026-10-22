# Ruyi Admin – backend

Laravel 12 application that serves the admin UI and its JSON API.

See the [main README](../README.md) for setup, routes, API reference and project structure.

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```
