<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** The Adventures page works on `saved_activities`, the table the itinerary builder's activity search already fills. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_activities', function (Blueprint $table) {
            $table->string('tag', 12)->default('adventure'); // adventure | sightseeing | water | culture | food | nature
            $table->string('status', 10)->default('active'); // active | inactive
            $table->string('region', 120)->nullable();
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedInteger('reviews')->default(0);
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->decimal('price_adult', 10, 2)->nullable();
            $table->decimal('price_child', 10, 2)->nullable();
            $table->decimal('price_group', 10, 2)->nullable();
            $table->unsignedSmallInteger('group_size')->nullable();
            $table->string('difficulty', 20)->nullable();
            $table->string('best_time', 120)->nullable();
            $table->string('min_age', 40)->nullable();
            $table->string('partner', 120)->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('bookings_count')->default(0);
            $table->string('demo_key', 120)->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('saved_activities', function (Blueprint $table) {
            $table->dropColumn(['tag', 'status', 'region', 'rating', 'reviews', 'duration_minutes', 'price_adult', 'price_child', 'price_group', 'group_size', 'difficulty', 'best_time', 'min_age', 'partner', 'description', 'bookings_count', 'demo_key']);
        });
    }
};
