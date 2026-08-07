#!/bin/sh
set -e

# Render provides the PORT environment variable dynamically (defaults to 8080)
export PORT="${PORT:-8080}"

echo "Configuring Nginx to listen on port ${PORT}..."
sed -i "s/\${PORT}/${PORT}/g" /etc/nginx/sites-available/default

# Ensure storage & bootstrap/cache permissions
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Run Laravel optimizations
echo "Running Laravel optimizations..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
php artisan event:cache || true

echo "Starting Nginx and PHP-FPM via Supervisord on port ${PORT}..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
