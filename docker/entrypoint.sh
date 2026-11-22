#!/usr/bin/env bash
set -e

echo "============================================================"
echo "==> Starting INFINITY CRM on Render (PHP-FPM + Nginx)"
echo "============================================================"

# 1. Dynamically configure Nginx listening port from Render's $PORT (default: 10000 or 80)
PORT="${PORT:-10000}"
echo "==> Setting Nginx port to: ${PORT}"
sed -i "s/PORT_PLACEHOLDER/${PORT}/g" /etc/nginx/conf.d/default.conf

# 2. Ensure storage and bootstrap/cache directories exist
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

# 3. Handle SQLite database and persistent disk support (/var/data)
DB_CONNECTION="${DB_CONNECTION:-sqlite}"
if [ "$DB_CONNECTION" = "sqlite" ]; then
    DB_PATH="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    DB_DIR=$(dirname "$DB_PATH")
    echo "==> Configuring SQLite database at: ${DB_PATH}"

    mkdir -p "$DB_DIR"
    IS_NEW_DB=0

    if [ ! -f "$DB_PATH" ]; then
        # If deploying with Render Persistent Disk at /var/data and a seed DB exists in project, copy it
        if [ "$DB_PATH" != "/var/www/html/database/database.sqlite" ] && [ -f "/var/www/html/database/database.sqlite" ]; then
            echo "==> Seeding persistent disk database from application image..."
            cp /var/www/html/database/database.sqlite "$DB_PATH"
        else
            echo "==> Initializing empty SQLite database file..."
            touch "$DB_PATH"
            IS_NEW_DB=1
        fi
    fi

    chown -R www-data:www-data "$DB_DIR" 2>/dev/null || true
    chmod -R 775 "$DB_DIR" 2>/dev/null || true
    chmod 664 "$DB_PATH" 2>/dev/null || true
fi

# 4. Set directory ownership and write permissions for www-data
echo "==> Ensuring write permissions for storage and cache..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# 5. Check APP_KEY; generate runtime key if not provided
if [ -z "$APP_KEY" ]; then
    echo "==> Notice: APP_KEY not provided in environment. Generating fallback runtime key..."
    export APP_KEY=$(php artisan key:generate --show)
fi

# 6. Safe, non-destructive database migrations
echo "==> Running database migrations (non-destructive)..."
php artisan migrate --force --isolated || php artisan migrate --force

# Run seeders only on fresh database setup to preserve existing user records
if [ "$IS_NEW_DB" -eq 1 ]; then
    echo "==> Fresh database detected. Seeding initial records..."
    php artisan db:seed --force || echo "==> Notice: Seeder finished with notices."
fi

# 7. Create storage symlink
php artisan storage:link --force 2>/dev/null || true

# 8. Optimize Laravel configurations, routes, and views for production
echo "==> Caching configuration, routes, and views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# 9. Test Nginx configuration before starting
echo "==> Testing Nginx configuration..."
nginx -t

# 10. Start Supervisord to run and monitor PHP-FPM and Nginx
echo "==> Initialization complete. Starting Supervisord (PHP-FPM + Nginx)..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
