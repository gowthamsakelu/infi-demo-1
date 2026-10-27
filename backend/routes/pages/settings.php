<?php

use App\Http\Controllers\Pages\SettingsController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

// Settings: the Users and Settings module (view to read, edit to change).
Route::get('/settings', [SettingsController::class, 'index'])->middleware(Permissions::can('system', 'view'));
Route::get('/settings/{section}', [SettingsController::class, 'show'])->middleware(Permissions::can('system', 'view'));
Route::put('/settings/{section}', [SettingsController::class, 'update'])->middleware(Permissions::can('system', 'edit'));
