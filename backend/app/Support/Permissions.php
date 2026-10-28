<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Who may do what. Nine modules, three actions (view, edit, delete).
 * An admin may do everything; anyone else gets their own saved matrix (user_permissions) if they have one, otherwise their role's (role_permissions).
 * A person who is not active (pending or deactivated) may do nothing.
 *
 * Routes: ->middleware(Permissions::can('system', 'view')), which is the Gate middleware written out: "can:module,'system','view'" (the quotes matter: an
 * unquoted word is read as a route parameter). Code: Permissions::allows($user, 'system', 'view').
 */
class Permissions
{
    /** module key => label shown in the matrix */
    public const MODULES = [
        'inquiries' => 'Inquiries',
        'bookings' => 'Bookings',
        'calendar' => 'Calendar',
        'team' => 'Operation Team',
        'catalog' => 'Destinations and Tour Packages',
        'travel' => 'Transport, Stays and Adventures',
        'website' => 'Banners and Blogs',
        'system' => 'Users and Settings',
    ];

    public const ACTIONS = ['view', 'edit', 'delete'];

    /** The sidebar page (key in js/shared/nav.js) => the module that guards it. A page with no module is open to every active user. */
    public const PAGES = [
        'dashboard' => null,
        'inquiries' => 'inquiries',
        'bookings' => 'bookings',
        'calendar' => 'calendar',
        'team' => 'team',
        'destinations' => 'catalog',
        'tour-packages' => 'catalog',
        'transport' => 'travel',
        'stays' => 'travel',
        'adventures' => 'travel',
        'banners' => 'website',
        'blogs' => 'website',
        'users' => 'system',
        'settings' => 'system',
    ];

    public static function allows(?User $user, string $module, string $action = 'view'): bool
    {
        if (!$user || !isset(self::MODULES[$module]) || !in_array($action, self::ACTIONS, true)) {
            return false;
        }

        return self::matrix($user)[$module][$action];
    }

    /** @return array<string, array{view: bool, edit: bool, delete: bool}> every module, whatever the user's role */
    public static function matrix(User $user): array
    {
        $all = fn (bool $on) => array_fill_keys(self::ACTIONS, $on);
        // A database that has not had the access migration yet has no status column: that person is active (nothing is locked that worked before).
        $status = array_key_exists('status', $user->getAttributes()) ? $user->status : 'active';
        if ($status !== 'active') {
            return array_map(fn () => $all(false), self::MODULES);
        }
        // No role column yet (access migration not run): the app behaves as it did before access control existed.
        if ($user->isAdmin() || !array_key_exists('role', $user->getAttributes())) {
            return array_map(fn () => $all(true), self::MODULES);
        }

        $rows = fn (string $table, string $column, mixed $value) => DB::table($table)->where($column, $value)->get()->keyBy('module');
        $own = $rows('user_permissions', 'user_id', $user->id);
        $source = $own->isEmpty() ? $rows('role_permissions', 'role', $user->role) : $own;

        $out = [];
        foreach (self::MODULES as $key => $_) {
            $r = $source->get($key);
            $view = (bool) ($r->can_view ?? false);
            // Editing or deleting without being able to see makes no sense: the matrix is always consistent.
            $out[$key] = ['view' => $view, 'edit' => $view && (bool) ($r->can_edit ?? false), 'delete' => $view && (bool) ($r->can_delete ?? false)];
        }

        return $out;
    }

    /** True when the person's matrix is their own (saved for them) rather than their role's. */
    public static function isCustom(User $user): bool
    {
        return !$user->isAdmin() && DB::table('user_permissions')->where('user_id', $user->id)->exists();
    }

    /** The matrix per sidebar page, for the shell: { 'tour-packages': {view, edit, delete}, ... }. */
    public static function pages(User $user): array
    {
        $matrix = self::matrix($user);
        $active = (array_key_exists('status', $user->getAttributes()) ? $user->status : 'active') === 'active';
        $out = [];
        foreach (self::PAGES as $page => $module) {
            $out[$page] = $module ? $matrix[$module] : array_fill_keys(self::ACTIONS, $active);
        }

        return $out;
    }

    /**
     * Save a full matrix for one person. Edit and delete only count where view is on.
     *
     * @param  array<string, array{view?: bool, edit?: bool, delete?: bool}>  $matrix
     */
    public static function save(User $user, array $matrix): void
    {
        DB::transaction(function () use ($user, $matrix) {
            DB::table('user_permissions')->where('user_id', $user->id)->delete();
            foreach (self::MODULES as $key => $_) {
                $m = $matrix[$key] ?? [];
                $view = !empty($m['view']);
                DB::table('user_permissions')->insert([
                    'user_id' => $user->id, 'module' => $key,
                    'can_view' => $view, 'can_edit' => $view && !empty($m['edit']), 'can_delete' => $view && !empty($m['delete']),
                ]);
            }
        });
    }

    /** The route middleware that lets only people with this access through (403 for everyone else): ->middleware(Permissions::can('system', 'view')). */
    public static function can(string $module, string $action = 'view'): string
    {
        return "can:module,'{$module}','{$action}'";
    }

    /** Defines the 'module' gate: Gate::allows('module', ['system', 'view']) and the route middleware above. */
    public static function registerGate(): void
    {
        Gate::define('module', fn (?User $user, string $module, string $action = 'view') => self::allows($user, $module, $action));
    }
}
