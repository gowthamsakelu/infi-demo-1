<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBlogPostRequest;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;

/** Blogs page: the four stat cards are real sums over blog_posts, and the list is the articles, newest first. */
class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        $totals = BlogPost::query()->selectRaw('count(*) as total, coalesce(sum(views), 0) as views, coalesce(sum(leads), 0) as leads, coalesce(sum(converted), 0) as converted')->first();

        return response()->json(['success' => true, 'data' => [
            'stats' => ['total' => (int) $totals->total, 'views' => (int) $totals->views, 'leads' => (int) $totals->leads, 'converted' => (int) $totals->converted],
            'posts' => BlogPost::query()->orderByRaw("case status when 'published' then 0 when 'scheduled' then 1 else 2 end")->orderByDesc('published_at')->orderByDesc('id')->get()->map(fn (BlogPost $p) => $this->present($p))->values(),
        ]]);
    }

    /** Publish now, schedule, or move back to draft. */
    public function update(UpdateBlogPostRequest $request, BlogPost $post): JsonResponse
    {
        $status = $request->input('status');
        $data = ['status' => $status];
        if ($status === 'published' && (! $post->published_at || $post->published_at->isFuture())) {
            $data['published_at'] = now();
        }
        if ($status === 'scheduled' && (! $post->published_at || $post->published_at->isPast())) {
            $data['published_at'] = now()->addDay();
        }
        $post->update($data);

        return response()->json(['success' => true, 'data' => $this->present($post->fresh())]);
    }

    private function present(BlogPost $p): array
    {
        return [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'author' => $p->author,
            'category' => $p->category,
            'status' => $p->status,
            'publishedAt' => $p->published_at?->format('Y-m-d'),
            'updatedAt' => $p->updated_at?->format('Y-m-d'),
            'views' => $p->views,
            'leads' => $p->leads,
            'converted' => $p->converted,
        ];
    }
}
