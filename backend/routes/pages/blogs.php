<?php

use App\Http\Controllers\Pages\BlogController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/blogs', [BlogController::class, 'index'])->middleware(Permissions::can('website', 'view'));
Route::patch('/blogs/{post}', [BlogController::class, 'update'])->whereNumber('post')->middleware(Permissions::can('website', 'edit'));
Route::post('/blogs', [BlogController::class, 'store'])->middleware(Permissions::can('website', 'edit'));
Route::put('/blogs/{post}', [BlogController::class, 'save'])->middleware(Permissions::can('website', 'edit'));
