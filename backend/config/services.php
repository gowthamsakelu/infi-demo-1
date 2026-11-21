<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    // Which source answers /api/places/*: auto = Google when GOOGLE_PLACES_API_KEY is set, otherwise the demo data; google; demo.
    'places' => [
        'provider' => env('PLACES_PROVIDER', 'auto'),
        'demo_file' => database_path('data/demo-places.json'),
    ],

    // Google Places API (New). The key stays on the server: the browser only talks to /api/places/*.
    'google_places' => [
        'key' => env('GOOGLE_PLACES_API_KEY'),
        'base_url' => env('GOOGLE_PLACES_BASE_URL', 'https://places.googleapis.com'),
    ],

    // Rayna B2B Tour API
    'rayna' => [
        'mode' => env('RAYNA_MODE', 'mock'),
        'base_url' => env('RAYNA_BASE_URL', 'https://api.raynab2b.com'),
        'token' => env('RAYNA_TOKEN'),
        'timeout' => (int) env('RAYNA_TIMEOUT', 30),
        'image_base' => env('RAYNA_IMAGE_BASE', 'https://d2cazmkfw8kdtj.cloudfront.net'),
    ],

    // Live Ruyi Travels website API (read only lists: hotels, packages, activities, transport, blogs)
    'ruyi' => [
        'base_url' => env('RUYI_API_BASE', 'https://ruyitravels.com/api'),
        'timeout' => (int) env('RUYI_TIMEOUT', 20),
        'cache_seconds' => (int) env('RUYI_CACHE_SECONDS', 60),
        // The admin pages (Stays ...) show the live Ruyi data while this is true. Set RUYI_PAGES=false to go back to the demo data / own tables.
        'pages' => (bool) env('RUYI_PAGES', false),
        'all_cache_seconds' => (int) env('RUYI_ALL_CACHE_SECONDS', 300),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
