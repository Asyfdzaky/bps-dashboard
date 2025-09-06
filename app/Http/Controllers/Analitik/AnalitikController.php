<?php

namespace App\Http\Controllers\Analitik;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\TaskProgress;
use App\Models\User;
use App\Models\MasterTask;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalitikController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // 1. Metrik Utama Dashboard
        $totalBooks = Book::count();
        $completedBooks = Book::where('status_keseluruhan', 'published')->count();
        $inProgressBooks = Book::whereIn('status_keseluruhan', ['editing', 'review'])->count();
        $draftBooks = Book::where('status_keseluruhan', 'draft')->count();
        
        // Total tasks dan completion rate
        $totalTasks = TaskProgress::count();
        $completedTasks = TaskProgress::where('status', 'completed')->count();
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0;
        
        // Overdue tasks
        $overdueTasks = TaskProgress::whereNotNull('deadline')
            ->where('deadline', '<', now())
            ->where('status', '!=', 'completed')
            ->count();
        $overdueRate = $totalTasks > 0 ? round(($overdueTasks / $totalTasks) * 100, 1) : 0;
        
        // Active team members
        $activeMembers = User::whereHas('taskProgressAsPic', function($query) {
            $query->where('status', '!=', 'completed');
        })->count();

        // 2. Distribusi Status Buku (untuk pie chart)
        $bookStatusDistribution = [
            ['name' => 'Draft', 'value' => $draftBooks, 'percentage' => $totalBooks > 0 ? round(($draftBooks / $totalBooks) * 100, 1) : 0],
            ['name' => 'Dalam Proses', 'value' => $inProgressBooks, 'percentage' => $totalBooks > 0 ? round(($inProgressBooks / $totalBooks) * 100, 1) : 0],
            ['name' => 'Selesai', 'value' => $completedBooks, 'percentage' => $totalBooks > 0 ? round(($completedBooks / $totalBooks) * 100, 1) : 0],
        ];

        // 3. Produktivitas Tim per Bulan (6 bulan terakhir)
        $monthlyProductivity = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M Y');
            $startOfMonth = $month->copy()->startOfMonth()->toDateString();
            $endOfMonth = $month->copy()->endOfMonth()->toDateString();
            
            $completedInMonth = TaskProgress::where('status', 'completed')
                ->whereNotNull('tanggal_selesai')
                ->whereBetween('tanggal_selesai', [$startOfMonth, $endOfMonth])
                ->count();
                
            $booksCompletedInMonth = Book::where('status_keseluruhan', 'published')
                ->whereNotNull('tanggal_realisasi_naik_cetak')
                ->whereBetween('tanggal_realisasi_naik_cetak', [$startOfMonth, $endOfMonth])
                ->count();
            
            $monthlyProductivity[] = [
                'month' => $monthName,
                'tasks' => $completedInMonth,
                'books' => $booksCompletedInMonth,
            ];
        }

        // 4. Kinerja per Tahap Produksi
        $stagePerformance = DB::table('master_tasks')
            ->leftJoin('task_progress', 'master_tasks.tugas_id', '=', 'task_progress.tugas_id')
            ->select([
                'master_tasks.tugas_id',
                'master_tasks.nama_tugas',
                'master_tasks.urutan',
                DB::raw('COUNT(task_progress.progres_id) as total_tasks'),
                DB::raw("COUNT(CASE WHEN task_progress.status = 'completed' THEN 1 END) as completed_tasks"),
                DB::raw("COUNT(CASE WHEN task_progress.deadline IS NOT NULL AND task_progress.deadline < NOW() AND task_progress.status != 'completed' THEN 1 END) as overdue_tasks")
            ])
            ->groupBy('master_tasks.tugas_id', 'master_tasks.nama_tugas', 'master_tasks.urutan')
            ->orderBy('master_tasks.urutan')
            ->get()
            ->map(function($item) {
                $item->completion_rate = $item->total_tasks > 0 ? round(($item->completed_tasks / $item->total_tasks) * 100, 1) : 0;
                $item->overdue_rate = $item->total_tasks > 0 ? round(($item->overdue_tasks / $item->total_tasks) * 100, 1) : 0;
                
                // Hitung rata-rata hari secara terpisah untuk menghindari masalah PostgreSQL
                try {
                    $taskProgressForStage = TaskProgress::where('tugas_id', $item->tugas_id)
                        ->whereNotNull('tanggal_selesai')
                        ->whereNotNull('tanggal_mulai')
                        ->get();
                    
                    $avgDays = 0;
                    if ($taskProgressForStage->count() > 0) {
                        $totalDays = $taskProgressForStage->sum(function($task) {
                            return Carbon::parse($task->tanggal_selesai)->diffInDays(Carbon::parse($task->tanggal_mulai));
                        });
                        $avgDays = $totalDays / $taskProgressForStage->count();
                    }
                    
                    $item->avg_completion_days = round($avgDays, 1);
                } catch (\Exception $e) {
                    $item->avg_completion_days = 0;
                }
                return $item;
            });

        // 5. Top Performers - Tim dengan kinerja terbaik
        $topPerformers = DB::table('users')
            ->join('task_progress', 'users.user_id', '=', 'task_progress.pic_tugas_user_id')
            ->select([
                'users.user_id',
                'users.nama_lengkap',
                DB::raw('COUNT(*) as total_tasks'),
                DB::raw("COUNT(CASE WHEN task_progress.status = 'completed' THEN 1 END) as completed_tasks"),
                DB::raw("COUNT(CASE WHEN task_progress.deadline IS NOT NULL AND task_progress.deadline < NOW() AND task_progress.status != 'completed' THEN 1 END) as overdue_tasks"),
                DB::raw('COUNT(DISTINCT task_progress.buku_id) as books_involved')
            ])
            ->groupBy('users.user_id', 'users.nama_lengkap')
            ->havingRaw('COUNT(*) >= 3') // Minimal 3 task untuk dianggap
            ->get()
            ->map(function($item) {
                $item->completion_rate = $item->total_tasks > 0 ? round(($item->completed_tasks / $item->total_tasks) * 100, 1) : 0;
                
                // Hitung rata-rata hari secara terpisah
                try {
                    $userTasks = TaskProgress::where('pic_tugas_user_id', $item->user_id)
                        ->whereNotNull('tanggal_selesai')
                        ->whereNotNull('tanggal_mulai')
                        ->get();
                    
                    $avgDays = 0;
                    if ($userTasks->count() > 0) {
                        $totalDays = $userTasks->sum(function($task) {
                            return Carbon::parse($task->tanggal_selesai)->diffInDays(Carbon::parse($task->tanggal_mulai));
                        });
                        $avgDays = $totalDays / $userTasks->count();
                    }
                    
                    $item->avg_completion_days = round($avgDays, 1);
                } catch (\Exception $e) {
                    $item->avg_completion_days = 0;
                }
                $item->efficiency_score = $item->completion_rate - ($item->overdue_tasks * 10); // Score considering completion rate and penalties for overdue
                return $item;
            })
            ->sortByDesc('completion_rate')
            ->take(10);

        // 6. Workload Distribution - Distribusi beban kerja aktif
        $workloadDistribution = DB::table('users')
            ->join('task_progress', 'users.user_id', '=', 'task_progress.pic_tugas_user_id')
            ->select([
                'users.nama_lengkap',
                DB::raw("COUNT(CASE WHEN task_progress.status IN ('pending', 'in_progress') THEN 1 END) as active_tasks"),
                DB::raw("COUNT(CASE WHEN task_progress.status = 'completed' THEN 1 END) as completed_tasks"),
                DB::raw("COUNT(CASE WHEN task_progress.deadline IS NOT NULL AND task_progress.deadline < NOW() AND task_progress.status != 'completed' THEN 1 END) as overdue_tasks")
            ])
            ->groupBy('users.user_id', 'users.nama_lengkap')
            ->havingRaw("COUNT(CASE WHEN task_progress.status IN ('pending', 'in_progress') THEN 1 END) > 0")
            ->orderByDesc('active_tasks')
            ->get();

        // 7. Deadline Performance
        $deadlinePerformance = [
            'on_time' => TaskProgress::where('status', 'completed')
                ->whereNotNull('deadline')
                ->whereNotNull('tanggal_selesai')
                ->whereRaw('tanggal_selesai <= deadline')
                ->count(),
            'late' => TaskProgress::where('status', 'completed')
                ->whereNotNull('deadline')
                ->whereNotNull('tanggal_selesai')
                ->whereRaw('tanggal_selesai > deadline')
                ->count(),
            'upcoming' => TaskProgress::whereIn('status', ['pending', 'in_progress'])
                ->whereNotNull('deadline')
                ->where('deadline', '>', now())
                ->where('deadline', '<=', now()->addDays(7))
                ->count(),
            'overdue' => $overdueTasks
        ];

        return Inertia::render('analitik/analitik', [
            'metrics' => [
                'totalBooks' => $totalBooks,
                'completedBooks' => $completedBooks,
                'inProgressBooks' => $inProgressBooks,
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks,
                'completionRate' => $completionRate,
                'overdueTasks' => $overdueTasks,
                'overdueRate' => $overdueRate,
                'activeMembers' => $activeMembers,
            ],
            'bookStatusDistribution' => $bookStatusDistribution,
            'monthlyProductivity' => $monthlyProductivity,
            'stagePerformance' => $stagePerformance,
            'topPerformers' => $topPerformers->values(),
            'workloadDistribution' => $workloadDistribution,
            'deadlinePerformance' => $deadlinePerformance,
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
