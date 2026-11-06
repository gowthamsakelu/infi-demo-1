<?php

namespace Database\Seeders\Pages;

use App\Models\User;
use App\Support\Permissions;
use Illuminate\Database\Seeder;

/** The team for Users & Permissions. Gautham is the owner and administrator (ADM_18 from production). */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        // Baseline team for UsersTest assertions:
        $team = [
            ['Gautham', config('auth.demo_email') ?: 'sa08gautam23@gmail.com', 'admin', 'Lead Operations & Super Administrator', 'active', $now->copy(), ['ALL']],
            ['Rahul Mehta', 'rahul.mehta@ruyitra.com', 'operations', 'Tour Operations Manager', 'active', $now->copy()->subMinutes(15), ['inquiries', 'bookings', 'calendar', 'team', 'catalog', 'travel']],
            ['Priya Sharma', 'priya.sharma@ruyitra.com', 'operations', 'Trip Coordinator', 'active', $now->copy()->subMinutes(45), ['inquiries', 'bookings', 'calendar', 'team', 'travel']],
            ['Amit Patel', 'amit.patel@ruyitra.com', 'sales', 'Senior Dispatch Lead', 'active', $now->copy()->subHour(), ['inquiries', 'bookings', 'travel']],
            ['Vikram Sethi', 'vikram.sethi@ruyitra.com', 'sales', 'Fleet & Logistics Lead', 'active', $now->copy()->subDay(), ['travel', 'bookings']],
            ['Deepak Chopra', 'deepak.chopra@ruyitra.com', 'sales', 'Sales Executive', 'pending', null, []],
        ];

        // Production users from Ruyi Travels live admin panel (ADM_1 to ADM_18):
        if (!app()->runningUnitTests()) {
            $genuine = [
                ['Akash Barai', 'baraianand333@gmail.com', 'admin', 'System Administrator (ADM_3)', 'active', $now->copy()->subDays(1), ['ALL']],
                ['Dilawar Ahad khan', 'khandilawar10000@gmail.com', 'operations', 'Operations & Logistics Manager (ADM_17)', 'active', $now->copy()->subHours(3), ['catalog', 'travel']],
                ['NAZMA BANU', 'nazma.banu@ruyitravels.com', 'operations', 'Senior Content & Tour Coordinator (ADM_15)', 'active', $now->copy()->subHours(6), ['website', 'catalog', 'travel']],
                ['Yousuf K H', 'yousuf.kh@ruyitra.com', 'admin', 'Executive Director (ADM_13)', 'active', $now->copy()->subDays(2), ['ALL']],
                ['Yusuf', 'yusuf@ruyitra.com', 'admin', 'Operations Lead (ADM_5)', 'active', $now->copy()->subDays(3), ['ALL']],
                ['User', 'ops.user@ruyitra.com', 'sales', 'Customer Support Specialist (ADM_10)', 'active', $now->copy()->subDays(4), ['catalog', 'travel']],
                ['Altaf Husain Malik', 'Explosurejourney@gmail.com', 'sales', 'Tour Specialist (ADM_11)', 'inactive', null, ['website', 'catalog']],
                ['Maaz', 'maaz@anetazo.com', 'sales', 'Technical Associate (ADM_4)', 'inactive', null, ['ALL']],
                ['Monika Nimje', 'monikaninje@gmail.com', 'sales', 'Travel Consultant (ADM_8)', 'inactive', null, ['catalog', 'travel', 'inquiries']],
                ['Nazma Banu', 'nazmabanu234@gmail.com', 'sales', 'Operations Coordinator (ADM_14)', 'inactive', null, ['catalog', 'travel', 'website']],
                ['Rabia Khan', 'rk7517786625@gmail.com', 'sales', 'Blog Editor (ADM_9)', 'inactive', null, ['website']],
                ['Raees Shaikh', 'skraees79@gmail.com', 'sales', 'Operations Support (ADM_2)', 'inactive', null, ['ALL']],
                ['Raeesa bi Shaikh', 'xecraeesa@gmail.com', 'sales', 'Content Associate (ADM_7)', 'inactive', null, ['website', 'catalog', 'travel']],
                ['saulihean', 'qazisaulihean27@gmail.com', 'sales', 'Destination Assistant (ADM_16)', 'inactive', null, ['catalog', 'travel']],
                ['Yusuf Shaikh', 'yusufshaikh7044@gmail.com', 'sales', 'Logistics Associate (ADM_6)', 'inactive', null, ['ALL']],
            ];
            $team = array_merge($team, $genuine);
        }

        foreach ($team as [$name, $email, $role, $title, $status, $last, $access]) {
            $user = User::firstOrNew(['email' => $email]);
            if (!$user->exists) {
                $user->password = str()->random(40);
            }
            $user->fill(['name' => $name, 'role' => $role, 'title' => $title, 'status' => $status, 'last_active_at' => $last])->save();

            // Populate specific permissions if not admin
            if ($role !== 'admin' && !empty($access)) {
                $matrix = [];
                foreach (Permissions::MODULES as $mod => $_) {
                    $has = in_array('ALL', $access, true) || in_array($mod, $access, true);
                    $matrix[$mod] = ['view' => $has, 'edit' => $has, 'delete' => false];
                }
                Permissions::save($user, $matrix);
            }
        }
    }
}
