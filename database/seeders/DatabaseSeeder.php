<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a single admin user
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@zaylabs.com',
            'password' => 'password',
            'role' => 'Admin',
        ]);
    }
}
