<?php

use App\Support\TripDates;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->index(['start_date', 'end_date']);
        });

        DB::table('bookings')->select('id', 'travel_date_full')->orderBy('id')->each(function ($row) {
            if ($dates = TripDates::parse($row->travel_date_full)) {
                DB::table('bookings')->where('id', $row->id)->update(['start_date' => $dates[0]->toDateString(), 'end_date' => $dates[1]->toDateString()]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['start_date', 'end_date']);
            $table->dropColumn(['start_date', 'end_date']);
        });
    }
};
