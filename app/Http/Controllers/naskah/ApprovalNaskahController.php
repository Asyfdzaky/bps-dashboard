<?php

namespace App\Http\Controllers\naskah;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Manuscript;
use App\Models\Book;
use App\Models\Publisher;
use App\Models\User;
use App\Models\MasterTask;
use App\Models\TaskProgress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApprovalNaskahController extends Controller
{
    public function index(Request $request)
    {
        $query = Manuscript::with([
            'author:user_id,nama_lengkap,email',
            'targetPublishers.publisher:penerbit_id,nama_penerbit'
        ]);

        // Filter berdasarkan status
        $status = $request->get('status');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Search filter
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('judul_naskah', 'ILIKE', "%{$search}%")
                  ->orWhereHas('author', function($authorQuery) use ($search) {
                      $authorQuery->where('nama_lengkap', 'ILIKE', "%{$search}%");
                  });
            });
        }

        $manuscripts = $query->orderBy('created_at', 'desc')->get();

        // Statistics
        $stats = [
            'pending' => Manuscript::where('status', 'review')->count(),
            'approved' => Manuscript::where('status', 'approved')->count(),
            'rejected' => Manuscript::where('status', 'canceled')->count(),
            'total' => Manuscript::count(),
        ];

        return Inertia::render('manajemen-naskah/approval-naskah/approval-naskah', [
            'manuscripts' => $manuscripts,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $request->get('search', ''),
            ]
        ]);
    }

    public function show($naskahId)
    {
        $manuscript = Manuscript::with([
            'author:user_id,nama_lengkap,email',
            'targetPublishers.publisher:penerbit_id,nama_penerbit'
        ])->findOrFail($naskahId);

        return Inertia::render('manajemen-naskah/approval-naskah/approval-detail', [
            'manuscript' => $manuscript,
        ]);
    }

    public function approve(Request $request, $naskahId)
    {
        $request->validate([
            'penerbit_id' => 'required|exists:publishers,penerbit_id',
            'pic_user_id' => 'required|exists:users,user_id',
            'catatan_approval' => 'nullable|string',
            'target_naik_cetak' => 'required|date|after:today',
        ]);

        DB::beginTransaction();
        
        try {
            // Update manuscript status
            $manuscript = Manuscript::findOrFail($naskahId);
            $manuscript->update([
                'status' => 'approved',
                'info_tambahan' => array_merge($manuscript->info_tambahan ?? [], [
                    'catatan_approval' => $request->catatan_approval,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                ])
            ]);

            // Create book from manuscript
            $book = Book::create([
                'buku_id' => Str::uuid(),
                'naskah_id' => $manuscript->naskah_id,
                'judul_buku' => $manuscript->judul_naskah,
                'sinopsis' => $manuscript->sinopsis,
                'genre' => $manuscript->genre,
                'penerbit_id' => $request->penerbit_id,
                'pic_user_id' => $request->pic_user_id,
                'penulis_user_id' => $manuscript->penulis_user_id,
                'tanggal_masuk' => now(),
                'tanggal_target_naik_cetak' => $request->target_naik_cetak,
                'status_keseluruhan' => 'draft',
                'progress_keseluruhan' => 0,
            ]);

            // Create initial tasks
            $masterTasks = MasterTask::orderBy('urutan')->get();
            foreach ($masterTasks as $task) {
                TaskProgress::create([
                    'buku_id' => $book->buku_id,
                    'tugas_id' => $task->tugas_id,
                    'pic_user_id' => $request->pic_user_id,
                    'status' => 'pending',
                    'progress_percentage' => 0,
                    'tanggal_mulai' => now(),
                    'tanggal_target' => now()->addDays($task->estimasi_hari ?? 7),
                ]);
            }

            DB::commit();

            return redirect()->route('approval-naskah.index')
                ->with('success', 'Naskah berhasil diapprove dan dibuat menjadi proyek buku.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Terjadi kesalahan saat approve naskah: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, $naskahId)
    {
        $request->validate([
            'alasan_penolakan' => 'required|string|min:10',
        ]);

        $manuscript = Manuscript::findOrFail($naskahId);
        $manuscript->update([
            'status' => 'canceled',
            'info_tambahan' => array_merge($manuscript->info_tambahan ?? [], [
                'alasan_penolakan' => $request->alasan_penolakan,
                'rejected_by' => Auth::id(),
                'rejected_at' => now(),
            ])
        ]);

        return redirect()->route('approval-naskah.index')
            ->with('success', 'Naskah berhasil ditolak.');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'manuscript_ids' => 'required|array',
            'manuscript_ids.*' => 'exists:manuscripts,naskah_id',
        ]);

        $count = 0;
        foreach ($request->manuscript_ids as $naskahId) {
            if ($request->action === 'approve') {
                // Bulk approve logic would need additional data
                // For now, just update status
                Manuscript::where('naskah_id', $naskahId)->update(['status' => 'approved']);
            } else {
                Manuscript::where('naskah_id', $naskahId)->update(['status' => 'canceled']);
            }
            $count++;
        }

        return back()->with('success', "{$count} naskah berhasil di{$request->action}.");
    }
}