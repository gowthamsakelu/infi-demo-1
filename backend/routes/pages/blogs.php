<?php

use App\Http\Controllers\Pages\BlogController;
use Illuminate\Support\Facades\Route;

Route::get('/blogs', [BlogController::class, 'index']);
Route::patch('/blogs/{post}', [BlogController::class, 'update'])->whereNumber('post');
