<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class PageController extends Controller
{
    /**
     * Serve the app shell. Entry assets are versioned by file time so a deploy is picked up on the next load,
     * and the module files are modulepreloaded so the import chain does not load one file at a time.
     */
    public function home(): Response
    {
        $files = array_merge([public_path('css/style.css'), public_path('css/pages.css'), public_path('css/ui-standard.css')], glob(public_path('js/{,shared/,pages/}*.js'), GLOB_BRACE) ?: []);
        $version = substr(md5(implode('|', array_map('filemtime', $files))), 0, 10);

        $html = str_replace(
            ['./css/style.css', './css/pages.css', './css/ui-standard.css', './js/main.js', './css/fonts.css'],
            ["./css/style.css?v={$version}", "./css/pages.css?v={$version}", "./css/ui-standard.css?v={$version}", "./js/main.js?v={$version}", "./css/fonts.css?v={$version}"],
            file_get_contents(public_path('index.html'))
        );

        // the page's own scripts post the sign-out form with this token
        $html = str_replace('</head>', '<meta name="csrf-token" content="'.csrf_token().'"></head>', $html);

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8')->header('Cache-Control', 'no-cache, must-revalidate');
    }
}
