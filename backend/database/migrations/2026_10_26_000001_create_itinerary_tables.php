<?php

use App\Support\ItineraryWriter;
use App\Support\TripDates;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The itinerary moves out of a JSON column on bookings and inquiries into tables of its own
 * (itineraries -> itinerary_days -> itinerary_items), shared by both. Existing events are copied over.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('itineraries', function (Blueprint $table) {
            $table->id();
            $table->string('itineraryable_type', 20); // booking | inquiry
            $table->string('itineraryable_id', 40);
            $table->string('origin')->nullable();
            $table->string('destination')->nullable();
            $table->json('stops')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();

            $table->unique(['itineraryable_type', 'itineraryable_id']);
        });

        Schema::create('itinerary_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('day_number');
            $table->date('date')->nullable();
            $table->string('title', 80)->nullable();
            $table->string('location')->nullable();
            $table->string('location_mode', 12)->default('same'); // same | transit
            $table->timestamps();

            $table->index(['itinerary_id', 'day_number']);
        });

        Schema::create('itinerary_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_day_id')->constrained('itinerary_days')->cascadeOnDelete();
            $table->string('uid', 60)->index(); // id the UI uses for the event
            $table->unsignedSmallInteger('position')->default(0);
            $table->string('type', 12); // stay | transport | activity | meal | note
            $table->string('icon', 20)->nullable();
            $table->string('title', 120);
            $table->string('subtitle', 200)->nullable();
            $table->string('start_time', 12)->nullable();
            $table->string('end_time', 12)->nullable();
            $table->string('location')->nullable();
            $table->string('inclusion', 14)->default('included'); // included | not_included | paid_extra
            $table->string('meal_plan', 60)->nullable();
            $table->json('details')->nullable();
            $table->boolean('visible_to_customer')->default(true);
            $table->json('assigned_to')->nullable();
            $table->boolean('completed')->default(false);
            $table->timestamps();
        });

        $this->copy('bookings', 'booking', fn ($row) => TripDates::parse($row->travel_date_full)[0] ?? null);
        $this->copy('inquiries', 'inquiry', fn ($row) => $row->travel_date ? \Carbon\CarbonImmutable::parse($row->travel_date) : null);

        Schema::table('bookings', fn (Blueprint $t) => $t->dropColumn('itinerary_days'));
        Schema::table('inquiries', fn (Blueprint $t) => $t->dropColumn('itinerary_days'));
    }

    public function down(): void
    {
        Schema::table('bookings', fn (Blueprint $t) => $t->json('itinerary_days')->nullable());
        Schema::table('inquiries', fn (Blueprint $t) => $t->json('itinerary_days')->nullable());

        foreach (['booking' => 'bookings', 'inquiry' => 'inquiries'] as $type => $table) {
            DB::table('itineraries')->where('itineraryable_type', $type)->get()->each(function ($it) use ($table) {
                $days = DB::table('itinerary_days')->where('itinerary_id', $it->id)->orderBy('day_number')->get()->map(function ($d) {
                    $items = DB::table('itinerary_items')->where('itinerary_day_id', $d->id)->orderBy('position')->get()->map(fn ($i) => [
                        'id' => $i->uid, 'type' => $i->type, 'icon' => $i->icon, 'title' => $i->title, 'subtitle' => $i->subtitle,
                        'assigned' => $i->assigned_to ? json_decode($i->assigned_to, true) : null, 'completed' => (bool) $i->completed,
                    ])->all();

                    return ['day' => "Day {$d->day_number}", 'date' => $d->date ? date('j M', strtotime($d->date)) : 'TBD', 'title' => $d->title, 'items' => $items];
                })->all();
                DB::table($table)->where('id', $it->itineraryable_id)->update(['itinerary_days' => json_encode($days)]);
            });
        }

        Schema::dropIfExists('itinerary_items');
        Schema::dropIfExists('itinerary_days');
        Schema::dropIfExists('itineraries');
    }

    private function copy(string $table, string $type, callable $startOf): void
    {
        DB::table($table)->whereNotNull('itinerary_days')->get()->each(function ($row) use ($type, $startOf) {
            $days = json_decode($row->itinerary_days, true);
            if (is_array($days) && $days) {
                ItineraryWriter::write($type, $row->id, $days, null, $startOf($row));
            }
        });
    }
};
