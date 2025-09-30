<?php

use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\taskController;
use App\Http\Controllers\TargetController;
use App\Http\Controllers\PenerbitController;
use App\Http\Controllers\naskah\NaskahController;
use App\Http\Controllers\Analitik\AnalitikController;
use App\Http\Controllers\calender\CalenderController;
use App\Http\Controllers\naskah\KirimNaskahController;
use App\Http\Controllers\dashboard\DashboardController;
use App\Http\Controllers\rolePermission\RoleController;
use App\Http\Controllers\rolePermission\TeamController;
use App\Http\Controllers\naskah\ProgresNaskahController;
use App\Http\Controllers\naskah\ApprovalNaskahController;

use App\Http\Controllers\dashboard\DashboardUserController;
use App\Http\Controllers\rolePermission\PenggunaController;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->intended(route('dashboard', absolute: false));
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Grup semua route manajemen-naskah
    Route::get('/approval', [ApprovalNaskahController::class, 'index'])->name('approval-naskah.index');
    Route::get('/approval/{naskah_id}', [ApprovalNaskahController::class, 'show'])->name('approval-naskah.show');
    Route::post('/approval/{naskah_id}/approve', [ApprovalNaskahController::class, 'approve'])->name('approval-naskah.approve');
    Route::post('/approval/{naskah_id}/reject', [ApprovalNaskahController::class, 'reject'])->name('approval-naskah.reject');
    Route::post('/approval/{naskah_id}/review', [ApprovalNaskahController::class, 'review'])->name('approval-naskah.review');
    Route::post('/approval/bulk-action', [ApprovalNaskahController::class, 'bulkAction'])->name('approval-naskah.bulk');
    Route::prefix('manajemen-naskah')->group(function () {
        // Route approval naskah
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
    Route::get('/kirim-naskah/{naskah_id}', [KirimNaskahController::class, 'show'])->name('kirim-naskah.show');


    Route::get('/analitik', [AnalitikController::class, 'index'])->name('analitik');
    // Calendar routes
    Route::get('/calender', [CalenderController::class, 'index'])
        ->name('calender.index')
        ->middleware('role:manajer|penerbit|produksi');
    Route::post('/calendar/events', [CalenderController::class, 'store'])->name('calendar.events.store')->middleware('role:manajer|penerbit|produksi');;
    Route::put('/calendar/events/{id}', [CalenderController::class, 'update'])->name('calendar.events.update')->middleware('role:manajer|penerbit|produksi');;
    Route::delete('/calendar/events/{id}', [CalenderController::class, 'destroy'])->name('calendar.events.destroy')->middleware('role:manajer|penerbit|produksi');;

    Route::get('/target', [TargetController::class, 'index'])->name('target');
    Route::get('/target/create', [TargetController::class, 'create'])->name('target.create');
    Route::post('/target', [TargetController::class, 'store'])->name('target.store');
    Route::get('/target/{year}/{publisherId}/{kategori}/detail', [TargetController::class, 'showYearlyDetail'])->name('target.yearly.detail');
    Route::get('/target/{year}/{publisherId}/{kategori}/edit', [TargetController::class, 'editYearlyTargets'])->name('target.yearly.edit');
    Route::put('/target/{year}/{publisherId}/{kategori}', [TargetController::class, 'updateYearlyTargets'])->name('target.yearly.update');
    Route::delete('/target/{year}/{publisherId}', [TargetController::class, 'destroyYearlyTargets'])->name('target.yearly.destroy');
    Route::get('/target/available-years', [TargetController::class, 'getAvailableYears'])->name('target.availableYears');


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


    Route::get('/manajemen-task', [taskController::class, 'index'])->name('manajemen-task');
    Route::post('/manajemen-task', [taskController::class, 'store'])->name('manajemen-task.store');
    Route::put('/manajemen-task/{id}', [taskController::class, 'update'])->name('manajemen-task.update');
    Route::delete('/manajemen-task/{id}', [taskController::class, 'destroy'])->name('manajemen-task.destroy');
    Route::post('/manajemen-task/reorder', [taskController::class, 'reorder'])->name('manajemen-task.reorder');

    Route::get('/penerbit', [PenerbitController::class, 'index'])->name('penerbit.index');
    Route::get('/penerbit/create', [PenerbitController::class, 'create'])->name('penerbit.create');
    Route::post('/penerbit', [PenerbitController::class, 'store'])->name('penerbit.store');
    Route::get('/penerbit/{id}/edit', [PenerbitController::class, 'edit'])->name('penerbit.edit');
    Route::put('/penerbit/{id}', [PenerbitController::class, 'update'])->name('penerbit.update');
    Route::delete('/penerbit/{id}', [PenerbitController::class, 'destroy'])->name('penerbit.destroy');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
