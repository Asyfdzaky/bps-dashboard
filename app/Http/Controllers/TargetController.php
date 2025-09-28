<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Target;
use App\Models\Manuscript;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
        
        // Get filter kategori dari request
        $kategori = $request->get('kategori', 'target_terbit');
        
        // Progres Tahunan (67% dari target)
        $totalTargetYearly = $targetQuery->clone()
            ->where('tahun', $currentYear)
            ->where('tipe_target', 'tahunan')
            ->where('kategori', $kategori)
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
            ->where('kategori', $kategori)
            ->where('bulan', '<=', $currentMonth)
            ->sum('jumlah_target');
        $realizedYTD = $booksQuery->clone()
            ->whereYear('tanggal_realisasi_naik_cetak', $currentYear)
            ->whereMonth('tanggal_realisasi_naik_cetak', '<=', $currentMonth)
            ->where('status_keseluruhan', 'published')
            ->count();
        
        // Rata-rata Buku/Bulan - 10 realisasi
        $avgBooksPerMonth = $currentMonth > 0 ? round($realizedYTD / $currentMonth) : 0;
        
        // 2. Data untuk Chart Target Akuisisi (semua data untuk client-side filtering)
        $acquisitionData = [];
        
        // Get all available years and months from targets
        $availableYears = $targetQuery->clone()
            ->where('kategori', $kategori)
            ->distinct()
            ->pluck('tahun')
            ->sort()
            ->values();
            
        $availableMonths = $targetQuery->clone()
            ->where('kategori', $kategori)
            ->where('tipe_target', 'bulanan')
            ->distinct()
            ->pluck('bulan')
            ->sort()
            ->values();
        
        // Generate data for all available months
        foreach ($availableYears as $year) {
            foreach ($availableMonths as $monthNumber) {
                $monthName = Carbon::create()->month($monthNumber)->format('M');
                
                // Target Akuisisi (dari tabel targets)
                $targetAkuisisi = $targetQuery->clone()
                    ->where('tahun', $year)
                    ->where('bulan', $monthNumber)
                    ->where('tipe_target', 'bulanan')
                    ->where('kategori', $kategori)
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
                    'year' => $year,
                    'month' => $monthNumber,
                    'monthName' => $monthName,
                    'target_akuisisi' => $targetAkuisisi,
                    'realisasi_terbit' => $realisasiTerbit,
                    'naskah_masuk' => $naskahMasuk,
                    'naskah_ditolak' => $naskahDitolak,
                ];
            }
        }
        
        // 3. Data untuk Chart Progress vs Target Bulanan (semua data untuk client-side filtering)
        $monthlyProgressData = [];
        
        // Generate data for all available months
        foreach ($availableYears as $year) {
            foreach ($availableMonths as $monthNumber) {
                $monthName = Carbon::create()->month($monthNumber)->format('M');
                
                // Target bulanan
                $targetBulanan = $targetQuery->clone()
                    ->where('tahun', $year)
                    ->where('bulan', $monthNumber)
                    ->where('tipe_target', 'bulanan')
                    ->where('kategori', $kategori)
                    ->sum('jumlah_target');
                
                // Selesai (buku yang selesai di bulan tersebut)
                $selesai = $booksQuery->clone()
                    ->whereYear('tanggal_realisasi_naik_cetak', $year)
                    ->whereMonth('tanggal_realisasi_naik_cetak', $monthNumber)
                    ->where('status_keseluruhan', 'published')
                    ->count();
                
                $monthlyProgressData[] = [
                    'year' => $year,
                    'month' => $monthNumber,
                    'monthName' => $monthName,
                    'target' => $targetBulanan,
                    'selesai' => $selesai,
                ];
            }
        }
        
        // 4. Data untuk dropdown filter - ambil dari data aktual di database
        // Get available months from targets
        $availableMonthsFromDB = $targetQuery->clone()
            ->where('tipe_target', 'bulanan')
            ->distinct()
            ->pluck('bulan')
            ->sort()
            ->values();
            
        $availableMonths = $availableMonthsFromDB->map(function ($month) {
            return [
                'value' => $month,
                'label' => Carbon::create()->month($month)->format('F')
            ];
        });
        
        // If no months found, fallback to all months
        if ($availableMonths->isEmpty()) {
            $availableMonths = collect(range(1, 12))->map(function ($month) {
                return [
                    'value' => $month,
                    'label' => Carbon::create()->month($month)->format('F')
                ];
            });
        }
        
        // Get available years from targets
        $availableYearsFromDB = $targetQuery->clone()
            ->distinct()
            ->pluck('tahun')
            ->sort()
            ->values();
            
        $availableYears = $availableYearsFromDB->map(function ($year) {
            return [
                'value' => $year,
                'label' => $year
            ];
        });
        
        // If no years found, fallback to current range
        if ($availableYears->isEmpty()) {
            $availableYears = collect(range($currentYear - 2, $currentYear + 1))->map(function ($year) {
                return [
                    'value' => $year,
                    'label' => $year
                ];
            });
        }
        
        // 5. Get all yearly targets data (no pagination, search, or filter - all client-side)
        $yearlyTargetsQuery = DB::table('target')
            ->join('publishers', 'target.penerbit_id', '=', 'publishers.penerbit_id')
            ->when($user && $user->hasPublisherRole() && $user->penerbit_id, function ($query) use ($user) {
                return $query->where('target.penerbit_id', $user->penerbit_id);
            })
            ->where('target.kategori', $kategori)
            ->select([
                'target.tahun',
                'target.penerbit_id',
                'target.kategori',
                'publishers.nama_penerbit',
                // Separate yearly and monthly targets
                DB::raw('MAX(CASE WHEN target.tipe_target = \'tahunan\' THEN target.jumlah_target ELSE 0 END) as target_tahunan'),
                DB::raw('SUM(CASE WHEN target.tipe_target = \'bulanan\' THEN target.jumlah_target ELSE 0 END) as total_target_bulanan'),
                DB::raw('COUNT(CASE WHEN target.tipe_target = \'bulanan\' THEN target.target_id END) as jumlah_bulan_ada_target')
            ])
            ->groupBy('target.tahun', 'target.penerbit_id', 'target.kategori', 'publishers.nama_penerbit')
            ->orderBy('target.tahun', 'desc')
            ->orderBy('publishers.nama_penerbit', 'asc')
            ->get();

        // Transform all data
        $yearlyTargetsData = $yearlyTargetsQuery->map(function ($yearlyTarget) {
            // Calculate total realization for the year - use direct Book query with filtering
            $totalRealisasi = Book::where('penerbit_id', $yearlyTarget->penerbit_id)
                ->where('status_keseluruhan', 'published')
                ->whereYear('tanggal_realisasi_naik_cetak', $yearlyTarget->tahun)
                ->count();
            
            // Use yearly target for percentage calculation if exists, otherwise use monthly total
            $targetForCalculation = $yearlyTarget->target_tahunan > 0 
                ? $yearlyTarget->target_tahunan 
                : $yearlyTarget->total_target_bulanan;
                
            $persentase_tercapai = $targetForCalculation > 0 
                ? ($totalRealisasi / $targetForCalculation) * 100 
                : 0;
            
            return (object) [
                'tahun' => $yearlyTarget->tahun,
                'penerbit_id' => $yearlyTarget->penerbit_id,
                'kategori' => $yearlyTarget->kategori,
                'nama_penerbit' => $yearlyTarget->nama_penerbit,
                'target_tahunan' => (int) $yearlyTarget->target_tahunan,
                'total_target_bulanan' => (int) $yearlyTarget->total_target_bulanan,
                'total_realisasi' => $totalRealisasi,
                'persentase_tercapai' => round($persentase_tercapai, 1),
                'jumlah_bulan_ada_target' => (int) $yearlyTarget->jumlah_bulan_ada_target,
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
            'yearlyTargetData' => $yearlyTargetsData,
            'filters' => [
                'months' => $availableMonths,
                'years' => $availableYears,
                'selectedMonth' => $currentMonth,
                'selectedYear' => $currentYear,
                'selectedKategori' => $kategori,
            ],
            'userPublisher' => $user && $user->hasPublisherRole() ? $user->publisher : null,
        ]);
    }

    /**
     * Get available years for a given publisher (years without yearly targets).
     */
    public function getAvailableYears(Request $request)
    {
        $user = $request->user();
        $publisherId = $request->query('penerbit_id');

        if (!$publisherId) {
            return response()->json(['error' => 'Publisher ID is required.'], 400);
        }

        // If user is a publisher, ensure they only request for their publisher ID
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            if ((int)$publisherId !== $user->penerbit_id) {
                return response()->json(['error' => 'Unauthorized access to publisher data.'], 403);
            }
        }

        // Get years that already have ANY target (yearly or monthly) for the given publisher
        $yearsWithTarget = Target::where('penerbit_id', $publisherId)
            ->pluck('tahun')
            ->unique()
            ->toArray();

        // Generate a range of years (e.g., current year - 2 to current year + 3)
        $currentYear = Carbon::now()->year;
        $yearRange = range($currentYear - 2, $currentYear + 3);

        // Filter out years that already have any target
        $availableYears = array_values(array_diff($yearRange, $yearsWithTarget));
        sort($availableYears);

        return response()->json(['availableYears' => $availableYears]);
    }

    /**
     * Show the form for creating a new target.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        
        // Get publishers data
        $publishersQuery = Publisher::query();
        
        // If user is a publisher, only show their publisher
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            $publishersQuery = $publishersQuery->where('penerbit_id', $user->penerbit_id);
        }
        
        $publishers = $publishersQuery->get();
        
        return Inertia::render('target/create', [
            'publishers' => $publishers,
            'userPublisher' => $user && $user->hasPublisherRole() ? $user->publisher : null,
        ]);
    }

    /**
     * Store a newly created target in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Validate request
        $validatedData = $request->validate([
            'penerbit_id' => 'required|exists:publishers,penerbit_id',
            'tahun' => 'required|integer|min:2020|max:2030',
            'kategori' => 'required|in:target_terbit,target_akuisisi',
            'jumlah_target_tahunan' => 'required|integer|min:0',
            'monthly_targets' => 'required|array|size:12',
            'monthly_targets.*.bulan' => 'required|integer|min:1|max:12',
            'monthly_targets.*.jumlah_target' => 'required|integer|min:0',
        ], [
            'penerbit_id.required' => 'Penerbit harus dipilih.',
            'penerbit_id.exists' => 'Penerbit yang dipilih tidak valid.',
            'tahun.required' => 'Tahun harus diisi.',
            'tahun.integer' => 'Tahun harus berupa angka.',
            'tahun.min' => 'Tahun minimal 2020.',
            'tahun.max' => 'Tahun maksimal 2030.',
            'kategori.required' => 'Kategori target harus dipilih.',
            'kategori.in' => 'Kategori target tidak valid.',
            'jumlah_target_tahunan.required' => 'Jumlah target tahunan harus diisi.',
            'jumlah_target_tahunan.integer' => 'Jumlah target tahunan harus berupa angka.',
            'jumlah_target_tahunan.min' => 'Jumlah target tahunan minimal 0.',
            'monthly_targets.required' => 'Target bulanan harus diisi.',
            'monthly_targets.array' => 'Format target bulanan tidak valid.',
            'monthly_targets.size' => 'Target bulanan harus untuk 12 bulan.',
            'monthly_targets.*.bulan.required' => 'Bulan untuk target bulanan harus diisi.',
            'monthly_targets.*.bulan.integer' => 'Bulan untuk target bulanan harus berupa angka.',
            'monthly_targets.*.bulan.min' => 'Bulan minimal 1.',
            'monthly_targets.*.bulan.max' => 'Bulan maksimal 12.',
            'monthly_targets.*.jumlah_target.required' => 'Jumlah target bulanan harus diisi.',
            'monthly_targets.*.jumlah_target.integer' => 'Jumlah target bulanan harus berupa angka.',
            'monthly_targets.*.jumlah_target.min' => 'Jumlah target bulanan minimal 0.',
        ]);

        try {
            DB::beginTransaction();

            // Additional validation for publisher access
            if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
                if ((int)$validatedData['penerbit_id'] !== $user->penerbit_id) {
                    throw new \Exception('Anda tidak memiliki akses untuk membuat target untuk penerbit ini.');
                }
            }

            // Check if any target already exists for this publisher, year, and kategori
            $existingTarget = Target::where('penerbit_id', $validatedData['penerbit_id'])
                ->where('tahun', $validatedData['tahun'])
                ->where('kategori', $validatedData['kategori'])
                ->first();

            if ($existingTarget) {
                $kategoriLabel = $validatedData['kategori'] === 'target_terbit' ? 'Target Terbit' : 'Target Akuisisi';
                throw new \Exception("$kategoriLabel untuk tahun {$validatedData['tahun']} sudah ada.");
            }

            // Create yearly target
            if ($validatedData['jumlah_target_tahunan'] > 0) {
                Target::create([
                    'target_id' => \Illuminate\Support\Str::uuid(),
                    'penerbit_id' => $validatedData['penerbit_id'],
                    'tipe_target' => 'tahunan',
                    'kategori' => $validatedData['kategori'],
                    'tahun' => $validatedData['tahun'],
                    'bulan' => null, // Yearly target has no specific month
                    'jumlah_target' => $validatedData['jumlah_target_tahunan'],
                ]);
            }

            // Create monthly targets
            foreach ($validatedData['monthly_targets'] as $monthTargetData) {
                if ($monthTargetData['jumlah_target'] > 0) {
                    // Check if monthly target already exists (unlikely given yearly check, but good for robustness)
                    $existingMonthlyTarget = Target::where('penerbit_id', $validatedData['penerbit_id'])
                        ->where('tahun', $validatedData['tahun'])
                        ->where('bulan', $monthTargetData['bulan'])
                        ->where('tipe_target', 'bulanan')
                        ->where('kategori', $validatedData['kategori'])
                        ->first();
                    
                    if ($existingMonthlyTarget) {
                        // This case should ideally not be hit if getAvailableYears works correctly,
                        // but as a safeguard, if it exists, update it or throw an error.
                        // For now, let's throw an error to prevent accidental overwrite.
                        $monthName = Carbon::create()->month($monthTargetData['bulan'])->format('F');
                        throw new \Exception("Target bulanan untuk {$monthName} {$validatedData['tahun']} sudah ada.");
                    }

                    Target::create([
                        'target_id' => \Illuminate\Support\Str::uuid(),
                        'penerbit_id' => $validatedData['penerbit_id'],
                        'tipe_target' => 'bulanan',
                        'kategori' => $validatedData['kategori'],
                        'tahun' => $validatedData['tahun'],
                        'bulan' => $monthTargetData['bulan'],
                        'jumlah_target' => $monthTargetData['jumlah_target'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('target')
                ->with('success', 'Target tahunan dan bulanan berhasil dibuat!');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified target.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $targetQuery = Target::with('publisher');

        // Apply publisher filtering if user has publisher role
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            $targetQuery = $targetQuery->where('penerbit_id', $user->penerbit_id);
        }

        $target = $targetQuery->findOrFail($id);

        // Additional authorization check for publisher role
        if ($user && $user->hasPublisherRole() && $target->penerbit_id !== $user->penerbit_id) {
            abort(403, 'Anda tidak memiliki akses untuk melihat target penerbit ini.');
        }
        
        // Calculate detailed realization
        $booksQuery = Book::where('penerbit_id', $target->penerbit_id)
            ->where('status_keseluruhan', 'published')
            ->whereYear('tanggal_realisasi_naik_cetak', $target->tahun);
            
        if ($target->tipe_target === 'bulanan' && $target->bulan) {
            $booksQuery->whereMonth('tanggal_realisasi_naik_cetak', $target->bulan);
        }
        
        $realisasi = $booksQuery->count();
        $persentase_tercapai = $target->jumlah_target > 0 
            ? ($realisasi / $target->jumlah_target) * 100 
            : 0;
            
        // Get monthly breakdown if yearly target
        $monthlyBreakdown = [];
        if ($target->tipe_target === 'tahunan') {
            for ($month = 1; $month <= 12; $month++) {
                $monthlyRealization = Book::where('penerbit_id', $target->penerbit_id)
                    ->where('status_keseluruhan', 'published')
                    ->whereYear('tanggal_realisasi_naik_cetak', $target->tahun)
                    ->whereMonth('tanggal_realisasi_naik_cetak', $month)
                    ->count();
                    
                $monthlyBreakdown[] = [
                    'month' => $month,
                    'month_name' => Carbon::create()->month($month)->format('F'),
                    'realisasi' => $monthlyRealization
                ];
            }
        }
        
        return Inertia::render('target/show', [
            'target' => [
                'target_id' => $target->target_id,
                'penerbit_id' => $target->penerbit_id,
                'nama_penerbit' => $target->publisher->nama_penerbit,
                'tipe_target' => $target->tipe_target,
                'tahun' => $target->tahun,
                'bulan' => $target->bulan,
                'jumlah_target' => $target->jumlah_target,
                'realisasi' => $realisasi,
                'persentase_tercapai' => round($persentase_tercapai, 1),
                'monthly_breakdown' => $monthlyBreakdown,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified target.
     */
    public function edit(Request $request, $id)
    {
        $user = $request->user();

        $targetQuery = Target::with('publisher');

        // Apply publisher filtering if user has publisher role
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            $targetQuery = $targetQuery->where('penerbit_id', $user->penerbit_id);
        }

        $target = $targetQuery->findOrFail($id);

        // Additional authorization check for publisher role
        if ($user && $user->hasPublisherRole() && $target->penerbit_id !== $user->penerbit_id) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit target penerbit ini.');
        }
        
        // Get publishers data
        $publishersQuery = Publisher::query();
        
        // If user is a publisher, only show their publisher
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            $publishersQuery = $publishersQuery->where('penerbit_id', $user->penerbit_id);
        }
        
        $publishers = $publishersQuery->get();
        
        return Inertia::render('target/edit', [
            'target' => $target,
            'publishers' => $publishers,
            'userPublisher' => $user && $user->hasPublisherRole() ? $user->publisher : null,
        ]);
    }

    /**
     * Update the specified target in storage.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        $targetQuery = Target::query();
        
        // Apply publisher filtering if user has publisher role
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            $targetQuery = $targetQuery->where('penerbit_id', $user->penerbit_id);
        }
        
        $target = $targetQuery->findOrFail($id);
        
        // Validate request
        $request->validate([
            'penerbit_id' => 'required|exists:publishers,penerbit_id',
            'tipe_target' => 'required|in:tahunan,bulanan',
            'tahun' => 'required|integer|min:2020|max:2030',
            'bulan' => 'nullable|integer|min:1|max:12',
            'jumlah_target' => 'required|integer|min:0',
        ]);

        try {
            // Additional validation for publisher access
            if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
                if ((int)$request->penerbit_id !== $user->penerbit_id) {
                    throw new \Exception('Anda tidak memiliki akses untuk mengubah target penerbit ini.');
                }
            }

            // For tahunan type, bulan should be null
            $bulan = $request->tipe_target === 'tahunan' ? null : (int)$request->bulan;
            
            // Check if target already exists (except current target)
            $existingTarget = Target::where('penerbit_id', $request->penerbit_id)
                ->where('tipe_target', $request->tipe_target)
                ->where('tahun', $request->tahun)
                ->where('bulan', $bulan)
                ->where('target_id', '!=', $target->target_id)
                ->first();

            if ($existingTarget) {
                $periodLabel = $request->tipe_target === 'tahunan' 
                    ? "tahun {$request->tahun}" 
                    : "bulan " . Carbon::create()->month($bulan)->format('F') . " {$request->tahun}";
                
                throw new \Exception("Target {$request->tipe_target} untuk {$periodLabel} sudah ada.");
            }

            // Update target
            $target->update([
                'penerbit_id' => $request->penerbit_id,
                'tipe_target' => $request->tipe_target,
                'tahun' => $request->tahun,
                'bulan' => $bulan,
                'jumlah_target' => $request->jumlah_target,
            ]);

            return redirect()->route('target')
                ->with('success', 'Target berhasil diperbarui!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display target details for a specific year, publisher, and kategori.
     */
    public function showYearlyDetail(Request $request, $year, $publisherId, $kategori = 'target_terbit')
    {
        $user = $request->user();

        // Authorization check for publisher role
        if ($user && $user->hasPublisherRole() && (int)$publisherId !== $user->penerbit_id) {
            abort(403, 'Anda tidak memiliki akses untuk melihat target penerbit ini.');
        }
        
        // Get publisher info
        $publisher = Publisher::findOrFail($publisherId);
        
        // Get all months data (1-12) with target and realization
        $monthlyTargets = [];
        for ($month = 1; $month <= 12; $month++) {
            // Get target for this month
            $target = Target::where('penerbit_id', $publisherId)
                ->where('tahun', $year)
                ->where('bulan', $month)
                ->where('tipe_target', 'bulanan')
                ->where('kategori', $kategori)
                ->first();
            
            // Get realization for this month
            $realisasi = Book::where('penerbit_id', $publisherId)
                ->where('status_keseluruhan', 'published')
                ->whereYear('tanggal_realisasi_naik_cetak', $year)
                ->whereMonth('tanggal_realisasi_naik_cetak', $month)
                ->count();
            
            $jumlahTarget = $target ? $target->jumlah_target : 0;
            $persentaseTercapai = $jumlahTarget > 0 ? ($realisasi / $jumlahTarget) * 100 : 0;
            
            $monthlyTargets[] = [
                'target_id' => $target ? $target->target_id : null,
                'bulan' => $month,
                'bulan_nama' => Carbon::create()->month($month)->format('F'),
                'jumlah_target' => $jumlahTarget,
                'realisasi' => $realisasi,
                'persentase_tercapai' => round($persentaseTercapai, 1),
            ];
        }
        
        // Get yearly target
        $targetTahunan = Target::where('penerbit_id', $publisherId)
            ->where('tahun', $year)
            ->where('tipe_target', 'tahunan')
            ->where('kategori', $kategori)
            ->value('jumlah_target') ?? 0;
        
        return Inertia::render('target/detail', [
            'tahun' => (int)$year,
            'penerbit_id' => (int)$publisherId,
            'kategori' => $kategori,
            'nama_penerbit' => $publisher->nama_penerbit,
            'monthlyTargets' => $monthlyTargets,
            'targetTahunan' => (int) $targetTahunan,
            'isEditMode' => false,
        ]);
    }

    /**
     * Show the form for editing yearly targets.
     */
    public function editYearlyTargets(Request $request, $year, $publisherId, $kategori = 'target_terbit')
    {
        $user = $request->user();
        
        // Apply publisher filtering if user has publisher role
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            if ((int)$publisherId !== $user->penerbit_id) {
                abort(403, 'Anda tidak memiliki akses untuk mengedit target penerbit ini.');
            }
        }
        
        // Get publisher info
        $publisher = Publisher::findOrFail($publisherId);
        
        // Get all months data (1-12) with target and realization
        $monthlyTargets = [];
        for ($month = 1; $month <= 12; $month++) {
            // Get target for this month
            $target = Target::where('penerbit_id', $publisherId)
                ->where('tahun', $year)
                ->where('bulan', $month)
                ->where('tipe_target', 'bulanan')
                ->where('kategori', $kategori)
                ->first();
            
            // Get realization for this month
            $realisasi = Book::where('penerbit_id', $publisherId)
                ->where('status_keseluruhan', 'published')
                ->whereYear('tanggal_realisasi_naik_cetak', $year)
                ->whereMonth('tanggal_realisasi_naik_cetak', $month)
                ->count();
            
            $jumlahTarget = $target ? $target->jumlah_target : 0;
            $persentaseTercapai = $jumlahTarget > 0 ? ($realisasi / $jumlahTarget) * 100 : 0;
            
            $monthlyTargets[] = [
                'target_id' => $target ? $target->target_id : null,
                'bulan' => $month,
                'bulan_nama' => Carbon::create()->month($month)->format('F'),
                'jumlah_target' => $jumlahTarget,
                'realisasi' => $realisasi,
                'persentase_tercapai' => round($persentaseTercapai, 1),
            ];
        }
        
        // Get yearly target
        $targetTahunan = Target::where('penerbit_id', $publisherId)
            ->where('tahun', $year)
            ->where('tipe_target', 'tahunan')
            ->where('kategori', $kategori)
            ->value('jumlah_target') ?? 0;
        
        return Inertia::render('target/detail', [
            'tahun' => (int)$year,
            'penerbit_id' => (int)$publisherId,
            'kategori' => $kategori,
            'nama_penerbit' => $publisher->nama_penerbit,
            'monthlyTargets' => $monthlyTargets,
            'targetTahunan' => (int) $targetTahunan,
            'isEditMode' => true,
        ]);
    }

    /**
     * Update yearly targets.
     */
    public function updateYearlyTargets(Request $request, $year, $publisherId, $kategori = 'target_terbit')
    {
        $user = $request->user();
        
        // Apply publisher filtering if user has publisher role
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            if ((int)$publisherId !== $user->penerbit_id) {
                abort(403, 'Anda tidak memiliki akses untuk mengubah target penerbit ini.');
            }
        }
        
        // Validate request
        $request->validate([
            'target_tahunan' => 'required|integer|min:0',
            'targets' => 'required|array',
            'targets.*.bulan' => 'required|integer|min:1|max:12',
            'targets.*.jumlah_target' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Handle yearly target
            $existingYearlyTarget = Target::where('penerbit_id', $publisherId)
                ->where('tahun', $year)
                ->where('tipe_target', 'tahunan')
                ->where('kategori', $kategori)
                ->first();

            if ($request->target_tahunan > 0) {
                if ($existingYearlyTarget) {
                    $existingYearlyTarget->update(['jumlah_target' => $request->target_tahunan]);
                } else {
                    Target::create([
                        'target_id' => \Illuminate\Support\Str::uuid(),
                        'penerbit_id' => $publisherId,
                        'tipe_target' => 'tahunan',
                        'kategori' => $kategori,
                        'tahun' => $year,
                        'bulan' => null,
                        'jumlah_target' => $request->target_tahunan,
                    ]);
                }
            } else {
                // Delete yearly target if exists and value is 0
                if ($existingYearlyTarget) {
                    $existingYearlyTarget->delete();
                }
            }

            // Handle monthly targets
            foreach ($request->targets as $targetData) {
                $month = $targetData['bulan'];
                $jumlahTarget = $targetData['jumlah_target'];
                
                // Find existing target
                $existingTarget = Target::where('penerbit_id', $publisherId)
                    ->where('tahun', $year)
                    ->where('bulan', $month)
                    ->where('tipe_target', 'bulanan')
                    ->where('kategori', $kategori)
                    ->first();
                
                if ($jumlahTarget > 0) {
                    // Create or update target
                    if ($existingTarget) {
                        $existingTarget->update(['jumlah_target' => $jumlahTarget]);
                    } else {
                        Target::create([
                            'target_id' => \Illuminate\Support\Str::uuid(),
                            'penerbit_id' => $publisherId,
                            'tipe_target' => 'bulanan',
                            'kategori' => $kategori,
                            'tahun' => $year,
                            'bulan' => $month,
                            'jumlah_target' => $jumlahTarget,
                        ]);
                    }
                } else {
                    // Delete target if exists and value is 0
                    if ($existingTarget) {
                        $existingTarget->delete();
                    }
                }
            }

            DB::commit();

            return redirect()->route('target.yearly.detail', ['year' => $year, 'publisherId' => $publisherId, 'kategori' => $kategori])
                ->with('success', 'Target tahunan dan bulanan berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete all targets for a specific year and publisher.
     */
    public function destroyYearlyTargets(Request $request, $year, $publisherId)
    {
        $user = $request->user();
        
        // Apply publisher filtering if user has publisher role
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            if ((int)$publisherId !== $user->penerbit_id) {
                abort(403, 'Anda tidak memiliki akses untuk menghapus target penerbit ini.');
            }
        }

        try {
            Target::where('penerbit_id', $publisherId)
                ->where('tahun', $year)
                ->delete();

            return redirect()->route('target')
                ->with('success', 'Semua target untuk tahun ' . $year . ' berhasil dihapus!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
