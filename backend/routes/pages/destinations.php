<?php

use App\Http\Controllers\Pages\DestinationController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/destinations', [DestinationController::class, 'index'])->middleware(Permissions::can('catalog', 'view'));
Route::get('/destinations/{destination}', [DestinationController::class, 'show'])->whereNumber('destination')->middleware(Permissions::can('catalog', 'view'));
Route::post('/destinations', [DestinationController::class, 'store'])->middleware(Permissions::can('catalog', 'edit'));
Route::put('/destinations/{destination}', [DestinationController::class, 'update'])->middleware(Permissions::can('catalog', 'edit'));
