<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A picture for each record on the Tour Packages, Transport, Stays and Adventures pages (the path of a file under public/images). Nullable: a record
// without one shows the shared placeholder. destinations.image already exists (earlier migration).
return new class extends Migration
{
    public function up(): void
    {
        foreach (['tour_packages', 'vehicle_types', 'saved_hotels', 'saved_activities'] as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                if (!Schema::hasColumn($table, 'image')) {
                    $t->string('image', 255)->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        foreach (['tour_packages', 'vehicle_types', 'saved_hotels', 'saved_activities'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropColumn('image'));
        }
    }
};
