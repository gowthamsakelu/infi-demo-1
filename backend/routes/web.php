<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\BookingsManager;

Route::get('/', function () {
    // Version the entry assets by file time so phones never keep a stale copy after a deploy.
    $files = array_merge([public_path('css/style.css')], glob(public_path('js/{,shared/}*.js'), GLOB_BRACE) ?: []);
    $version = substr(md5(implode('|', array_map(fn ($f) => filemtime($f), $files))), 0, 10);

    $html = str_replace(
        ['./css/style.css', './js/main.js'],
        ["./css/style.css?v={$version}", "./js/main.js?v={$version}"],
        file_get_contents(public_path('index.html'))
    );

    return response($html)->header('Content-Type', 'text/html; charset=UTF-8')->header('Cache-Control', 'no-cache, must-revalidate');
})->name('home');

Route::get('/livewire', BookingsManager::class)->name('bookings.livewire');


// "Enquiries" was renamed to "Inquiries": keep old URLs working.
Route::redirect('/enquiries', '/inquiries', 301);
Route::redirect('/enquiries/{any}', '/inquiries', 301)->where('any', '.*');
Route::get('/inquiries', fn () => redirect('/#inquiries'))->name('inquiries');
