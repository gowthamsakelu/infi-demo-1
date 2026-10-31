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

        $branding = \App\Http\Controllers\Pages\SettingsController::brandingData();
        $brandColor = htmlspecialchars($branding['color'] ?: '#2563EB', ENT_QUOTES, 'UTF-8');
        $primaryColor = htmlspecialchars($branding['themeColor'] ?: $brandColor, ENT_QUOTES, 'UTF-8');
        $brandingJson = json_encode($branding, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);

        $cleanHex1 = ltrim($brandColor, '#');
        if (strlen($cleanHex1) === 3) {
            $cleanHex1 = $cleanHex1[0].$cleanHex1[0].$cleanHex1[1].$cleanHex1[1].$cleanHex1[2].$cleanHex1[2];
        }
        $r1 = hexdec(substr($cleanHex1, 0, 2) ?: '37');
        $g1 = hexdec(substr($cleanHex1, 2, 2) ?: '99');
        $b1 = hexdec(substr($cleanHex1, 4, 2) ?: '235');

        $cleanHex2 = ltrim($primaryColor, '#');
        if (strlen($cleanHex2) === 3) {
            $cleanHex2 = $cleanHex2[0].$cleanHex2[0].$cleanHex2[1].$cleanHex2[1].$cleanHex2[2].$cleanHex2[2];
        }
        $r2 = hexdec(substr($cleanHex2, 0, 2) ?: '29');
        $g2 = hexdec(substr($cleanHex2, 2, 2) ?: '78');
        $b2 = hexdec(substr($cleanHex2, 4, 2) ?: '216');

        $primaryLight = "rgba({$r1}, {$g1}, {$b1}, 0.08)";
        $primaryBorder = "rgba({$r1}, {$g1}, {$b1}, 0.22)";
        $primaryShadow = "rgba({$r1}, {$g1}, {$b1}, 0.25)";
        $primaryRing = "rgba({$r1}, {$g1}, {$b1}, 0.15)";

        $injections = "<style id=\"app-branding-theme\">:root { --brand-color: {$brandColor}; --primary: {$brandColor}; --primary-accent: {$primaryColor}; --primary-gradient: {$brandColor}; --primary-gradient-subtle: {$primaryLight}; --primary-light: {$primaryLight}; --primary-border: {$primaryBorder}; --primary-shadow: {$primaryShadow}; --primary-ring: {$primaryRing}; }\n";
        $injections .= "  .ks-avatar-badge { background: {$brandColor} !important; color: #FFFFFF !important; }\n";
        $injections .= "  .row-avatar { background: {$primaryLight} !important; color: {$brandColor} !important; border-color: {$primaryBorder} !important; }\n";
        $injections .= "  .compact-tab-btn.active, .tab-pill.active { background: {$brandColor} !important; color: #FFFFFF !important; border-color: transparent !important; }\n";
        $injections .= "  .item-icon-box, .item-icon-camera { background: {$primaryLight} !important; color: {$brandColor} !important; border-color: {$primaryBorder} !important; }\n";
        $injections .= "  .item-icon-box svg, .item-icon-camera svg { stroke: {$brandColor} !important; color: {$brandColor} !important; }\n";
        $injections .= "  .dd-trigger svg:first-child, .mobile-category-select-wrapper .category-filter-icon { color: {$brandColor} !important; }</style>\n";
        $injections .= "  <script id=\"app-branding-data\">window.__BRANDING__ = {$brandingJson};</script>\n";
        $injections .= '  <meta name="csrf-token" content="'.csrf_token().'">';

        // the page's own scripts post the sign-out form with this token
        $html = str_replace('</head>', "{$injections}\n</head>", $html);

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8')->header('Cache-Control', 'no-cache, must-revalidate');
    }
}
