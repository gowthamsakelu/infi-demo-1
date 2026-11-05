<?php

use App\Http\Controllers\Pages\BlogController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/blogs', [BlogController::class, 'index'])->middleware(Permissions::can('website', 'view'));
Route::patch('/blogs/{post}', [BlogController::class, 'update'])->where('post', '[A-Za-z0-9_-]+')->middleware(Permissions::can('website', 'edit'));
Route::post('/blogs', [BlogController::class, 'store'])->middleware(Permissions::can('website', 'edit'));
Route::put('/blogs/{post}', [BlogController::class, 'save'])->middleware(Permissions::can('website', 'edit'));
Route::delete('/blogs/{post}', [BlogController::class, 'destroy'])->middleware(Permissions::can('website', 'delete'));
