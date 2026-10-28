<?php

use App\Http\Controllers\Pages\TransportController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/transport', [TransportController::class, 'index'])->middleware(Permissions::can('travel', 'view'));
Route::patch('/transport/{vehicleType}', [TransportController::class, 'update'])->whereNumber('vehicleType')->middleware(Permissions::can('travel', 'edit'));
