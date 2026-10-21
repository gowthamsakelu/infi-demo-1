# Multi-stage Dockerfile for Laravel 12 on Render
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

# Stage 2: Final Production Apache Image
FROM php:8.2-apache

LABEL maintainer="Ruyi Admin Team"
WORKDIR /var/www/html

# Install system dependencies & PHP extension development headers
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libsqlite3-dev \
    libpq-dev \
    libicu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_sqlite \
        pdo_mysql \
        pdo_pgsql \
        zip \
        bcmath \
        opcache \
        gd \
        intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache rewrite module
RUN a2enmod rewrite headers

# Configure Apache virtual host
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Install Composer binary from official composer image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy vendor dependencies from stage 1
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copy application source code from backend directory
COPY backend/ /var/www/html/

# Copy startup script and make executable
COPY docker/start.sh /var/www/html/docker/start.sh
RUN chmod +x /var/www/html/docker/start.sh

# Ensure autoload dump and package discovery
RUN composer dump-autoload --optimize --no-dev

# Default environment variables
ENV PORT=80 \
    APACHE_DOCUMENT_ROOT=/var/www/html/public \
    APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr

# Expose Render standard ports (dynamic $PORT, typically 10000)
EXPOSE 80 10000

# Execute start.sh on container launch
CMD ["/var/www/html/docker/start.sh"]
