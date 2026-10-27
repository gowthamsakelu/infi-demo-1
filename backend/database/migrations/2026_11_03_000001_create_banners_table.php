<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Website banners. The state shown on the page is derived: switched off = draft, switched on with a start date in the future = scheduled,
 * otherwise active. `image` is a file name under public/images; `tone` picks the fallback gradient when the file is missing.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);                  // internal name: "Kashmir Winter Special"
            $table->string('headline', 120);              // the words on the banner
            $table->string('cta', 120)->nullable();       // call to action: "Book from ₹15,000"
            $table->string('image', 255)->nullable();     // file under public/images
            $table->string('tone', 20)->default('blue');  // fallback gradient
            $table->string('placement', 60)->default('Home hero');
            $table->unsignedSmallInteger('slot')->nullable();
            $table->unsignedInteger('position')->default(0); // order on the website
            $table->boolean('is_active')->default(false);
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->unsignedInteger('clicks')->default(0);
            $table->unsignedInteger('leads')->default(0);
            $table->unsignedInteger('converted')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
