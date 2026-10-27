<?php

use App\Http\Controllers\Pages\TransportController;
use Illuminate\Support\Facades\Route;

Route::get('/transport', [TransportController::class, 'index']);
Route::patch('/transport/{vehicleType}', [TransportController::class, 'update'])->whereNumber('vehicleType');
