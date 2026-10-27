<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tour Packages page. `tour_packages` keeps the columns the Destinations page already counts from (destination_id, name, days, nights, price_from).
 * `package_days` holds each day in the shape the itinerary builder saves (see itinerary-builder.js toDays), so a package can prefill the builder.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->nullable()->constrained('destinations')->nullOnDelete();
            $table->string('name', 120);
            $table->string('tag', 12)->default('tour'); // tour | villa | activity
            $table->string('status', 12)->default('draft'); // published | draft
            $table->boolean('seasonal')->default(false);
            $table->unsignedSmallInteger('days')->default(1);
            $table->unsignedSmallInteger('nights')->default(0);
            $table->decimal('price_from', 10, 2)->nullable(); // per person
            $table->text('description')->nullable();
            $table->json('price_tiers')->nullable(); // [{label, note, price}]
            $table->json('inclusions')->nullable();  // [string]
            $table->json('exclusions')->nullable();  // [string]
            $table->unsignedInteger('bookings_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'id']);
        });

        Schema::create('package_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_package_id')->constrained('tour_packages')->cascadeOnDelete();
            $table->unsignedSmallInteger('day_number');
            $table->string('title', 80)->nullable();
            $table->string('location', 160)->nullable();
            $table->string('location_mode', 8)->default('same'); // same | transit
            $table->json('items'); // the builder's saved events: {id, type, icon, title, subtitle, time, details: {b: {role, ...}}}
            $table->timestamps();

            $table->unique(['tour_package_id', 'day_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_days');
        Schema::dropIfExists('tour_packages');
    }
};
