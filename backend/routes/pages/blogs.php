<?php

use App\Http\Controllers\Pages\BlogController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::get('/blogs', [BlogController::class, 'index'])->middleware(Permissions::can('website', 'view'));
Route::patch('/blogs/{post}', [BlogController::class, 'update'])->whereNumber('post')->middleware(Permissions::can('website', 'edit'));
