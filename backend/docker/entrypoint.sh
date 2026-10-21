#!/usr/bin/env bash
set -e

echo "==> Starting Ruyi Admin Container Initialization..."

# 1. Configure Port for Render (dynamic $PORT, defaults to 80 or 10000)
PORT="${PORT:-80}"
echo "==> Configuring Apache to listen on port: ${PORT}"
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf 2>/dev/null || true
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/000-default.conf 2>/dev/null || true

# 2. Ensure all required Laravel storage & database folders exist
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache \
         /var/www/html/database

# 3. Handle SQLite Database initialization if DB_CONNECTION is sqlite
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    DB_PATH="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    echo "==> Ensuring SQLite database exists at: ${DB_PATH}"
    if [ ! -f "$DB_PATH" ]; then
        touch "$DB_PATH"
        echo "==> Created SQLite file: ${DB_PATH}"
    fi
    chown www-data:www-data "$DB_PATH" 2>/dev/null || true
    chmod 664 "$DB_PATH" 2>/dev/null || true
fi

# 4. Set directory ownership and permissions for Apache
echo "==> Setting directory permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database 2>/dev/null || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database 2>/dev/null || true

# 5. Check APP_KEY; generate one if missing
if [ -z "$APP_KEY" ]; then
    echo "==> Notice: APP_KEY not provided. Generating runtime application key..."
    export APP_KEY=$(php artisan key:generate --show)
fi

# 6. Run Database Migrations and Seeders
echo "==> Running migrations and database seeders..."
php artisan migrate --force --isolated || php artisan migrate --force
php artisan db:seed --force || echo "==> Seeding completed or skipped"

# 7. Create storage symlink
php artisan storage:link --force 2>/dev/null || true

# 8. Optimize Laravel caching for production
echo "==> Optimizing configurations, routes, and views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "==> Initialization complete. Launching Apache..."
exec apache2-foreground
