<?php

use App\Http\Controllers\Pages\AdventureController;
use Illuminate\Support\Facades\Route;

Route::get('/adventures', [AdventureController::class, 'index']);
