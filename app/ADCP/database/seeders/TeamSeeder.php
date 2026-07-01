<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Team;
use App\Models\User;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user1 = User::where('email', 'user1@example.com')->first();
        $user2 = User::where('email', 'user2@example.com')->first();
        $user3 = User::where('email', 'user3@example.com')->first();

        //チーム1：user1がowner、user2がmember
        $team1 = Team::create([
            'name' => 'テストチーム1',
            'created_by' => $user1->id,
        ]);
        $team1->members()->attach($user1->id, ['role' => 'owner']);
        $team1->members()->attach($user2->id, ['role' => 'member']);
        

        //チーム2：user2がowner、user3がmember
        $team2 = Team::create([
            'name' => 'テストチーム2',
            'created_by' => $user2->id,
        ]);
        $team2->members()->attach($user2->id, ['role' => 'owner']);
        $team2->members()->attach($user3->id, ['role' => 'member']);
    }
}
