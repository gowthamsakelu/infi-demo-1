<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\BookingsManager;

Route::get('/', BookingsManager::class)->name('bookings');
