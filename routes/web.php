<?php

use App\Http\Controllers\dashboard\DashboardController;
use App\Http\Controllers\naskah\NaskahController;
use App\Http\Controllers\rolePermission\RoleController;
use App\Http\Controllers\rolePermission\TeamController;
use App\Http\Controllers\rolePermission\PenggunaController;
use App\Http\Controllers\naskah\ProgresNaskahController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::get('/manajemen-naskah', [NaskahController::class, 'index'])->name('manajemen-naskah');
    Route::get('/manajemen-naskah/{id}', [NaskahController::class, 'show'])->name('manajemen-naskah.show');
    Route::get('/manajemen-naskah/{id}/edit', [NaskahController::class, 'edit'])->name('manajemen-naskah.edit');
    Route::put('/manajemen-naskah/{id}', [NaskahController::class, 'update'])->name('manajemen-naskah.update');
    Route::delete('/manajemen-naskah/{id}', [NaskahController::class, 'destroy'])->name('manajemen-naskah.destroy');





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
    

    Route::get('manajemen-pengguna', [PenggunaController::class, 'index'])->name('manajemen-pengguna')->middleware('role:manajer');
    Route::post('manajemen-pengguna', [PenggunaController::class, 'store'])->name('manajemen-pengguna.store')->middleware('role:manajer');
    Route::put('manajemen-pengguna/{id}', [PenggunaController::class, 'update'])->name('manajemen-pengguna.update')->middleware('role:manajer');
    Route::delete('manajemen-pengguna/{id}', [PenggunaController::class, 'destroy'])->name('manajemen-pengguna.destroy')->middleware('role:manajer');

    Route::get('progres-naskah', [ProgresNaskahController::class, 'index'])->name('progres-naskah')->middleware('role:manajer');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
