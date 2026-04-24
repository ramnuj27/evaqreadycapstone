<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'CDRRMO Admin',
                'email' => 'admin@cdrrmo.com',
                'password' => Hash::make('admin123'),
                'role' => 'CDRRMO Admin',
                'barangay' => null,
                'contact_number' => '09123456789',
            ],
            [
                'name' => 'Dahican Committee',
                'email' => 'committee@dahican.com',
                'password' => Hash::make('committee123'),
                'role' => 'Barangay Committee',
                'barangay' => 'Dahican',
                'contact_number' => '09234567890',
            ],
            [
                'name' => 'Sainz Committee',
                'email' => 'committee@sainz.com',
                'password' => Hash::make('committee123'),
                'role' => 'Barangay Committee',
                'barangay' => 'Sainz',
                'contact_number' => '09345678901',
            ],
            [
                'name' => 'Operator User',
                'email' => 'operator@evaqready.com',
                'password' => Hash::make('operator123'),
                'role' => 'Operator',
                'barangay' => null,
                'contact_number' => '09456789012',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
