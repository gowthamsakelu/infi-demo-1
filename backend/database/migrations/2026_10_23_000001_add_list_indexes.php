<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->index('status');
            $table->index('category');
            $table->index('assigned_to_id');
            $table->index('travel_date');
        });

        Schema::table('follow_ups', function (Blueprint $table) {
            $table->index(['customer_phone', 'scheduled_at']);
            $table->index('inquiry_id');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index('type');
            $table->index('category');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['category']);
            $table->dropIndex(['assigned_to_id']);
            $table->dropIndex(['travel_date']);
        });
        Schema::table('follow_ups', function (Blueprint $table) {
            $table->dropIndex(['customer_phone', 'scheduled_at']);
            $table->dropIndex(['inquiry_id']);
        });
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropIndex(['category']);
            $table->dropIndex(['status']);
        });
    }
};
