<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\ItineraryController;

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

Route::get('/{kind}/{id}/itinerary', [ItineraryController::class, 'show'])->whereIn('kind', ['bookings', 'inquiries']);
Route::put('/{kind}/{id}/itinerary', [ItineraryController::class, 'update'])->whereIn('kind', ['bookings', 'inquiries']);

Route::get('/calendar/events', [CalendarController::class, 'events']);
