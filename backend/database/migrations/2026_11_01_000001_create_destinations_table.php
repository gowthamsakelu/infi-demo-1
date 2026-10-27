<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Destinations: the places the agency sells. Tour packages, stays and activities link to a destination, and its inquiry and booking
 * numbers are counted from the inquiries and bookings that mention it (by `name` or any of its `keywords`).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('name', 80);
            $table->string('region', 120)->nullable(); // "Jammu & Kashmir, India"
            $table->string('status', 12)->default('draft'); // active | draft
            $table->boolean('popular')->default(false);
            $table->json('keywords')->nullable(); // other names inquiries use for it: Srinagar, Gulmarg ...
            $table->string('best_season', 80)->nullable();
            $table->unsignedSmallInteger('avg_days')->nullable();
            $table->unsignedSmallInteger('avg_nights')->nullable();
            $table->string('ideal_duration', 60)->nullable(); // "5 to 7 day trips"
            $table->string('nearest_airport', 100)->nullable();
            $table->text('description')->nullable();
            $table->string('image', 255)->nullable(); // a file under public/images
            $table->timestamps();

            $table->index(['status', 'popular']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};
