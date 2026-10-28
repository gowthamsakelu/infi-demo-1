<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Fields the Overview of the Tour Packages, Adventures and Stays detail sheets can show. Every column is nullable: a record that has none of them
// simply does not draw that section. Lists are JSON arrays of strings.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            if (!Schema::hasColumn('tour_packages', 'min_pax')) {
                $table->unsignedSmallInteger('min_pax')->nullable()->after('nights'); // group size: minimum people
            }
        });

        Schema::table('saved_activities', function (Blueprint $table) {
            foreach (['highlights', 'inclusions', 'exclusions'] as $column) {
                if (!Schema::hasColumn('saved_activities', $column)) {
                    $table->json($column)->nullable();
                }
            }
        });

        Schema::table('saved_hotels', function (Blueprint $table) {
            foreach (['inclusions', 'exclusions', 'extra_charges'] as $column) {
                if (!Schema::hasColumn('saved_hotels', $column)) {
                    $table->json($column)->nullable();
                }
            }
            if (!Schema::hasColumn('saved_hotels', 'price_note')) {
                $table->string('price_note', 255)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('tour_packages', fn (Blueprint $t) => $t->dropColumn('min_pax'));
        Schema::table('saved_activities', fn (Blueprint $t) => $t->dropColumn(['highlights', 'inclusions', 'exclusions']));
        Schema::table('saved_hotels', fn (Blueprint $t) => $t->dropColumn(['inclusions', 'exclusions', 'extra_charges', 'price_note']));
    }
};
