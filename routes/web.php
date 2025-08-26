<?php

use App\Http\Controllers\rolePermission\RoleController;
use App\Http\Controllers\rolePermission\TeamController;
use App\Http\Controllers\dashboard\BukuController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [BukuController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/book/{id}', [BukuController::class, 'show'])->name('dashboard.book.show');
    Route::get('/dashboard/book/{id}/edit', [BukuController::class, 'edit'])->name('dashboard.book.edit');
    Route::put('/dashboard/book/{id}', [BukuController::class, 'update'])->name('dashboard.book.update');
    Route::delete('/dashboard/book/{id}', [BukuController::class, 'destroy'])->name('dashboard.book.destroy');

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

    Route::get('manajemen-tim', [TeamController::class, 'index'])->name('manajemen-tim')->middleware('role:manajer');
    Route::post('manajemen-tim', [TeamController::class, 'store'])->name('manajemen-tim.store')->middleware('role:manajer');
    Route::put('manajemen-tim/{id}', [TeamController::class, 'update'])->name('manajemen-tim.update')->middleware('role:manajer');
    Route::delete('manajemen-tim/{id}', [TeamController::class, 'destroy'])->name('manajemen-tim.destroy')->middleware('role:manajer');

    Route::get('manajemen-pengguna', function () {
        return Inertia::render('Manajemen-pengguna/manajemen-pengguna');
    })->name('manajemen-pengguna')->middleware('role:manajer');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
