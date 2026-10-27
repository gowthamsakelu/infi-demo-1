<?php

namespace Database\Factories;

use App\Models\StayRoom;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<StayRoom> */
class StayRoomFactory extends Factory
{
    protected $model = StayRoom::class;

    public function definition(): array
    {
        return ['name' => 'Standard', 'occupancy' => '2 adults', 'rate_stay' => 3200, 'rate_breakfast' => 3700, 'rate_map' => 4400, 'rate_all' => 5000, 'sort' => 0];
    }
}
