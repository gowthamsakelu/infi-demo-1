<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderBannersRequest;
use App\Http\Requests\UpdateBannerRequest;
use App\Models\Banner;
use App\Support\DummyData;
use App\Http\Requests\SaveBannerRequest;
use App\Support\DataUrlImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/** Banners page: the list in website order, the on / off switch, and moving a banner up or down. */
class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::list('banners')]);
        }

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
        $file = preg_replace('#^/?images/#', '', (string) $b->image);
        $image = $file !== '' && is_file(public_path('images/'.$file)) ? '/images/'.$file : null;

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

    /** Add a banner from the wizard, last in the website order. With dummy data nothing is written. */
    public function store(SaveBannerRequest $request): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null], 201);
        }

        $banner = Banner::query()->create($this->columns($request) + ['position' => (int) Banner::query()->max('position') + 1]);

        return response()->json(['success' => true, 'data' => $this->present($banner)], 201);
    }

    /** Save the banner the wizard was opened on (the id is a string: with dummy data it can be one the page made this session). */
    public function save(SaveBannerRequest $request, string $banner): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null]);
        }

        $record = Banner::query()->findOrFail((int) $banner);
        $record->update($this->columns($request));

        return response()->json(['success' => true, 'data' => $this->present($record->refresh())]);
    }

    private function columns(SaveBannerRequest $r): array
    {
        $columns = [
            'name' => $r->input('name'), 'headline' => $r->input('headline', ''), 'cta' => $r->input('cta', ''), 'tone' => $r->input('tone', 'blue'),
            'placement' => $r->input('placement', 'Not placed yet'), 'slot' => $r->input('slot'), 'starts_at' => $r->input('startsAt'), 'ends_at' => $r->input('endsAt'),
            'is_active' => $r->boolean('active'),
        ];
        if ($image = DataUrlImage::store($r->input('image'), 'banners')) {
            $columns['image'] = $image;
        }

        return $columns;
    }
}
