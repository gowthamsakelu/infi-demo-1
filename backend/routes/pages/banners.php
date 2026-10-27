<?php

use App\Http\Controllers\Pages\BannerController;
use Illuminate\Support\Facades\Route;

Route::get('/banners', [BannerController::class, 'index']);
Route::post('/banners/reorder', [BannerController::class, 'reorder']);
Route::patch('/banners/{banner}', [BannerController::class, 'update'])->whereNumber('banner');
