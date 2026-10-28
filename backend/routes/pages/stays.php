<?php

use App\Http\Controllers\Pages\StayController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/stays', [StayController::class, 'index'])->middleware(Permissions::can('travel', 'view'));
Route::get('/stays/{stay}', [StayController::class, 'show'])->whereNumber('stay')->middleware(Permissions::can('travel', 'view'));
Route::post('/stays', [StayController::class, 'store'])->middleware(Permissions::can('travel', 'edit'));
Route::put('/stays/{stay}', [StayController::class, 'save'])->middleware(Permissions::can('travel', 'edit'));
