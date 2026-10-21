<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->string('category')->default('TOUR')->after('trip'); // TOUR, VILLA, ACTIVITY, TRANSPORT
        });

        // Backfill existing rows from the trip name.
        DB::table('inquiries')->where('trip', 'like', '%Villa%')->update(['category' => 'VILLA']);
        DB::table('inquiries')->where(function ($q) {
            $q->where('trip', 'like', '%Rafting%')->orWhere('trip', 'like', '%Paragliding%');
        })->update(['category' => 'ACTIVITY']);
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
