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
        // Every Places search is a billed Google call, so each visitor gets a small allowance (there is no login to key it on yet).
        RateLimiter::for('places', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));

        // The module permission gate: ->middleware(Permissions::can('reports', 'view')) (see App\Support\Permissions).
        \App\Support\Permissions::registerGate();
    }
}
