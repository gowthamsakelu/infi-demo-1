<?php

namespace App\Http\Requests;

/** Add / Edit an article (the catalog wizard). Only the title is required. */
class SaveBlogPostRequest extends CatalogRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'author' => ['nullable', 'string', 'max:80'],
            'category' => ['required', 'in:guide,itinerary,tips'],
            'status' => ['required', 'in:published,draft,scheduled'],
            'publishedAt' => ['nullable', 'date'],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'content' => ['nullable', 'string', 'max:20000'],
            'cover' => ['nullable', 'string', 'max:7000000'],
        ];
    }
}
