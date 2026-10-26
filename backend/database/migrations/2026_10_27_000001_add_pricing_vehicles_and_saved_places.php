<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Prices on itinerary events, the vehicle catalogue the transport form picks from, and the hotels / activities
 * staff have used before ("Recently used"). The itinerary keeps whether its prices may be shown to the customer.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_types', function (Blueprint $table) {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('name', 80);
            $table->string('icon', 20); // key of the shared icon set
            $table->unsignedSmallInteger('seats')->nullable();
            $table->boolean('ac')->default(true);
            $table->string('category', 12); // car | van | bus | bike | boat | public
            $table->decimal('base_rate', 10, 2)->nullable(); // null: the customer arranges it, so there is no rate
            $table->string('rate_unit', 12)->nullable(); // per_day
            $table->unsignedSmallInteger('popularity_rank')->default(100);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['active', 'popularity_rank']);
        });

        foreach (['saved_hotels', 'saved_activities'] as $name) {
            Schema::create($name, function (Blueprint $table) use ($name) {
                $table->id();
                $table->string('place_id', 255)->nullable()->index(); // Google place id; null for places typed in by hand
                $table->string('name', 120);
                $table->string('city', 120)->nullable(); // activities: the place
                $table->string('address', 255)->nullable();
                $table->string('phone', 30)->nullable();
                if ($name === 'saved_activities') {
                    $table->string('meeting_point', 160)->nullable();
                }
                $table->unsignedInteger('uses')->default(1);
                $table->timestamp('last_used_at')->nullable()->index();
                $table->timestamps();
            });
        }

        Schema::table('itinerary_items', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable(); // per unit: room-night, vehicle-day or person
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->decimal('total_price', 12, 2)->nullable();
            $table->boolean('price_overridden')->default(false); // price differs from the catalogue rate for this event only
            $table->string('currency', 3)->default('INR');
            $table->foreignId('vehicle_type_id')->nullable()->constrained('vehicle_types')->nullOnDelete();
            $table->string('place_id', 255)->nullable();
            // `assigned_to` already holds who the event is assigned to as shown in the UI; this is the same person as a key.
            $table->string('assigned_staff_id')->nullable();
            $table->foreign('assigned_staff_id')->references('id')->on('staff')->nullOnDelete();
        });

        Schema::table('itineraries', function (Blueprint $table) {
            $table->boolean('show_prices_to_customer')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('itineraries', fn (Blueprint $t) => $t->dropColumn('show_prices_to_customer'));
        Schema::table('itinerary_items', function (Blueprint $table) {
            $table->dropForeign(['vehicle_type_id']);
            $table->dropForeign(['assigned_staff_id']);
            $table->dropColumn(['price', 'quantity', 'total_price', 'price_overridden', 'currency', 'vehicle_type_id', 'place_id', 'assigned_staff_id']);
        });
        Schema::dropIfExists('saved_activities');
        Schema::dropIfExists('saved_hotels');
        Schema::dropIfExists('vehicle_types');
    }
};
