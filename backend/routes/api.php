<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\InquiryController;

Route::prefix('bookings')->group(function () {
    Route::post('/assign', [BookingController::class, 'assign']);
    Route::get('/', [BookingController::class, 'index']);
    Route::get('/{id}', [BookingController::class, 'show']);
    Route::patch('/{id}/payment', [BookingController::class, 'updatePayment']);
    Route::post('/{id}/guests', [BookingController::class, 'addGuest']);
    Route::put('/{id}/special-requirements', [BookingController::class, 'updateSpecialRequirements']);
});

Route::get('/metadata', [BookingController::class, 'metadata']);

Route::get('/inquiries', [InquiryController::class, 'index']);
Route::post('/inquiries/assign', [InquiryController::class, 'assign']);
Route::post('/inquiries/{inquiry}/follow-ups', [InquiryController::class, 'storeFollowUp']);
Route::post('/inquiries/{inquiry}/notes', [InquiryController::class, 'storeNote']);
Route::get('/follow-ups', [InquiryController::class, 'followUps']);
