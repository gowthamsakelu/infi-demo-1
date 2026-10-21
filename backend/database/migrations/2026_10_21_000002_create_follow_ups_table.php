<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('follow_ups', function (Blueprint $table) {
            $table->id();
            $table->string('inquiry_id');
            $table->string('customer_phone')->index(); // last 10 digits; joins the entry to a customer's journey
            $table->string('customer_name')->nullable();
            $table->string('type'); // follow_up, called, cc
            $table->string('call_outcome')->nullable();
            $table->dateTime('scheduled_at');
            $table->text('comment')->nullable();
            $table->string('created_by'); // staff id
            $table->string('created_by_name');
            $table->timestamps();

            $table->foreign('inquiry_id')->references('id')->on('inquiries')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follow_ups');
    }
};
