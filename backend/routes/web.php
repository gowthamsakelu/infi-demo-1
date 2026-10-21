<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\BookingsManager;

Route::get('/', function () {
    return response()->file(public_path('index.html'));
})->name('home');

Route::get('/livewire', BookingsManager::class)->name('bookings.livewire');


// "Enquiries" was renamed to "Inquiries": keep old URLs working.
Route::redirect('/enquiries', '/inquiries', 301);
Route::redirect('/enquiries/{any}', '/inquiries', 301)->where('any', '.*');
Route::get('/inquiries', fn () => redirect('/#inquiries'))->name('inquiries');
