<?php

use App\Http\Controllers\Pages\StayController;
use Illuminate\Support\Facades\Route;

Route::get('/stays', [StayController::class, 'index']);
Route::get('/stays/{stay}', [StayController::class, 'show'])->whereNumber('stay');
