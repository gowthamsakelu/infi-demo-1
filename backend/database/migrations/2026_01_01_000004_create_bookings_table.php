<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('type')->default('TOUR');
            $table->string('type_class')->nullable();
            $table->string('image')->nullable();
            $table->integer('pax')->default(1);
            $table->string('duration')->nullable();
            $table->string('dates')->nullable();
            $table->string('travel_date_full')->nullable();
            $table->string('status')->default('Pending');
            $table->string('status_class')->nullable();
            $table->string('price')->nullable();
            $table->integer('raw_price')->default(0);
            $table->string('category')->default('New Bookings');
            $table->string('destination')->nullable();
            $table->string('booking_type')->nullable();
            $table->string('services')->nullable();
            $table->string('assigned_status')->default('Unassigned');
            $table->text('notes')->nullable();
            $table->json('customer')->nullable();
            $table->json('assigned_to')->nullable();
            $table->json('special_requirements')->nullable();
            $table->json('guests')->nullable();
            $table->json('itinerary_days')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
