<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Indexes for the catalog pages' list queries (filter by status / city / destination, order by rank or position). Each one is added only if the
// table exists and does not have it yet, so running this on any database is safe.
return new class extends Migration
{
    /** table => [index name => columns] */
    private const INDEXES = [
        'destinations' => ['destinations_status_index' => ['status']],
        'tour_packages' => ['tour_packages_destination_status_index' => ['destination_id', 'status'], 'tour_packages_seasonal_index' => ['seasonal']],
        'stay_rooms' => ['stay_rooms_hotel_sort_index' => ['saved_hotel_id', 'sort']],
        'saved_hotels' => ['saved_hotels_city_tag_index' => ['city', 'tag']],
        'saved_activities' => ['saved_activities_city_tag_index' => ['city', 'tag']],
        'vehicle_types' => ['vehicle_types_rank_index' => ['popularity_rank']],
        'banners' => ['banners_position_index' => ['position']],
        'blog_posts' => ['blog_posts_status_published_index' => ['status', 'published_at']],
        'inquiries' => ['inquiries_created_at_index' => ['created_at']],
    ];

    public function up(): void
    {
        foreach (self::INDEXES as $table => $indexes) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            foreach ($indexes as $name => $columns) {
                if (Schema::hasIndex($table, $name) || array_filter($columns, fn ($c) => !Schema::hasColumn($table, $c))) {
                    continue;
                }
                Schema::table($table, fn (Blueprint $t) => $t->index($columns, $name));
            }
        }
    }

    public function down(): void
    {
        foreach (self::INDEXES as $table => $indexes) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            foreach (array_keys($indexes) as $name) {
                if (Schema::hasIndex($table, $name)) {
                    Schema::table($table, fn (Blueprint $t) => $t->dropIndex($name));
                }
            }
        }
    }
};
