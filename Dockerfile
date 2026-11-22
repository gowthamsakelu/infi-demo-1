# Multi-stage Production Dockerfile for Laravel 12 on Render (PHP-FPM + Nginx)
# Stage 1: Dependency resolution with Composer
FROM composer:2 AS vendor

WORKDIR /app

COPY backend/composer.json backend/composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# Stage 2: Final Production Image (PHP-FPM + Nginx + Supervisor)
FROM php:8.2-fpm-bookworm

LABEL maintainer="INFINITY Logistics Team"
WORKDIR /var/www/html

# Install Nginx, Supervisor, SQLite3, and required PHP extension dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    sqlite3 \
    git \
    curl \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libsqlite3-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_sqlite \
        zip \
        bcmath \
        opcache \
        gd \
        intl \
        mbstring \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer binary from official composer image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy vendor dependencies from stage 1
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copy application source code from backend
COPY backend/ /var/www/html/

# Synchronize frontend static assets into public directory
COPY frontend/ /var/www/html/public/

# Configure Nginx, PHP-FPM pool, and Supervisor
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/www.conf /usr/local/etc/php-fpm.d/zz-docker.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Remove default nginx site to avoid port conflicts
RUN rm -f /etc/nginx/sites-enabled/default

# Ensure storage, cache, and database directories exist with proper write permissions
RUN mkdir -p /var/www/html/storage/framework/cache/data \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache \
             /var/www/html/database \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# Ensure autoload dump and package discovery
RUN composer dump-autoload --optimize --no-dev \
    && chown -R www-data:www-data /var/www/html/bootstrap/cache /var/www/html/storage

# Default production environment variables
ENV PORT=10000 \
    APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/database/database.sqlite \
    SESSION_DRIVER=file \
    CACHE_STORE=file \
    QUEUE_CONNECTION=sync

# Expose Render standard ports (dynamic $PORT, typically 10000 or 80)
EXPOSE 80 10000

# Execute entrypoint.sh on container launch
ENTRYPOINT ["/entrypoint.sh"]
