<?php

use App\Http\Controllers\RaynaController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::prefix('rayna')->group(function () {
    Route::get('/status', [RaynaController::class, 'status']);
    Route::get('/demo-flow', [RaynaController::class, 'demoFlow'])->middleware(Permissions::can('travel', 'view'));
    Route::get('/countries', [RaynaController::class, 'countries'])->middleware(Permissions::can('travel', 'view'));
    Route::get('/cities', [RaynaController::class, 'cities'])->middleware(Permissions::can('travel', 'view'));
    Route::get('/tours', [RaynaController::class, 'tours'])->middleware(Permissions::can('travel', 'view'));
    Route::get('/tours/{tourId}', [RaynaController::class, 'tourDetails'])->middleware(Permissions::can('travel', 'view'));
    Route::get('/tours/{tourId}/options', [RaynaController::class, 'options'])->middleware(Permissions::can('travel', 'view'));
    Route::get('/tours/{tourId}/availability', [RaynaController::class, 'availability'])->middleware(Permissions::can('travel', 'view'));
    Route::post('/sync-adventures', [RaynaController::class, 'syncAdventures'])->middleware(Permissions::can('travel', 'edit'));
});

