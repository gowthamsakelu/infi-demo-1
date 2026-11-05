<?php

namespace App\Http\Controllers\Concerns;

use App\Support\Ruyi\RuyiApiException;
use App\Support\Ruyi\RuyiApiService;
use Closure;
use Illuminate\Http\JsonResponse;

/**
 * For the catalog page controllers that can show the live Ruyi Travels data (RUYI_PAGES, on by default). Everything is read only:
 * the page reads the Ruyi lists, and a save, status change or delete is refused or kept in the page's memory, never sent anywhere.
 */
trait ReadsRuyi
{
    protected function ruyi(): RuyiApiService
    {
        return app(RuyiApiService::class);
    }

    protected function ruyiOn(): bool
    {
        return $this->ruyi()->pagesOn();
    }

    /** Run a read of the Ruyi site. When the site is down the page gets its error state, not demo data that would pass for the real thing. */
    protected function fromRuyi(Closure $load): JsonResponse
    {
        try {
            $data = $load();
        } catch (RuyiApiException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 502);
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    /** A change that would have to be written to the live site: refused, with a message the page shows. */
    protected function ruyiReadOnly(): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Read only: this list comes from ruyitravels.com and cannot be changed here.'], 403);
    }
}
