<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // pastikan role ada
        foreach (['manajer', 'produksi', 'penulis', 'penerjemah'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // buat user default
        $users = [
            ['nama_lengkap' => 'Manajer BPS', 'email' => 'manajer@bps.com', 'role' => 'manajer'],
            ['nama_lengkap' => 'Staff Produksi', 'email' => 'produksi@bps.com', 'role' => 'produksi'],
            ['nama_lengkap' => 'Penulis Sample', 'email' => 'penulis@bps.com', 'role' => 'penulis'],
            ['nama_lengkap' => 'Penerjemah Sample', 'email' => 'penerjemah@bps.com', 'role' => 'penerjemah'],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'nama_lengkap' => $data['nama_lengkap'],
                    'password' => Hash::make('password'),
                ]
            );

            if (!$user->hasRole($data['role'])) {
                $user->assignRole($data['role']);
            }
        }

        // Jalankan BukuSeeder setelah user dibuat
        $this->call(BukuSeeder::class);
    }
}
