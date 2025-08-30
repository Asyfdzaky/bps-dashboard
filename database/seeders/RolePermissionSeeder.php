<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $guard = config('auth.defaults.guard', 'web');

        // Permissions
        $permissions = [
            'view roles','create roles','edit roles','delete roles',
            'view users','create users','edit users','delete users',

            'view manuscripts','create manuscripts','edit manuscripts','delete manuscripts','review manuscripts',
            'view books','create books','edit books','delete books','manage book progress',

            'view publishers','create publishers','edit publishers','delete publishers',

            'view tasks','create tasks','edit tasks','delete tasks','assign tasks',

            'view targets','create targets','edit targets','delete targets',

            'view reports','export reports',

            // khusus super admin
            'manage team','manage settings',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => $guard]);
        }

        // Roles inti
        $manajer = Role::firstOrCreate(['name' => 'manajer', 'guard_name' => $guard]);
        $manajer->syncPermissions(Permission::all());

        $produksi = Role::firstOrCreate(['name' => 'produksi', 'guard_name' => $guard]);
        $produksi->syncPermissions([
            'view manuscripts','edit manuscripts','review manuscripts',
            'view books','edit books','manage book progress',
            'view tasks','edit tasks',
            'view targets',
            'view reports',
        ]);

        $penulis = Role::firstOrCreate(['name' => 'penulis', 'guard_name' => $guard]);
        $penulis->syncPermissions([
            'view manuscripts','create manuscripts','edit manuscripts',
            'view books','view tasks','view targets',
        ]);

        $penerjemah = Role::firstOrCreate(['name' => 'penerjemah', 'guard_name' => $guard]);
        $penerjemah->syncPermissions([
            'view manuscripts','edit manuscripts',
            'view books','view tasks','view targets',
        ]);

        // Role tunggal untuk semua penerbit
        $penerbit = Role::firstOrCreate(['name' => 'penerbit', 'guard_name' => $guard]);
        $penerbit->syncPermissions([
            'view manuscripts','create manuscripts','edit manuscripts','delete manuscripts','review manuscripts',
            'view books','create books','edit books','delete books','manage book progress',
            'view tasks','create tasks','edit tasks','delete tasks',
            'view targets','create targets','edit targets','delete targets',
            'view reports','export reports',
        ]);

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
