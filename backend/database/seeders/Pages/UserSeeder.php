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
            ['Rahul Mehta', 'rahul.mehta@ruyitra.com', 'operations', 'Tour Operations Manager', 'active', $now->copy()],
            ['Priya Sharma', 'priya.sharma@ruyitra.com', 'operations', 'Trip Coordinator', 'active', $now->copy()->subMinutes(5)],
            ['Amit Patel', 'amit.patel@ruyitra.com', 'sales', 'Senior Dispatch Lead', 'active', $now->copy()->subHour()],
            ['Vikram Sethi', 'vikram.sethi@ruyitra.com', 'sales', 'Fleet & Logistics Lead', 'active', $now->copy()->subDay()],
            ['Karan Sapalia', config('auth.demo_email') ?: 'karan.sapalia@ruyitra.com', 'admin', 'Head of Operations', 'active', $now->copy()->subDays(2)],
            ['Deepak Chopra', 'deepak.chopra@ruyitra.com', 'sales', 'Sales Executive', 'pending', null],
        ];

        foreach ($team as [$name, $email, $role, $title, $status, $last]) {
            $user = User::firstOrNew(['email' => $email]);
            if (!$user->exists) {
                $user->password = str()->random(40);
            }
            $user->fill(['name' => $name, 'role' => $role, 'title' => $title, 'status' => $status, 'last_active_at' => $last])->save();
        }

        foreach ($team as [$name, $email, $role, $title, $status, $last]) {
            $user = User::firstOrNew(['email' => $email]);
            if (!$user->exists) {
                $user->password = str()->random(40);
            }
            $user->fill(['name' => $name, 'role' => $role, 'title' => $title, 'status' => $status, 'last_active_at' => $last])->save();
        }
    }
}
