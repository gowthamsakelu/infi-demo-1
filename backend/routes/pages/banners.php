<?php

use App\Http\Controllers\Pages\BannerController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/banners', [BannerController::class, 'index'])->middleware(Permissions::can('website', 'view'));
Route::post('/banners/reorder', [BannerController::class, 'reorder'])->middleware(Permissions::can('website', 'edit'));
Route::patch('/banners/{banner}', [BannerController::class, 'update'])->whereNumber('banner')->middleware(Permissions::can('website', 'edit'));
Route::post('/banners', [BannerController::class, 'store'])->middleware(Permissions::can('website', 'edit'));
Route::put('/banners/{banner}', [BannerController::class, 'save'])->middleware(Permissions::can('website', 'edit'));
