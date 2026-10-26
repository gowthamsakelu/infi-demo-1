<?php

namespace App\Providers;

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
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Every Places search is a billed Google call, so each visitor gets a small allowance (there is no login to key it on yet).
        RateLimiter::for('places', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));
    }
}
