<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Schema;

class User extends Authenticatable
{
    use HasFactory;

    public const ROLES = ['admin' => 'Admin', 'sales' => 'Sales', 'operations' => 'Operations'];
    public const STATUSES = ['active', 'pending', 'inactive'];

    protected $fillable = ['name', 'email', 'password', 'role', 'title', 'phone', 'status', 'last_active_at'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'last_active_at' => 'datetime', 'password' => 'hashed'];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * The person the one-press demo login signs in as: the owner, an admin with full access.
     * Created on first use, with a password nobody knows. (Before the access columns exist it still works: it only sets them when they do.)
     */
    public static function demo(): self
    {
        $access = Schema::hasColumn('users', 'role') ? ['role' => 'admin', 'title' => 'Owner', 'status' => 'active'] : [];

        return static::firstOrCreate(
            ['email' => config('auth.demo_email')],
            ['name' => config('auth.demo_name'), 'password' => str()->random(40)] + $access,
        );
    }
}
