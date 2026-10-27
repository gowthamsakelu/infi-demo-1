<?php

use App\Http\Controllers\Pages\ContactMessageController;
use Illuminate\Support\Facades\Route;

Route::get('/contact-messages', [ContactMessageController::class, 'index']);
Route::post('/contact-messages/read-all', [ContactMessageController::class, 'readAll']);
Route::patch('/contact-messages/{message}', [ContactMessageController::class, 'update'])->whereNumber('message');
Route::post('/contact-messages/{message}/convert', [ContactMessageController::class, 'convert'])->whereNumber('message');
