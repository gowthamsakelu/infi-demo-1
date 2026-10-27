<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Users & Permissions: who a person is on the team and whether they can sign in.
     * New users are plain team members ('sales'); the people who already exist when this runs (the owner, the demo user) become admins,
     * so nothing that works today gets locked.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('sales')->after('password');       // admin | sales | operations
            $table->string('title')->nullable()->after('role');               // "Sales Executive"
            $table->string('phone')->nullable()->after('title');
            $table->string('status')->default('active')->after('phone');      // active | pending | inactive
            $table->timestamp('last_active_at')->nullable()->after('status');
        });

        DB::table('users')->update(['role' => 'admin', 'title' => 'Owner']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'title', 'phone', 'status', 'last_active_at']);
        });
    }
};
