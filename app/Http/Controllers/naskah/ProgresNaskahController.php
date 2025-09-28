<?php

namespace App\Http\Controllers\naskah;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\TaskProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProgresNaskahController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Subquery: current_order per buku = MIN(urutan) dari task yang belum selesai
        $currentStageSub = TaskProgress::query()
            ->select([
                'task_progress.buku_id',
                DB::raw('MIN(master_tasks.urutan) as current_order'),
            ])
            ->join('master_tasks', 'task_progress.tugas_id', '=', 'master_tasks.tugas_id')
            ->whereIn('task_progress.status', ['pending', 'in_progress'])
            ->groupBy('task_progress.buku_id');

        // Ambil buku + info tahapan saat ini (join ke master_tasks via current_order)
        $booksQuery = Book::query()
            ->leftJoinSub($currentStageSub, 'cs', 'cs.buku_id', '=', 'books.buku_id')
            ->leftJoin('master_tasks as mt', 'mt.urutan', '=', 'cs.current_order')
            ->select([
                'books.*',
                'mt.tugas_id as current_tugas_id',
                'mt.nama_tugas as current_stage_name',
                'cs.current_order',
            ])
            ->with([
                'manuscript.author',
                'pic',
                'publisher',
                'taskProgress.masterTask',
                'taskProgress.pic',
            ]);

        // Jika user adalah penerbit, filter hanya naskah miliknya
        if ($user && $user->hasRole('penerbit')) {
            $booksQuery->where('books.penerbit_id', $user->penerbit_id);
        }

        $booksWithStage = $booksQuery->get();

        // Kelompokkan buku per stage_name dengan logika status
        $grouped = $booksWithStage->groupBy(function ($book) {
            // Jika tidak ada task aktif => "Selesai"
            if (!$book->current_stage_name) {
                return 'Selesai';
            }

            // Cek apakah ada task yang tertunda (melewati deadline)
            $hasPendingOverdue = $book->taskProgress
                ->where('status', 'pending')
                ->filter(function ($task) {
                    return $task->deadline && now()->isAfter($task->deadline);
                })
                ->isNotEmpty();

            if ($hasPendingOverdue) {
                return 'Tertunda';
            }

            return $book->current_stage_name;
        })->sortKeys();

        // Jika kamu ingin urutan grup mengikuti urutan master task:
        // Ambil urutan stage dari DB lalu susun ulang array
        $orderedStageNames = DB::table('master_tasks')
            ->orderBy('urutan')
            ->pluck('nama_tugas')
            ->toArray();
        // Pastikan "Selesai" dan "Tertunda" di akhir
        $orderedStageNames[] = 'Tertunda';
        $orderedStageNames[] = 'Selesai';

        $booksByStage = collect($orderedStageNames)->mapWithKeys(function ($stageName) use ($grouped) {
            return [$stageName => $grouped->get($stageName, collect())];
        });

        return Inertia::render('manajemen-naskah/progress', [
            // Untuk tampilan "per stage"
            'BooksByStage' => $booksByStage,
            // Kalau butuh juga data flat:
            'StageOrder' => $orderedStageNames,
            'user' => $user,
        ]);
    }

    // ... rest of methods
}
