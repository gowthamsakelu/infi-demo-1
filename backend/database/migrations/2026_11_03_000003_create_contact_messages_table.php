<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Messages from the website contact form. The sidebar badge counts `read_at IS NULL` and `status != 'spam'` (NavCountsController).
 * `inquiry_id` links a converted message to the inquiry it created (inquiries.id is a string such as INQ-1042). The existing
 * `contacts` table (drivers, guides ...) is a different thing and is not touched.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email', 160)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('subject', 200)->nullable();
            $table->text('message');
            $table->string('source', 40)->default('Website form');
            $table->string('destination', 120)->nullable();
            $table->date('travel_start')->nullable();
            $table->date('travel_end')->nullable();
            $table->unsignedSmallInteger('adults')->nullable();
            $table->unsignedSmallInteger('children')->nullable();
            $table->string('interests', 255)->nullable();
            $table->boolean('existing_customer')->default(false);
            $table->string('status', 12)->default('new'); // new | replied | converted | spam
            $table->timestamp('read_at')->nullable();
            $table->string('assigned_to_name', 120)->nullable();
            $table->string('inquiry_id', 40)->nullable();
            $table->timestamps();

            $table->index(['status', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};
