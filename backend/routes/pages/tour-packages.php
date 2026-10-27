<?php

use App\Http\Controllers\Pages\TourPackageController;
use Illuminate\Support\Facades\Route;

Route::get('/tour-packages', [TourPackageController::class, 'index']);
Route::get('/tour-packages/{tourPackage}', [TourPackageController::class, 'show'])->whereNumber('tourPackage');
