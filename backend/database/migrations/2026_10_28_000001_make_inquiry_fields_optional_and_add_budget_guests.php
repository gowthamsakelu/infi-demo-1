<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The Add Inquiry wizard saves whatever staff know on the call, so name, phone, trip and nights may be empty.
 * It also stores the budget estimate and the guest list (name and age; guest 1 is the customer).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->change();
            $table->string('customer_phone')->nullable()->change();
            $table->string('trip')->nullable()->change();
            $table->unsignedSmallInteger('nights')->nullable()->default(null)->change();
            $table->decimal('budget', 14, 2)->nullable()->after('notes');
            $table->json('guests')->nullable()->after('budget');
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn(['budget', 'guests']);
        });
    }
};
