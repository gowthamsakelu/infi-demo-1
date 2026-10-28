<?php

use App\Http\Controllers\Pages\AdventureController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/adventures', [AdventureController::class, 'index'])->middleware(Permissions::can('travel', 'view'));
Route::post('/adventures', [AdventureController::class, 'store'])->middleware(Permissions::can('travel', 'edit'));
Route::put('/adventures/{activity}', [AdventureController::class, 'save'])->middleware(Permissions::can('travel', 'edit'));
