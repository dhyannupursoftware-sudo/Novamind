#!/bin/sh
set -e

# Render provides the PORT environment variable dynamically (defaults to 8080)
export PORT="${PORT:-8080}"

echo "=================================================="
echo " Starting NovaMind Backend Service"
echo "=================================================="

echo "Configuring Nginx to listen on port ${PORT}..."
sed -i "s/\${PORT}/${PORT}/g" /etc/nginx/sites-available/default

# Ensure storage & bootstrap/cache permissions and structure
echo "Preparing storage and bootstrap directories..."
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Ensure storage symlink exists
echo "Ensuring public storage symlink..."
php artisan storage:link --force || true

# Clear cached configuration before checking DB & running migrations
echo "Clearing application cache..."
php artisan config:clear || true
php artisan cache:clear || true

# Wait for MySQL database connection before executing migrations
echo "Verifying MySQL database connection..."
MAX_TRIES=30
TRY_COUNT=0
DB_READY=0

while [ $TRY_COUNT -lt $MAX_TRIES ]; do
    TRY_COUNT=$((TRY_COUNT + 1))
    if php -r "
        require __DIR__ . '/vendor/autoload.php';
        \$app = require_once __DIR__ . '/bootstrap/app.php';
        \$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
        \$kernel->bootstrap();
        try {
            Illuminate\Support\Facades\DB::connection()->getPdo();
            echo 'SUCCESS' . PHP_EOL;
            exit(0);
        } catch (\Throwable \$e) {
            echo \$e->getMessage() . PHP_EOL;
            exit(1);
        }
    " > /tmp/db_status.txt 2>&1; then
        DB_READY=1
        echo "Successfully connected to MySQL database!"
        break
    else
        echo "Database not ready yet (attempt $TRY_COUNT/$MAX_TRIES)..."
        cat /tmp/db_status.txt 2>/dev/null || true
        sleep 2
    fi
done

if [ $DB_READY -eq 1 ]; then
    echo "Running database migrations automatically..."
    if php artisan migrate --force --no-interaction; then
        echo "Database migrations executed successfully!"
    else
        echo "WARNING: php artisan migrate --force encountered an error!"
        cat /tmp/db_status.txt 2>/dev/null || true
    fi
else
    echo "ERROR: Unable to connect to MySQL database after $MAX_TRIES attempts."
    cat /tmp/db_status.txt 2>/dev/null || true
fi

# Cache Laravel optimization files for production performance
echo "Caching Laravel configuration, routes, and views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
php artisan event:cache || true

echo "Starting Nginx and PHP-FPM via Supervisord on port ${PORT}..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
