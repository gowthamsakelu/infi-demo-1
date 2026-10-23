<?php

namespace App\Models\Concerns;

use App\Models\Itinerary;
use App\Support\ItineraryWriter;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Gives bookings and inquiries the same itinerary. `itinerary_days` reads and writes the day list the UI uses,
 * so code that assigns an array and saves keeps working; the data itself lives in the itinerary tables.
 */
trait HasItinerary
{
    private ?array $pendingItineraryDays = null;

    public static function bootHasItinerary(): void
    {
        static::saved(function ($model) {
            if ($model->pendingItineraryDays !== null) {
                $days = $model->pendingItineraryDays;
                $model->pendingItineraryDays = null;
                ItineraryWriter::write($model->itineraryKind(), $model->getKey(), $days, null, $model->itineraryTripStart());
                $model->unsetRelation('itinerary');
            }
        });
    }

    public function initializeHasItinerary(): void
    {
        $this->with = array_values(array_unique([...$this->with, 'itinerary.days.items']));
        $this->append('itinerary_days');
        $this->makeHidden('itinerary');
    }

    /** booking | inquiry */
    abstract public function itineraryKind(): string;

    /** First day of the trip, when the record knows it (used to date the days). */
    abstract public function itineraryTripStart(): ?CarbonImmutable;

    public function itinerary(): HasOne
    {
        return $this->hasOne(Itinerary::class, 'itineraryable_id')->where('itineraryable_type', $this->itineraryKind());
    }

    public function getItineraryDaysAttribute(): array
    {
        if ($this->pendingItineraryDays !== null) {
            return $this->pendingItineraryDays;
        }

        return $this->itinerary?->days->map->toTimeline()->all() ?? [];
    }

    public function setItineraryDaysAttribute(?array $days): void
    {
        $this->pendingItineraryDays = array_values($days ?? []);
    }
}
