<?php

use App\Http\Controllers\Pages\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard/export', [DashboardController::class, 'export']);
Route::get('/dashboard', [DashboardController::class, 'index']);
