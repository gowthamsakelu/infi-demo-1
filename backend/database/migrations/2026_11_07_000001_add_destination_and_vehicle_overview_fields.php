<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Fields the Overview of the Destinations and Transport detail sheets can show. Every column is nullable: a record that has none of them
// simply does not draw that section. Lists are JSON arrays of strings. (Adventures and Stays use the columns from 2026_11_05_000001.)
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            if (!Schema::hasColumn('destinations', 'highlights')) {
                $table->json('highlights')->nullable(); // top places to see
            }
            if (!Schema::hasColumn('destinations', 'how_to_reach')) {
                $table->text('how_to_reach')->nullable();
            }
        });

        Schema::table('vehicle_types', function (Blueprint $table) {
            if (!Schema::hasColumn('vehicle_types', 'overview')) {
                $table->text('overview')->nullable();
            }
            foreach (['highlights', 'inclusions', 'exclusions'] as $column) {
                if (!Schema::hasColumn('vehicle_types', $column)) {
                    $table->json($column)->nullable();
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('destinations', fn (Blueprint $t) => $t->dropColumn(['highlights', 'how_to_reach']));
        Schema::table('vehicle_types', fn (Blueprint $t) => $t->dropColumn(['overview', 'highlights', 'inclusions', 'exclusions']));
    }
};
