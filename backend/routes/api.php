<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;

Route::prefix('bookings')->group(function () {
    Route::get('/', [BookingController::class, 'index']);
    Route::get('/{id}', [BookingController::class, 'show']);
    Route::post('/{id}/guests', [BookingController::class, 'addGuest']);
    Route::put('/{id}/special-requirements', [BookingController::class, 'updateSpecialRequirements']);
});

Route::get('/metadata', [BookingController::class, 'metadata']);
