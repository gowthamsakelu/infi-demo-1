<?php

use App\Http\Controllers\Pages\TourPackageController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/tour-packages', [TourPackageController::class, 'index'])->middleware(Permissions::can('catalog', 'view'));
Route::get('/tour-packages/{tourPackage}', [TourPackageController::class, 'show'])->whereNumber('tourPackage')->middleware(Permissions::can('catalog', 'view'));
