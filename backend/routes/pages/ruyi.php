<?php

use App\Http\Controllers\RuyiController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

// The live Ruyi Travels website's lists. Read only: there is no add, save or delete route here.
Route::prefix('ruyi')->group(function () {
    Route::get('/status', [RuyiController::class, 'status']);
    Route::get('/hotels', [RuyiController::class, 'index'])->defaults('kind', 'hotels')->middleware(Permissions::can('travel', 'view'));
    Route::get('/activities', [RuyiController::class, 'index'])->defaults('kind', 'activities')->middleware(Permissions::can('travel', 'view'));
    Route::get('/transport', [RuyiController::class, 'index'])->defaults('kind', 'transport')->middleware(Permissions::can('travel', 'view'));
    Route::get('/packages', [RuyiController::class, 'index'])->defaults('kind', 'packages')->middleware(Permissions::can('catalog', 'view'));
    Route::get('/blogs', [RuyiController::class, 'index'])->defaults('kind', 'blogs')->middleware(Permissions::can('website', 'view'));
});