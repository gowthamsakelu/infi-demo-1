<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** The Transport page works on the same `vehicle_types` the itinerary builder reads. These are the extra columns it needs. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_types', function (Blueprint $table) {
            $table->boolean('most_popular')->default(false);   // "Most popular": listed first in the builder, in popularity_rank order
            $table->boolean('show_in_builder')->default(true); // "Show in itinerary builder"
            $table->string('description', 160)->nullable();    // "Dzire, Etios or similar"
            $table->json('rate_card')->nullable();             // [{label, note, amount, unit}]
            $table->unsignedInteger('trips_count')->default(0); // trips this year
            $table->decimal('avg_days', 3, 1)->nullable();      // average days per trip
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_types', function (Blueprint $table) {
            $table->dropColumn(['most_popular', 'show_in_builder', 'description', 'rate_card', 'trips_count', 'avg_days']);
        });
    }
};
