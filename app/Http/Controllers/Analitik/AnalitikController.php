<?php

namespace App\Http\Controllers\Analitik;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AnalitikController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // 1. Kartu Metrik Produksi
        $totalBooks = Book::count();
        $publishedBooks = Book::where('status_keseluruhan', 'published')->count();
        $processedBooks = Book::whereIn('status_keseluruhan', ['editing', 'review', 'completed'])->count();
        
        // Hitung rata-rata waktu produksi dengan type casting yang tepat
        $avgProductionTime = Book::whereNotNull('tanggal_realisasi_naik_cetak')
            ->whereNotNull('created_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (tanggal_realisasi_naik_cetak::timestamp - created_at::timestamp))/86400) as avg_days')
            ->first()->avg_days ?? 0;
        
        // Hitung waktu produksi tercepat dan terlama
        $fastestProduction = Book::whereNotNull('tanggal_realisasi_naik_cetak')
            ->whereNotNull('created_at')
            ->selectRaw('MIN(EXTRACT(EPOCH FROM (tanggal_realisasi_naik_cetak::timestamp - created_at::timestamp))/86400) as min_days')
            ->first()->min_days ?? 0;
        
        $slowestProduction = Book::whereNotNull('tanggal_realisasi_naik_cetak')
            ->whereNotNull('created_at')
            ->selectRaw('MAX(EXTRACT(EPOCH FROM (tanggal_realisasi_naik_cetak::timestamp - created_at::timestamp))/86400) as max_days')
            ->first()->max_days ?? 0;
        
        // Hitung persentase keterlambatan
        $overdueBooks = Book::where('tanggal_target_naik_cetak', '<', now())
            ->whereNotIn('status_keseluruhan', ['published', 'completed'])
            ->count();
        $overduePercentage = $totalBooks > 0 ? ($overdueBooks / $totalBooks) * 100 : 0;
        
        // 2. Grafik Kinerja - Rata-rata waktu per tugas dengan type casting
        $taskPerformance = DB::table('task_progress')
            ->join('master_tasks', 'task_progress.tugas_id', '=', 'master_tasks.tugas_id')
            ->whereNotNull('tanggal_selesai')
            ->whereNotNull('tanggal_mulai')
            ->selectRaw('
                master_tasks.nama_tugas,
                master_tasks.urutan,
                AVG(EXTRACT(EPOCH FROM (tanggal_selesai::timestamp - tanggal_mulai::timestamp))/86400) as avg_days
            ')
            ->groupBy('master_tasks.tugas_id', 'master_tasks.nama_tugas', 'master_tasks.urutan')
            ->orderBy('master_tasks.urutan')
            ->get();
        
        // 3. Grafik Beban Kerja Tim - perbaiki quote untuk status
        $teamWorkload = DB::table('task_progress')
            ->join('users', 'task_progress.pic_tugas_user_id', '=', 'users.user_id')
            ->selectRaw("
                users.nama_lengkap,
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
            ")
            ->whereNotNull('pic_tugas_user_id')
            ->groupBy('users.user_id', 'users.nama_lengkap')
            ->get();
        
        // 4. Tabel Produktivitas Tim dengan type casting
        $teamProductivity = DB::table('task_progress')
            ->join('users', 'task_progress.pic_tugas_user_id', '=', 'users.user_id')
            ->selectRaw("
                users.nama_lengkap,
                COUNT(DISTINCT buku_id) as total_books,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                AVG(CASE WHEN tanggal_selesai IS NOT NULL AND tanggal_mulai IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (tanggal_selesai::timestamp - tanggal_mulai::timestamp))/86400 
                    END) as avg_task_time
            ")
            ->whereNotNull('pic_tugas_user_id')
            ->groupBy('users.user_id', 'users.nama_lengkap')
            ->get();
        
        return Inertia::render('analitik/analitik', [
            'metrics' => [
                'totalBooks' => $totalBooks,
                'publishedBooks' => $publishedBooks,
                'processedBooks' => $processedBooks,
                'avgProductionTime' => round($avgProductionTime, 1),
                'fastestProduction' => round($fastestProduction, 1),
                'slowestProduction' => round($slowestProduction, 1),
                'overduePercentage' => round($overduePercentage, 1),
            ],
            'taskPerformance' => $taskPerformance,
            'teamWorkload' => $teamWorkload,
            'teamProductivity' => $teamProductivity,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Book $book)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Book $book)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        //
    }
}
