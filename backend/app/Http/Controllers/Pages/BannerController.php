<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderBannersRequest;
use App\Http\Requests\UpdateBannerRequest;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/** Banners page: the list in website order, the on / off switch, and moving a banner up or down. */
class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Banner::query()->orderBy('position')->orderBy('id')->get()->map(fn (Banner $b) => $this->present($b))->values()]);
    }

    public function update(UpdateBannerRequest $request, Banner $banner): JsonResponse
    {
        $banner->update(['is_active' => $request->boolean('is_active')]);

        return response()->json(['success' => true, 'data' => $this->present($banner->fresh())]);
    }

    /** Every banner id once, in the new order. Ids that are left out keep their order after the listed ones. */
    public function reorder(ReorderBannersRequest $request): JsonResponse
    {
        $ids = array_map('intval', $request->input('ids'));
        DB::transaction(function () use ($ids) {
            $rest = Banner::query()->whereNotIn('id', $ids)->orderBy('position')->orderBy('id')->pluck('id')->all();
            foreach (array_merge($ids, $rest) as $i => $id) {
                Banner::whereKey($id)->update(['position' => $i + 1]);
            }
        });

        return $this->index();
    }

    private function present(Banner $b): array
    {
        // A file that is not in public/images is sent as null: the page shows the banner's gradient instead of a broken picture.
        $image = $b->image && is_file(public_path('images/'.basename($b->image))) ? '/images/'.basename($b->image) : null;

        return [
            'id' => $b->id,
            'name' => $b->name,
            'headline' => $b->headline,
            'cta' => $b->cta,
            'image' => $image,
            'tone' => $b->tone,
            'placement' => $b->placement,
            'slot' => $b->slot,
            'position' => $b->position,
            'active' => $b->is_active,
            'status' => $b->state(),
            'startsAt' => $b->starts_at?->format('Y-m-d'),
            'endsAt' => $b->ends_at?->format('Y-m-d'),
            'clicks' => $b->clicks,
            'leads' => $b->leads,
            'converted' => $b->converted,
        ];
    }
}
