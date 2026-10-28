<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Fields the Add / Edit Tour Package wizard saves that the table does not have yet. Both are nullable. (min_pax comes from 2026_11_05_000001.)
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            if (!Schema::hasColumn('tour_packages', 'season')) {
                $table->string('season', 60)->nullable()->after('seasonal'); // e.g. "Mar - Jun"
            }
            if (!Schema::hasColumn('tour_packages', 'highlights')) {
                $table->json('highlights')->nullable(); // [string]
            }
        });
    }

    public function down(): void
    {
        Schema::table('tour_packages', fn (Blueprint $t) => $t->dropColumn(['season', 'highlights']));
    }
};
