#!/usr/bin/env bash
set -e

echo "==> Starting Ruyi Admin Container on Render..."

# 1. Dynamically configure Apache port from Render's $PORT (default: 80 or 10000)
PORT="${PORT:-80}"
echo "==> Configuring Apache to listen on port: ${PORT}"
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf 2>/dev/null || true
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/000-default.conf 2>/dev/null || true

# 2. Ensure all required storage and database directories exist
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache \
         /var/www/html/database

# 3. Handle SQLite Database initialization if using SQLite
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    DB_PATH="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    echo "==> Ensuring SQLite database exists at: ${DB_PATH}"
    if [ ! -f "$DB_PATH" ]; then
        touch "$DB_PATH"
        echo "==> Created empty SQLite database file: ${DB_PATH}"
    fi
    chown www-data:www-data "$DB_PATH" 2>/dev/null || true
    chmod 666 "$DB_PATH" 2>/dev/null || true
fi

# 4. Set directory ownership and write permissions for Apache (www-data)
echo "==> Setting directory permissions for storage, cache, and database..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database 2>/dev/null || true
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database 2>/dev/null || true

# 5. Check APP_KEY; generate one automatically if missing
if [ -z "$APP_KEY" ]; then
    echo "==> Notice: APP_KEY not set. Generating runtime application key..."
    export APP_KEY=$(php artisan key:generate --show)
fi

# 6. Run Database Migrations and Seeders
echo "==> Running database migrations..."
php artisan migrate --force --isolated || php artisan migrate --force

echo "==> Running database seeders..."
php artisan db:seed --force || echo "==> Seeding skipped or already populated"

# 7. Create storage symlink
php artisan storage:link --force 2>/dev/null || true

# 8. Optimize Laravel configurations, routes, and views for production
echo "==> Caching configuration, routes, and views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# 9. Start Apache web server in foreground
echo "==> Initialization complete. Launching Apache..."
exec apache2-foreground
