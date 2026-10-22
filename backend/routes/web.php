<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;
use App\Livewire\BookingsManager;

Route::get('/', [PageController::class, 'home'])->name('home');

Route::get('/livewire', BookingsManager::class)->name('bookings.livewire');


// "Enquiries" was renamed to "Inquiries": keep old URLs working.
Route::redirect('/enquiries', '/inquiries', 301);
Route::redirect('/enquiries/{any}', '/inquiries', 301)->where('any', '.*');
Route::redirect('/inquiries', '/#inquiries')->name('inquiries');
