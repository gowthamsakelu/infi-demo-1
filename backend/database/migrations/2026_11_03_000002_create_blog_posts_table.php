<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Blog articles with the numbers the page reports: views in the last 30 days, leads that started on the article, and how many became bookings. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('slug', 220)->unique();
            $table->string('author', 80);
            $table->string('category', 20)->default('guide'); // guide | itinerary | tips
            $table->string('status', 12)->default('draft');    // published | draft | scheduled
            $table->timestamp('published_at')->nullable();      // when it went live, or will
            $table->unsignedInteger('views')->default(0);       // last 30 days
            $table->unsignedInteger('leads')->default(0);
            $table->unsignedInteger('converted')->default(0);
            $table->timestamps();

            $table->index(['status', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
