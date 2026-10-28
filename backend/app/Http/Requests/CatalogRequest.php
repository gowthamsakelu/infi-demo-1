<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Base of the catalog wizards' requests (Destinations, Transport, Stays, Adventures, Banners, Blogs): only the name or title is required. */
abstract class CatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // behind `auth` and the page's permission on the route
    }

    /** A list input: an array of short strings (the rules for its items are listed per field). */
    protected function listRule(int $max = 30): array
    {
        return ['nullable', 'array', "max:{$max}"];
    }
}
