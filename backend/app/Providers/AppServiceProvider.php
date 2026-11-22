<?php

namespace App\Providers;

use App\Support\Places\DemoPlacesProvider;
use App\Support\Places\GooglePlacesProvider;
use App\Support\Places\PlacesProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // One provider for hotel and activity search, chosen by config at request time (not cached, so tests and .env changes apply).
        $this->app->bind(PlacesProvider::class, function () {
            $mode = config('services.places.provider', 'auto');
            $google = new GooglePlacesProvider;

            return match (true) {
                $mode === 'google' => $google,
                $mode === 'demo' => new DemoPlacesProvider,
                default => $google->configured() ? $google : new DemoPlacesProvider,
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production environments or when Render sets HTTPS
        if (config('app.env') === 'production' || request()->server('HTTP_X_FORWARDED_PROTO') === 'https' || str_starts_with((string) config('app.url', ''), 'https://')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Force clean root URL without internal container port (e.g. :10000)
        if (! $this->app->runningInConsole() && request()->getHost()) {
            \Illuminate\Support\Facades\URL::forceRootUrl('https://'.request()->getHost());
        } elseif ($appUrl = config('app.url')) {
            if (! str_contains($appUrl, 'localhost')) {
                \Illuminate\Support\Facades\URL::forceRootUrl(rtrim($appUrl, '/'));
            }
        }

        // Every Places search is a billed Google call, so each visitor gets a small allowance (there is no login to key it on yet).
        RateLimiter::for('places', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));

        // The module permission gate: ->middleware(Permissions::can('reports', 'view')) (see App\Support\Permissions).
        \App\Support\Permissions::registerGate();
    }
}
