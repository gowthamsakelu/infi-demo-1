<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\BookingsManager;

Route::get('/', function () {
    return response()->file(public_path('index.html'));
})->name('home');

Route::get('/livewire', BookingsManager::class)->name('bookings.livewire');

