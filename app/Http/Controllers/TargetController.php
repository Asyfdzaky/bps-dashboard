<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Target;
use App\Models\Manuscript;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TargetController extends Controller
{
    /**
     * Display the target analysis page.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Base query for books with publisher filtering
        $booksQuery = Book::query();
        $targetQuery = Target::query();
        
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            $booksQuery = $booksQuery->where('penerbit_id', $user->penerbit_id);
            $targetQuery = $targetQuery->where('penerbit_id', $user->penerbit_id);
        }
        
        // 1. Metrik Utama - ambil dari request atau default ke current
        $currentYear = $request->get('year', now()->year);
        $currentMonth = $request->get('month', now()->month);
        
        // Progres Tahunan (67% dari target)
        $totalTargetYearly = $targetQuery->clone()
            ->where('tahun', $currentYear)
            ->where('tipe_target', 'tahunan')
            ->sum('jumlah_target');
        $totalRealizedYearly = $booksQuery->clone()
            ->whereYear('tanggal_realisasi_naik_cetak', $currentYear)
            ->where('status_keseluruhan', 'published')
            ->count();
        $progresTahunan = $totalTargetYearly > 0 ? round(($totalRealizedYearly / $totalTargetYearly) * 100) : 0;
        
        // Pencapaian vs Target (YTD) - 80 dari 120 target
        $targetYTD = $targetQuery->clone()
            ->where('tahun', $currentYear)
            ->where('tipe_target', 'bulanan')
            ->where('bulan', '<=', $currentMonth)
            ->sum('jumlah_target');
        $realizedYTD = $booksQuery->clone()
            ->whereYear('tanggal_realisasi_naik_cetak', $currentYear)
            ->whereMonth('tanggal_realisasi_naik_cetak', '<=', $currentMonth)
            ->where('status_keseluruhan', 'published')
            ->count();
        
        // Rata-rata Buku/Bulan - 10 realisasi
        $avgBooksPerMonth = $currentMonth > 0 ? round($realizedYTD / $currentMonth) : 0;
        
        // 2. Data untuk Chart Target Akuisisi (4 bulan terakhir dari filter yang dipilih)
        $acquisitionData = [];
        $baseDate = Carbon::create($currentYear, $currentMonth, 1);
        
        for ($i = 3; $i >= 0; $i--) {
            $month = $baseDate->copy()->subMonths($i);
            $monthName = $month->format('M');
            $monthNumber = $month->month;
            $year = $month->year;
            
            // Target Akuisisi (dari tabel targets)
            $targetAkuisisi = $targetQuery->clone()
                ->where('tahun', $year)
                ->where('bulan', $monthNumber)
                ->where('tipe_target', 'bulanan')
                ->sum('jumlah_target');
            
            // Realisasi Terbit (buku yang selesai)
            $realisasiTerbit = $booksQuery->clone()
                ->whereYear('tanggal_realisasi_naik_cetak', $year)
                ->whereMonth('tanggal_realisasi_naik_cetak', $monthNumber)
                ->where('status_keseluruhan', 'published')
                ->count();
            
            // Naskah Masuk (manuscript yang masuk)
            $naskahMasuk = Manuscript::whereYear('tanggal_masuk', $year)
                ->whereMonth('tanggal_masuk', $monthNumber)
                ->count();
            
            // Naskah Ditolak (manuscript dengan status ditolak)
            $naskahDitolak = Manuscript::whereYear('tanggal_masuk', $year)
                ->whereMonth('tanggal_masuk', $monthNumber)
                ->where('status', 'ditolak')
                ->count();
            
            $acquisitionData[] = [
                'month' => $monthName,
                'target_akuisisi' => $targetAkuisisi,
                'realisasi_terbit' => $realisasiTerbit,
                'naskah_masuk' => $naskahMasuk,
                'naskah_ditolak' => $naskahDitolak,
            ];
        }
        
        // 3. Data untuk Chart Progress vs Target Bulanan
        $monthlyProgressData = [];
        for ($i = 3; $i >= 0; $i--) {
            $month = $baseDate->copy()->subMonths($i);
            $monthName = $month->format('M');
            $monthNumber = $month->month;
            $year = $month->year;
            
            // Target bulanan
            $targetBulanan = $targetQuery->clone()
                ->where('tahun', $year)
                ->where('bulan', $monthNumber)
                ->where('tipe_target', 'bulanan')
                ->sum('jumlah_target');
            
            // Selesai (buku yang selesai di bulan tersebut)
            $selesai = $booksQuery->clone()
                ->whereYear('tanggal_realisasi_naik_cetak', $year)
                ->whereMonth('tanggal_realisasi_naik_cetak', $monthNumber)
                ->where('status_keseluruhan', 'published')
                ->count();
            
            $monthlyProgressData[] = [
                'month' => $monthName,
                'target' => $targetBulanan,
                'selesai' => $selesai,
            ];
        }
        
        // 4. Data untuk dropdown filter
        $availableMonths = collect(range(1, 12))->map(function ($month) {
            return [
                'value' => $month,
                'label' => Carbon::create()->month($month)->format('F')
            ];
        });
        
        $availableYears = collect(range($currentYear - 2, $currentYear + 1))->map(function ($year) {
            return [
                'value' => $year,
                'label' => $year
            ];
        });
        
        return Inertia::render('target/page', [
            'metrics' => [
                'progresTahunan' => $progresTahunan,
                'pencapaianYTD' => $realizedYTD,
                'targetYTD' => $targetYTD,
                'avgBooksPerMonth' => $avgBooksPerMonth,
            ],
            'acquisitionData' => $acquisitionData,
            'monthlyProgressData' => $monthlyProgressData,
            'filters' => [
                'months' => $availableMonths,
                'years' => $availableYears,
                'selectedMonth' => $currentMonth,
                'selectedYear' => $currentYear,
            ],
            'userPublisher' => $user && $user->hasPublisherRole() ? $user->publisher : null,
        ]);
    }
}
