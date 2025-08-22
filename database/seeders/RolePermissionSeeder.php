<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',
            
            // Manuscript management
            'view manuscripts',
            'create manuscripts',
            'edit manuscripts',
            'delete manuscripts',
            'review manuscripts',
            
            // Book management
            'view books',
            'create books',
            'edit books',
            'delete books',
            'manage book progress',
            
            // Publisher management
            'view publishers',
            'create publishers',
            'edit publishers',
            'delete publishers',
            
            // Task management
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'assign tasks',
            
            // Target management
            'view targets',
            'create targets',
            'edit targets',
            'delete targets',
            
            // Reports
            'view reports',
            'export reports',
        ];

        // Create permissions if they don't exist
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $manajerRole = Role::firstOrCreate(['name' => 'manajer']);
        $manajerRole->syncPermissions(Permission::all());

        $produksiRole = Role::firstOrCreate(['name' => 'produksi']);
        $produksiRole->syncPermissions([
            'view manuscripts',
            'edit manuscripts',
            'review manuscripts',
            'view books',
            'edit books',
            'manage book progress',
            'view tasks',
            'edit tasks',
            'view targets',
            'view reports'
        ]);

        $penulisRole = Role::firstOrCreate(['name' => 'penulis']);
        $penulisRole->syncPermissions([
            'view manuscripts',
            'create manuscripts',
            'edit manuscripts',
            'view books',
            'view tasks',
            'view targets'
        ]);

        $penerjemahRole = Role::firstOrCreate(['name' => 'penerjemah']);
        $penerjemahRole->syncPermissions([
            'view manuscripts',
            'edit manuscripts',
            'view books',
            'view tasks',
            'view targets'
        ]);
    }
}
