<?php

namespace App\Http\Controllers\Analitik;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\TaskProgress;
use App\Models\User;
use App\Models\MasterTask;
use App\Models\Manuscript;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AnalitikController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        // Check if user has publisher role
        if ($user && $user->penerbit_id) {
            return $this->getPublisherAnalytics($user->penerbit_id);
        }

        // Original logic for non-publisher users
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
        $activeMembers = User::whereHas('taskProgressAsPic', function ($query) {
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


        // 4. Top Performers - Tim dengan kinerja terbaik
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
            ->map(function ($item) {
                $item->completion_rate = $item->total_tasks > 0 ? round(($item->completed_tasks / $item->total_tasks) * 100, 1) : 0;

                // Hitung rata-rata hari secara terpisah
                try {
                    $userTasks = TaskProgress::where('pic_tugas_user_id', $item->user_id)
                        ->whereNotNull('tanggal_selesai')
                        ->whereNotNull('tanggal_mulai')
                        ->get();

                    $avgDays = 0;
                    if ($userTasks->count() > 0) {
                        $totalDays = $userTasks->sum(function ($task) {
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

        // 5. Workload Distribution - Distribusi beban kerja aktif
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

        // 6. Deadline Performance
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

        // 7. Target Penerbitan Buku
        $publishingTargets = DB::table('target')
            ->join('publishers', 'target.penerbit_id', '=', 'publishers.penerbit_id')
            ->select(
                'target.tahun',
                'target.penerbit_id',
                'target.kategori',
                'publishers.nama_penerbit',
                DB::raw("MAX(CASE WHEN target.tipe_target = 'tahunan' THEN target.jumlah_target ELSE 0 END) as target_tahunan"),
                DB::raw("SUM(CASE WHEN target.tipe_target = 'bulanan' THEN target.jumlah_target ELSE 0 END) as total_target_bulanan"),
                DB::raw("COUNT(CASE WHEN target.tipe_target = 'bulanan' THEN target.target_id END) as jumlah_bulan_ada_target")
            )
            ->where('target.penerbit_id', 1)
            ->where('target.kategori', 'target_terbit')
            ->groupBy('target.tahun', 'target.penerbit_id', 'target.kategori', 'publishers.nama_penerbit')
            ->orderBy('target.tahun', 'desc')
            ->orderBy('publishers.nama_penerbit', 'asc')
            ->get();

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
            'topPerformers' => $topPerformers->values(),
            'workloadDistribution' => $workloadDistribution,
            'deadlinePerformance' => $deadlinePerformance,
            'publishingTargets' => $publishingTargets,
        ]);
    }

    /**
     * Get publisher-specific analytics data.
     */
    private function getPublisherAnalytics($publisherId)
    {
        // 1. Metrik Utama untuk Penerbit
        $totalBooks = Book::where('penerbit_id', $publisherId)->count();
        $completedBooks = Book::where('penerbit_id', $publisherId)
            ->where('status_keseluruhan', 'published')->count();
        $inProgressBooks = Book::where('penerbit_id', $publisherId)
            ->whereIn('status_keseluruhan', ['editing', 'review'])->count();
        $draftBooks = Book::where('penerbit_id', $publisherId)
            ->where('status_keseluruhan', 'draft')->count();

        // Total tasks dan completion rate untuk penerbit ini
        $totalTasks = TaskProgress::whereHas('book', function ($query) use ($publisherId) {
            $query->where('penerbit_id', $publisherId);
        })->count();
        $completedTasks = TaskProgress::whereHas('book', function ($query) use ($publisherId) {
            $query->where('penerbit_id', $publisherId);
        })->where('status', 'completed')->count();
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0;

        // Overdue tasks untuk penerbit ini
        $overdueTasks = TaskProgress::whereHas('book', function ($query) use ($publisherId) {
            $query->where('penerbit_id', $publisherId);
        })->whereNotNull('deadline')
            ->where('deadline', '<', now())
            ->where('status', '!=', 'completed')
            ->count();
        $overdueRate = $totalTasks > 0 ? round(($overdueTasks / $totalTasks) * 100, 1) : 0;

        // Active team members untuk penerbit ini
        $activeMembers = User::whereHas('taskProgressAsPic', function ($query) use ($publisherId) {
            $query->whereHas('book', function ($bookQuery) use ($publisherId) {
                $bookQuery->where('penerbit_id', $publisherId);
            })->where('status', '!=', 'completed');
        })->count();

        // 2. Distribusi Status Buku (untuk pie chart)
        $bookStatusDistribution = [
            ['name' => 'Draft', 'value' => $draftBooks, 'percentage' => $totalBooks > 0 ? round(($draftBooks / $totalBooks) * 100, 1) : 0],
            ['name' => 'Dalam Proses', 'value' => $inProgressBooks, 'percentage' => $totalBooks > 0 ? round(($inProgressBooks / $totalBooks) * 100, 1) : 0],
            ['name' => 'Selesai', 'value' => $completedBooks, 'percentage' => $totalBooks > 0 ? round(($completedBooks / $totalBooks) * 100, 1) : 0],
        ];

        // 3. Data untuk Monthly Productivity Chart (6 bulan terakhir)
        $monthlyProductivity = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M Y');
            $startOfMonth = $month->copy()->startOfMonth()->toDateString();
            $endOfMonth = $month->copy()->endOfMonth()->toDateString();

            $booksCompletedInMonth = Book::where('penerbit_id', $publisherId)
                ->where('status_keseluruhan', 'published')
                ->whereNotNull('tanggal_realisasi_naik_cetak')
                ->whereBetween('tanggal_realisasi_naik_cetak', [$startOfMonth, $endOfMonth])
                ->count();

            $manuscriptsSubmittedInMonth = Manuscript::whereHas('targetPublishers', function ($query) use ($publisherId) {
                $query->where('penerbit_id', $publisherId);
            })
            ->whereBetween('tanggal_masuk', [$startOfMonth, $endOfMonth])
            ->count();

            $monthlyProductivity[] = [
                'month' => $monthName,
                'books' => $booksCompletedInMonth,
                'manuscripts' => $manuscriptsSubmittedInMonth,
            ];
        }

        // 4. Task Completion by Stage
        $stagePerformance = DB::table('master_tasks')
            ->leftJoin('task_progress', function ($join) use ($publisherId) {
                $join->on('master_tasks.tugas_id', '=', 'task_progress.tugas_id')
                     ->join('books', 'task_progress.buku_id', '=', 'books.buku_id')
                     ->where('books.penerbit_id', '=', $publisherId);
            })
            ->select([
                'master_tasks.tugas_id',
                'master_tasks.nama_tugas',
                'master_tasks.urutan',
                DB::raw('COUNT(task_progress.progres_id) as total_tasks'),
                DB::raw("COUNT(CASE WHEN task_progress.status = 'completed' THEN 1 END) as completed_tasks")
            ])
            ->groupBy('master_tasks.tugas_id', 'master_tasks.nama_tugas', 'master_tasks.urutan')
            ->orderBy('master_tasks.urutan')
            ->get()
            ->map(function ($item) {
                $item->completion_rate = $item->total_tasks > 0 ? round(($item->completed_tasks / $item->total_tasks) * 100, 1) : 0;
                return $item;
            });

        // 5. Genre Distribution dari buku yang diterbitkan
        $genreDistribution = Book::where('penerbit_id', $publisherId)
            ->where('status_keseluruhan', 'published')
            ->join('manuscripts', 'books.naskah_id', '=', 'manuscripts.naskah_id')
            ->select('manuscripts.genre', DB::raw('COUNT(*) as count'))
            ->groupBy('manuscripts.genre')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->genre ?: 'Lainnya',
                    'value' => $item->count,
                    'percentage' => 0 // akan dihitung di frontend
                ];
            });

        // Hitung total untuk percentage
        $genreArray = $genreDistribution->toArray();
        $totalGenre = array_sum(array_column($genreArray, 'value'));
        $genreDistribution = array_map(function ($item) use ($totalGenre) {
            $item['percentage'] = $totalGenre > 0 ? round(($item['value'] / $totalGenre) * 100, 1) : 0;
            return $item;
        }, $genreArray);

        // 6. Top Authors untuk penerbit ini
        $topAuthors = DB::table('manuscripts')
            ->join('manuscript_authors', 'manuscripts.naskah_id', '=', 'manuscript_authors.naskah_id')
            ->join('authors', 'manuscript_authors.author_id', '=', 'authors.author_id')
            ->join('books', 'manuscripts.naskah_id', '=', 'books.naskah_id')
            ->where('books.penerbit_id', $publisherId)
            ->where('books.status_keseluruhan', 'published')
            ->select([
                'authors.author_id',
                'authors.nama_lengkap',
                DB::raw('COUNT(DISTINCT books.buku_id) as books_published'),
                DB::raw('COUNT(DISTINCT manuscripts.naskah_id) as manuscripts_count')
            ])
            ->groupBy('authors.author_id', 'authors.nama_lengkap')
            ->orderByDesc('books_published')
            ->limit(5)
            ->get();

        return Inertia::render('analitik/analitik-penerbit', [
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
            'genreDistribution' => $genreDistribution,
            'topAuthors' => $topAuthors,
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
