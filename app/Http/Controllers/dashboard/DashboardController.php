<?php

namespace App\Http\Controllers\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Book;
use App\Models\Publisher;
use App\Models\User;
use App\Models\MasterTask;
use App\Models\Manuscript;
use App\Models\TaskProgress;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Base query for books
        $booksQuery = Book::with([
            'publisher', 
            'pic', 
            'taskProgress.masterTask',
            'taskProgress.pic'
        ]);
        
        // Apply publisher filtering if user has publisher role
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            $booksQuery = $booksQuery->where('penerbit_id', $user->penerbit_id);
        }
        
        $books = $booksQuery->get();
        
        // Get statistics with publisher filtering
        $statsQuery = Book::query();
        if ($user && $user->hasPublisherRole() && $user->penerbit_id) {
            $statsQuery = $statsQuery->where('penerbit_id', $user->penerbit_id);
        }
        
        $TargetTahunan = $statsQuery->clone()->whereYear('tanggal_target_naik_cetak', now()->year)->count();
        $SedangDikerjakan = $statsQuery->clone()->whereIn('status_keseluruhan', ['editing', 'review'])->count();
        $MendekatiDeadline = $statsQuery->clone()->where('tanggal_target_naik_cetak', '<', now()->addDays(7))->count();
        $Published = $statsQuery->clone()->where('status_keseluruhan', 'published')->count();
        
        $ChartData = [
            'Belum Mulai' => $statsQuery->clone()->where('status_keseluruhan', 'draft')->count(),
            'Dalam Proses' => $statsQuery->clone()->whereIn('status_keseluruhan', ['editing', 'review'])->count(),
            'Selesai' => $statsQuery->clone()->where('status_keseluruhan', 'published')->count(),
        ];
        
        // Hitung data khusus PENULIS (hanya jika user berperan 'penulis')
        $penulis = null;
        if ($user && $user->hasRole('penulis')) {
            $total = Manuscript::where('penulis_user_id', $user->user_id)->count();
            $draft = Manuscript::where('penulis_user_id', $user->user_id)->where('status', 'draft')->count();
            $review = Manuscript::where('penulis_user_id', $user->user_id)->where('status', 'review')->count();
            $approved = Manuscript::where('penulis_user_id', $user->user_id)->where('status', 'approved')->count();
            $canceled = Manuscript::where('penulis_user_id', $user->user_id)->where('status', 'canceled')->count();
            
            // Untuk publish, kita bisa menggunakan approved atau status lain yang menunjukkan published
            $publish = $approved; // atau buat status 'published' terpisah
            
            $manuscripts = Manuscript::where('penulis_user_id', $user->user_id)
                                    ->latest('tanggal_masuk')
                                    
                                    ->get();
        
            $activities = $manuscripts->map(function ($m) {
                $book = $m->book;
                
                // Pastikan status selalu dikirim
                $status = $m->status ?? 'draft';
                
                if (!$book) {
                    return [
                        'id' => $m->naskah_id,
                        'title' => $m->judul_naskah ?? 'Naskah',
                        'status' => $status, // ← PENTING: Tambahkan ini
                        'updatedAt' => optional($m->updated_at)->format('Y-m-d H:i:s'),
                    ];
                }
        
                return [
                    'id' => $book->buku_id ?? $m->naskah_id,
                    'title' => ($m->judul_naskah ?? $book->judul_buku) ?: 'Naskah',
                    'status' => $status, // ← PENTING: Tambahkan ini
                    'updatedAt' => optional($book->updated_at ?? $m->updated_at)->format('Y-m-d H:i:s'),
                ];
            });
        
            $penulis = [
                'stats' => [
                    'total' => $total,
                    'draft' => $draft,
                    'progres' => $review, // review = progres
                    'publish' => $publish,
                    'delta' => ['total'=>0,'draft'=>0,'progres'=>0,'publish'=>0],
                ],
                'activities' => $activities->toArray(),
            ];
        }
        
        return Inertia::render('dashboard/dashboard', [
            'books' => $books,
            'TargetTahunan' => $TargetTahunan,
            'SedangDikerjakan' => $SedangDikerjakan,
            'MendekatiDeadline' => $MendekatiDeadline,
            'Published' => $Published,
            'ChartData' => $ChartData,
            'userPublisher' => $user && $user->hasPublisherRole() ? $user->publisher : null,
            'penulis' => $penulis, // null untuk non-penulis, berisi data untuk penulis
        ]);
    }
    
    // public function show($id)
    // {
    //     $book = Book::with([
    //         'manuscript.author', 
    //         'pic', 
    //         'publisher',
    //         'taskProgress.masterTask',
    //         'taskProgress.pic'
    //     ])->findOrFail($id);
        
    //     // Hitung progress percentage untuk setiap task berdasarkan status
    //     if ($book->taskProgress) {
    //         foreach ($book->taskProgress as $task) {
    //             switch ($task->status) {
    //                 case 'completed':
    //                     $task->progress_percentage = 100;
    //                     break;
    //                 case 'in_progress':
    //                     $task->progress_percentage = 75; // Default 75% untuk task yang sedang berjalan
    //                     break;
    //                 case 'pending':
    //                     $task->progress_percentage = 0;
    //                     break;
    //                 case 'overdue':
    //                     $task->progress_percentage = 50; // Default 50% untuk task yang terlambat
    //                     break;
    //                 default:
    //                     $task->progress_percentage = 0;
    //                     break;
    //             }
    //         }
    //     }
        
    //     return Inertia::render('dashboard/show-dashboard', [
    //         'book' => $book
    //     ]);
    // }
    
    // public function edit($id)
    // {
    //     $book = Book::with([
    //         'manuscript.author', 
    //         'pic', 
    //         'publisher',
    //         'taskProgress.masterTask',
    //         'taskProgress.pic'
    //     ])->findOrFail($id);
        
    //     // Get data needed for edit page
    //     $users = \App\Models\User::select('user_id', 'nama_lengkap', 'email')->get();
    //     $publishers = \App\Models\Publisher::select('penerbit_id', 'nama_penerbit')->get();
    //     $masterTasks = \App\Models\MasterTask::select('tugas_id', 'nama_tugas', 'urutan')->orderBy('urutan')->get();
        
    //     return Inertia::render('dashboard/edit-dashboard', [
    //         'book' => $book,
    //         'users' => $users,
    //         'publishers' => $publishers,
    //         'masterTasks' => $masterTasks
    //     ]);
    // }
    
    // public function update(Request $request, $id)   
    // {
    //     $book = Book::findOrFail($id);
        
    //     // Update book information
    //     $book->update([
    //         'judul_buku' => $request->input('judul_buku'),
    //         'pic_user_id' => $request->input('pic_user_id'),
    //         'penerbit_id' => $request->input('penerbit_id'),
    //         'status_keseluruhan' => $request->input('status_keseluruhan'),
    //         'tanggal_target_naik_cetak' => $request->input('tanggal_target_naik_cetak'),
    //         'tanggal_realisasi_naik_cetak' => $request->input('tanggal_realisasi_naik_cetak'),
    //     ]);
        
    //     // Update task progress if provided
    //     if ($request->has('task_progress')) {
    //         foreach ($request->input('task_progress') as $taskData) {
    //             if (isset($taskData['progres_id']) && !str_starts_with($taskData['progres_id'], 'temp_')) {
    //                 // Update existing task
    //                 $taskProgress = \App\Models\TaskProgress::find($taskData['progres_id']);
    //                 if ($taskProgress) {
    //                                              $taskProgress->update([
    //                          'pic_tugas_user_id' => ($taskData['pic_tugas_user_id'] && $taskData['pic_tugas_user_id'] !== 'none') ? $taskData['pic_tugas_user_id'] : null,
    //                          'deadline' => $taskData['deadline'] ?: null,
    //                          'status' => $taskData['status'],

    //                          'tanggal_mulai' => $taskData['tanggal_mulai'] ?: null,
    //                          'tanggal_selesai' => $taskData['tanggal_selesai'] ?: null,
    //                          'catatan' => $taskData['catatan'] ?: null,
    //                      ]);
    //                 }
    //             } else {
    //                 // Create new task
    //                                      \App\Models\TaskProgress::create([
    //                      'progres_id' => \Illuminate\Support\Str::uuid(),
    //                      'buku_id' => $book->buku_id,
    //                      'tugas_id' => $taskData['tugas_id'],
    //                      'pic_tugas_user_id' => ($taskData['pic_tugas_user_id'] && $taskData['pic_tugas_user_id'] !== 'none') ? $taskData['pic_tugas_user_id'] : null,
    //                      'deadline' => $taskData['deadline'] ?: null,
    //                      'status' => $taskData['status'],
    //                      'tanggal_mulai' => $taskData['tanggal_mulai'] ?: null,
    //                      'tanggal_selesai' => $taskData['tanggal_selesai'] ?: null,
    //                      'catatan' => $taskData['catatan'] ?: null,
    //                  ]);
    //             }
    //         }
    //     }
        
    //     return redirect()->route('dashboard');
    // }
    
    // public function destroy($id)
    // {
    //     $book = Book::findOrFail($id);
    //     $book->delete();
    //     return redirect()->route('dashboard');
    // }
}