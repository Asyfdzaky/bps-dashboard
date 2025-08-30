<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Publisher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $guard = config('auth.defaults.guard', 'web');

        // Default users
        $users = [
            ['nama_lengkap' => 'Manajer BPS',     'email' => 'manajer@bps.com',   'role' => 'manajer'],
            ['nama_lengkap' => 'Staff Produksi',  'email' => 'produksi@bps.com',  'role' => 'produksi'],
            ['nama_lengkap' => 'Penulis Sample',  'email' => 'penulis@bps.com',   'role' => 'penulis'],
            ['nama_lengkap' => 'Penerjemah Sample','email' => 'penerjemah@bps.com','role' => 'penerjemah'],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'nama_lengkap' => $data['nama_lengkap'],
                    'password'     => Hash::make('password'),
                ]
            );
            $user->syncRoles([$data['role']]);
        }

        // Pastikan penerbit ada (kalau belum dibuat di BukuSeeder)
        $publishers = [
            'Renebook','Turos Pustaka','Reneluv','Renekids','Milestone'
        ];
        foreach ($publishers as $p) {
            Publisher::firstOrCreate(['nama_penerbit' => $p]);
        }

        // Buat user untuk tiap penerbit
        $publisherUsers = [
            ['nama_lengkap' => 'PIC Renebook',      'email' => 'renebook@bps.com',   'publisher' => 'Renebook'],
            ['nama_lengkap' => 'PIC Turos Pustaka', 'email' => 'turos@bps.com',      'publisher' => 'Turos Pustaka'],
            ['nama_lengkap' => 'PIC Reneluv',       'email' => 'reneluv@bps.com',    'publisher' => 'Reneluv'],
            ['nama_lengkap' => 'PIC Renekids',      'email' => 'renekids@bps.com',   'publisher' => 'Renekids'],
            ['nama_lengkap' => 'PIC Milestone',     'email' => 'milestone@bps.com',  'publisher' => 'Milestone'],
        ];

        foreach ($publisherUsers as $data) {
            $publisher = Publisher::where('nama_penerbit', $data['publisher'])->first();

            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'nama_lengkap' => $data['nama_lengkap'],
                    'password'     => Hash::make('password'),
                    'penerbit_id'  => $publisher->penerbit_id,
                ]
            );
            $user->syncRoles(['penerbit']);
        }

        // Jalankan seeder lain
        $this->call(BukuSeeder::class);
    }
}
