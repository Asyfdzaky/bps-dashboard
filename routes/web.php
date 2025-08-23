<?php

use App\Http\Controllers\rolePermission\RoleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/manajemen-role', [RoleController::class, 'index'])->name('roles.index')
        ->middleware('role:manajer');
    Route::post('/manajemen-role', [RoleController::class, 'store'])->name('roles.store')
        ->middleware('role:manajer');
    Route::get('/manajemen-role/{id}/edit', [RoleController::class, 'edit'])->name('roles.edit')
        ->middleware('role:manajer');
    Route::put('/manajemen-role/{id}', [RoleController::class, 'update'])->name('roles.update')
        ->middleware('role:manajer');
    Route::delete('/manajemen-role/{id}', [RoleController::class, 'destroy'])->name('roles.destroy')
        ->middleware('role:manajer');

    Route::get('manajemen-tim', function () {
        return Inertia::render('Manajemen-pengguna/manajemen-tim');
    })->name('manajemen-tim')->middleware('role:manajer');

    Route::get('manajemen-pengguna', function () {
        return Inertia::render('Manajemen-pengguna/manajemen-pengguna');
    })->name('manajemen-pengguna')->middleware('role:manajer');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
