<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** What each role may do with each module, and a person's own overrides. Admins are never looked up here: they can do everything. */
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role');
            $table->string('module');
            $table->boolean('can_view')->default(false);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->unique(['role', 'module']);
        });

        Schema::create('user_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('module');
            $table->boolean('can_view')->default(false);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->unique(['user_id', 'module']);
        });

        // Starting points for the two non-admin roles: [view, edit, delete] per module.
        $defaults = [
            'sales' => [
                'inquiries' => [1, 1, 0], 'bookings' => [1, 1, 0], 'calendar' => [1, 1, 0], 'team' => [1, 0, 0],
                'catalog' => [1, 0, 0], 'travel' => [1, 0, 0], 'website' => [0, 0, 0], 'system' => [0, 0, 0],
            ],
            'operations' => [
                'inquiries' => [1, 0, 0], 'bookings' => [1, 1, 0], 'calendar' => [1, 1, 0], 'team' => [1, 1, 0],
                'catalog' => [1, 0, 0], 'travel' => [1, 1, 0], 'website' => [0, 0, 0], 'system' => [0, 0, 0],
            ],
        ];
        foreach ($defaults as $role => $modules) {
            foreach ($modules as $module => [$view, $edit, $delete]) {
                DB::table('role_permissions')->insert(['role' => $role, 'module' => $module, 'can_view' => $view, 'can_edit' => $edit, 'can_delete' => $delete]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_permissions');
        Schema::dropIfExists('role_permissions');
    }
};
