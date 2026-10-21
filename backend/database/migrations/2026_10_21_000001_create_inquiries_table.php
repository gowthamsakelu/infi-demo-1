<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('location')->nullable();
            $table->string('lead_source')->nullable();
            $table->string('trip');
            $table->unsignedSmallInteger('pax')->default(1);
            $table->unsignedSmallInteger('nights')->default(1);
            $table->date('travel_date')->nullable();
            $table->string('status')->default('new'); // new, ongoing, warm, hot
            $table->string('assigned_to_id')->nullable();
            $table->string('assigned_to_name')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
