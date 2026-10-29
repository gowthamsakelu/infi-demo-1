<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBlogPostRequest;
use App\Models\BlogPost;
use App\Support\DataUrlImage;
use App\Support\DummyData;
use Illuminate\Support\Carbon;
use App\Http\Requests\SaveBlogPostRequest;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

/** Blogs page: the four stat cards are real sums over blog_posts, and the list is the articles, newest first. */
class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::file('blogs')]);
        }

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
            'excerpt' => $p->excerpt,
            'content' => $p->content,
            'cover' => DataUrlImage::url($p->cover),
            'category' => $p->category,
            'status' => $p->status,
            'publishedAt' => $p->published_at?->format('Y-m-d'),
            'updatedAt' => $p->updated_at?->format('Y-m-d'),
            'views' => $p->views,
            'leads' => $p->leads,
            'converted' => $p->converted,
        ];
    }

    /** Delete an article. With dummy data nothing is deleted: the page drops it from its in-memory list. */
    public function destroy(string $post): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null]);
        }

        BlogPost::query()->findOrFail((int) $post)->delete();

        return response()->json(['success' => true, 'data' => null]);
    }

    /** Add an article from the wizard. With dummy data nothing is written. */
    public function store(SaveBlogPostRequest $request): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null], 201);
        }

        $post = BlogPost::query()->create($this->columns($request, null) + ['views' => 0, 'leads' => 0, 'converted' => 0]);

        return response()->json(['success' => true, 'data' => ['id' => $post->id]], 201);
    }

    /** Save the article the wizard was opened on (the id is a string: with dummy data it can be one the page made this session). */
    public function save(SaveBlogPostRequest $request, string $post): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null]);
        }

        $record = BlogPost::query()->findOrFail((int) $post);
        $record->update($this->columns($request, $record));

        return response()->json(['success' => true, 'data' => ['id' => $record->id]]);
    }

    /** The wizard's values in the table's columns. A new article gets a unique slug from its title. */
    private function columns(SaveBlogPostRequest $r, ?BlogPost $current): array
    {
        $status = $r->input('status', 'draft');
        $publishedAt = match (true) {
            $r->filled('publishedAt') => Carbon::parse($r->input('publishedAt')),
            $status === 'draft' => null,
            $current?->published_at !== null => $current->published_at,
            $status === 'scheduled' => now()->addDay(),
            default => now(),
        };
        $columns = ['title' => $r->input('title'), 'author' => $r->input('author', ''), 'category' => $r->input('category'), 'status' => $status, 'published_at' => $publishedAt,
            'excerpt' => $r->input('excerpt'), 'content' => $r->input('content')];
        if ($r->exists('cover')) {
            $columns['cover'] = DataUrlImage::column($r->input('cover'), 'blogs'); // a new picture is saved, a stored path is kept, empty clears it
        }
        if (! $current) {
            $base = Str::slug((string) $r->input('title')) ?: 'article';
            $slug = $base;
            for ($n = 2; BlogPost::query()->where('slug', $slug)->exists(); $n++) {
                $slug = $base.'-'.$n;
            }
            $columns['slug'] = $slug;
        }

        return $columns;
    }
}
