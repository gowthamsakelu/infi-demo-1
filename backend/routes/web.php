<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PageController;
use App\Livewire\BookingsManager;

// Render and Docker Health Check Endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'build' => 'v2-no-port-leak',
        'app' => config('app.name', 'INFINITY'),
        'timestamp' => now()->toIso8601String(),
    ], 200);
});

// One-click Demo & View links for company owners and clients (instant sign-in without credentials)
Route::match(['get', 'post'], '/demo', [AuthController::class, 'demo'])->name('demo.auto');
Route::match(['get', 'post'], '/view', [AuthController::class, 'demo'])->name('view.auto');

// Sign in. The app itself (the shell below) needs a signed-in user; its JSON API is unchanged for now.
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login.attempt');
    Route::match(['get', 'post'], '/login/demo', [AuthController::class, 'demo'])->middleware('throttle:10,1')->name('login.demo');
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', [PageController::class, 'home'])->name('home');
    Route::get('/livewire', BookingsManager::class)->name('bookings.livewire');
});


// 4 main pages URL aliases and redirects
Route::redirect('/dashboard', '/#dashboard')->name('dashboard');
Route::redirect('/enquiries', '/#inquiries', 301);
Route::redirect('/enquiries/{any}', '/#inquiries', 301)->where('any', '.*');
Route::redirect('/inquiries', '/#inquiries')->name('inquiries');
Route::redirect('/customers', '/#customers')->name('customers');
Route::redirect('/quotation', '/#quotation')->name('quotation');
Route::redirect('/quotations', '/#quotation', 301);
Route::redirect('/bookings', '/#quotation', 301);
Route::redirect('/calendar', '/#dashboard')->name('calendar.index');
