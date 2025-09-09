<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\naskah\NaskahController;
use App\Http\Controllers\naskah\ApprovalNaskahController;
use App\Http\Controllers\Analitik\AnalitikController;
use App\Http\Controllers\calender\CalenderController;
use App\Http\Controllers\dashboard\DashboardController;
use App\Http\Controllers\rolePermission\RoleController;
use App\Http\Controllers\rolePermission\TeamController;
use App\Http\Controllers\naskah\ProgresNaskahController;
use App\Http\Controllers\dashboard\DashboardUserController;
use App\Http\Controllers\rolePermission\PenggunaController;
use App\Http\Controllers\naskah\KirimNaskahController;

use App\Http\Controllers\TargetController;

Route::get('/', function () {
    if(Auth::check()) {
        return redirect()->intended(route('dashboard', absolute: false));
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

   // Grup semua route manajemen-naskah
    Route::prefix('manajemen-naskah')->group(function () {
        // Route approval naskah
        Route::get('/approval', [ApprovalNaskahController::class, 'index'])->name('approval-naskah.index');
        Route::get('/approval/{naskahId}', [ApprovalNaskahController::class, 'show'])->name('approval-naskah.show');
        Route::post('/approval/{naskahId}/approve', [ApprovalNaskahController::class, 'approve'])->name('approval-naskah.approve');
        Route::post('/approval/{naskahId}/reject', [ApprovalNaskahController::class, 'reject'])->name('approval-naskah.reject');
        Route::post('/approval/bulk-action', [ApprovalNaskahController::class, 'bulkAction'])->name('approval-naskah.bulk');
        // Route CRUD dasar manajemen naskah
        Route::get('/', [NaskahController::class, 'index'])->name('manajemen-naskah');
        Route::get('/create', [NaskahController::class, 'create'])->name('manajemen-naskah.create');
        Route::post('/', [NaskahController::class, 'store'])->name('manajemen-naskah.store');
        Route::get('/{id}', [NaskahController::class, 'show'])->name('manajemen-naskah.show');
        Route::get('/{id}/edit', [NaskahController::class, 'edit'])->name('manajemen-naskah.edit');
        Route::put('/{id}', [NaskahController::class, 'update'])->name('manajemen-naskah.update');
        Route::delete('/{id}', [NaskahController::class, 'destroy'])->name('manajemen-naskah.destroy');
        
    });

    Route::get('/kirim-naskah', [KirimNaskahController::class, 'index'])->name('kirim-naskah');
    Route::post('/kirim-naskah', [KirimNaskahController::class, 'store'])->name('kirim-naskah.store');
    Route::get('/kirim-naskah/{id}', [KirimNaskahController::class, 'show'])->name('kirim-naskah.show');


    Route::get('/analitik', [AnalitikController::class, 'index'])->name('analitik');
    Route::get('/calender', [CalenderController::class, 'index'])->name('calender');
    Route::get('/target', [TargetController::class, 'index'])->name('target');



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

    Route::get('progres-naskah', [ProgresNaskahController::class, 'index'])->name('progres-naskah');
    
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
