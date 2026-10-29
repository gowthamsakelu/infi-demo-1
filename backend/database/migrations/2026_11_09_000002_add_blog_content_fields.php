<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// What the Blogs card grid and the article view need: a short excerpt, the full content and a cover picture (the path of a file under public/images).
// All nullable: an article without them shows the placeholder cover and no excerpt.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            if (!Schema::hasColumn('blog_posts', 'excerpt')) {
                $table->string('excerpt', 300)->nullable();
            }
            if (!Schema::hasColumn('blog_posts', 'content')) {
                $table->longText('content')->nullable();
            }
            if (!Schema::hasColumn('blog_posts', 'cover')) {
                $table->string('cover', 255)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('blog_posts', fn (Blueprint $t) => $t->dropColumn(['excerpt', 'content', 'cover']));
    }
};
