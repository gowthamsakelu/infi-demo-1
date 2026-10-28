<?php

use App\Http\Controllers\Pages\TourPackageController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/tour-packages', [TourPackageController::class, 'index'])->middleware(Permissions::can('catalog', 'view'));
Route::post('/tour-packages', [TourPackageController::class, 'store'])->middleware(Permissions::can('catalog', 'edit'));
Route::put('/tour-packages/{tourPackage}', [TourPackageController::class, 'update'])->middleware(Permissions::can('catalog', 'edit'));
Route::get('/tour-packages/{tourPackage}', [TourPackageController::class, 'show'])->whereNumber('tourPackage')->middleware(Permissions::can('catalog', 'view'));
