<?php

use App\Http\Controllers\Pages\DestinationController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/destinations', [DestinationController::class, 'index'])->middleware(Permissions::can('catalog', 'view'));
Route::get('/destinations/{destination}', [DestinationController::class, 'show'])->whereNumber('destination')->middleware(Permissions::can('catalog', 'view'));
