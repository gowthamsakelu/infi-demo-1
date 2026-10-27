<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PageController;
use App\Livewire\BookingsManager;

// Sign in. The app itself (the shell below) needs a signed-in user; its JSON API is unchanged for now.
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login.attempt');
    Route::post('/login/demo', [AuthController::class, 'demo'])->middleware('throttle:10,1')->name('login.demo');
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', [PageController::class, 'home'])->name('home');
    Route::get('/livewire', BookingsManager::class)->name('bookings.livewire');
});


// "Enquiries" was renamed to "Inquiries": keep old URLs working.
Route::redirect('/enquiries', '/inquiries', 301);
Route::redirect('/enquiries/{any}', '/inquiries', 301)->where('any', '.*');
Route::redirect('/inquiries', '/#inquiries')->name('inquiries');
Route::redirect('/calendar', '/#calendar')->name('calendar.index');
