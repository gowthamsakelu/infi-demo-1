<?php

use App\Http\Controllers\Pages\TransportController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/transport', [TransportController::class, 'index'])->middleware(Permissions::can('travel', 'view'));
Route::patch('/transport/{vehicleType}', [TransportController::class, 'update'])->where('vehicleType', '[A-Za-z0-9_-]+')->middleware(Permissions::can('travel', 'edit'));
Route::post('/transport', [TransportController::class, 'store'])->middleware(Permissions::can('travel', 'edit'));
Route::put('/transport/{vehicleType}', [TransportController::class, 'save'])->middleware(Permissions::can('travel', 'edit'));
