<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The Stays page works on `saved_hotels`, the table the itinerary builder's hotel search already fills. Extra columns for what a
 * stay is (tag, rating, contact ...) and `stay_rooms` for rooms and their rate per meal plan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_hotels', function (Blueprint $table) {
            $table->string('tag', 10)->default('hotel');      // hotel | villa | resort
            $table->string('status', 10)->default('active');  // active | inactive
            $table->string('region', 120)->nullable();        // "Jammu & Kashmir"
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedInteger('reviews')->default(0);
            $table->unsignedSmallInteger('rooms_count')->nullable();
            $table->decimal('price_from', 10, 2)->nullable(); // per room per night
            $table->string('email', 120)->nullable();
            $table->text('description')->nullable();
            $table->json('amenities')->nullable();
            $table->unsignedInteger('bookings_count')->default(0);
            $table->decimal('revenue', 12, 2)->default(0);
            $table->string('demo_key', 120)->nullable()->unique(); // id in database/data/demo-places.json, so seeding twice never duplicates
        });

        Schema::create('stay_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saved_hotel_id')->constrained('saved_hotels')->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('occupancy', 60)->nullable(); // "2 adults + 1 child"
            $table->decimal('rate_stay', 10, 2)->nullable();      // only stay
            $table->decimal('rate_breakfast', 10, 2)->nullable(); // + breakfast
            $table->decimal('rate_map', 10, 2)->nullable();       // + breakfast & dinner
            $table->decimal('rate_all', 10, 2)->nullable();       // all meals
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stay_rooms');
        Schema::table('saved_hotels', function (Blueprint $table) {
            $table->dropColumn(['tag', 'status', 'region', 'rating', 'reviews', 'rooms_count', 'price_from', 'email', 'description', 'amenities', 'bookings_count', 'revenue', 'demo_key']);
        });
    }
};
