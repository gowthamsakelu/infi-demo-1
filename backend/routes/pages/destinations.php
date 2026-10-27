<?php

use App\Http\Controllers\Pages\DestinationController;
use Illuminate\Support\Facades\Route;

Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{destination}', [DestinationController::class, 'show'])->whereNumber('destination');
