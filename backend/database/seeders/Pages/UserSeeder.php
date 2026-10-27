<?php

namespace Database\Seeders\Pages;

use App\Models\User;
use Illuminate\Database\Seeder;

/** The team for Users & Permissions. Karan is the owner and the demo login (an admin); passwords are random: nobody signs in as the others yet. */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        // name, email, role, title, status, last active
        $team = [
            ['Riya Sharma', 'riya@ruyitravels.com', 'sales', 'Sales Executive', 'active', $now->copy()->subMinutes(5)],
            [config('auth.demo_name'), config('auth.demo_email'), 'admin', 'Owner', 'active', $now->copy()],
            ['Aman Joshi', 'aman@ruyitravels.com', 'sales', 'Sales Executive', 'active', $now->copy()->subHour()],
            ['Neha Gupta', 'neha@ruyitravels.com', 'operations', 'Operations Executive', 'active', $now->copy()->subDay()],
            ['Vikas Rao', 'vikas@ruyitravels.com', 'operations', 'Operations Executive', 'active', $now->copy()->subDays(3)],
            ['Pooja Nair', 'pooja@ruyitravels.com', 'sales', 'Sales Executive', 'pending', null],
        ];

        foreach ($team as [$name, $email, $role, $title, $status, $last]) {
            $user = User::firstOrNew(['email' => $email]);
            if (!$user->exists) {
                $user->password = str()->random(40);
            }
            $user->fill(['name' => $name, 'role' => $role, 'title' => $title, 'status' => $status, 'last_active_at' => $last])->save();
        }
    }
}
