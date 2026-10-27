<?php

use App\Http\Controllers\Pages\UserController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

// The signed-in person's own access (any signed-in user): the shell uses it to hide sidebar pages they may not view.
Route::get('/me/permissions', [UserController::class, 'me']);

// Users & Permissions: the Users and Settings module (view to read, edit to change).
Route::get('/users', [UserController::class, 'index'])->middleware(Permissions::can('system', 'view'));
Route::get('/users/{user}', [UserController::class, 'show'])->whereNumber('user')->middleware(Permissions::can('system', 'view'));
Route::put('/users/{user}/permissions', [UserController::class, 'permissions'])->whereNumber('user')->middleware(Permissions::can('system', 'edit'));
Route::patch('/users/{user}/status', [UserController::class, 'status'])->whereNumber('user')->middleware(Permissions::can('system', 'edit'));
