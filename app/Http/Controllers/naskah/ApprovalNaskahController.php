<?php

namespace App\Http\Controllers\naskah;

use App\Models\Book;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Publisher;
use App\Models\Manuscript;
use App\Models\MasterTask;
use Illuminate\Support\Str;
use App\Models\TaskProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class ApprovalNaskahController extends Controller
{
    public function index(Request $request)
    {
        $query = Manuscript::with([
            'author:user_id,nama_lengkap,email',
            'targetPublishers.publisher:penerbit_id,nama_penerbit'
        ]);

        $manuscripts = $query->orderBy('created_at', 'desc')->get();

        // Statistik
        $stats = [
            'draft' => Manuscript::where('status', 'draft')->count(),
            'pending' => Manuscript::where('status', 'review')->count(),
            'approved' => Manuscript::where('status', 'approved')->count(),
            'rejected' => Manuscript::where('status', 'cancelled')->count(),
            'total' => Manuscript::count(),
        ];

        return Inertia::render('approval-naskah/approval-naskah', [
            'manuscripts' => $manuscripts,
            'stats' => $stats,
        ]);
    }

    public function show($naskah_id)
    {
        $manuscript = Manuscript::with([
            'author:user_id,nama_lengkap,email',
            'targetPublishers.publisher:penerbit_id,nama_penerbit'
        ])->findOrFail($naskah_id);

        return Inertia::render('approval-naskah/approval-detail', [
            'manuscript' => $manuscript,
        ]);
    }

    public function approve(Request $request, $naskah_id)
    {
        $request->validate([
            'catatan_approval' => 'nullable|string|max:1000',
            'target_dates' => 'nullable|array',
            'target_dates.*' => 'nullable|date|after:today',
        ]);

        try {
            DB::beginTransaction();

            $manuscript = Manuscript::with('targetPublishers.publisher')->findOrFail($naskah_id);

            // Validasi status
            if (!in_array($manuscript->status, ['draft', 'review'])) {
                return redirect()->route('approval-naskah.index')->with('error', 'Hanya naskah dengan status draft atau review yang dapat diapprove.');
            }

            // Validasi target publishers
            if ($manuscript->targetPublishers->isEmpty()) {
                return redirect()->route('approval-naskah.index')->with('error', 'Naskah harus memiliki target penerbit sebelum dapat diapprove.');
            }

            // Update status manuscript
            $manuscript->update([
                'status' => 'approved',
                'info_tambahan' => array_merge($manuscript->info_tambahan ?? [], [
                    'approved_by' => Auth::id(),
                    'approved_at' => now()->toISOString(),
                    'catatan_approval' => $request->catatan_approval,
                ])
            ]);

            // Buat entry book untuk setiap target publisher
            foreach ($manuscript->targetPublishers as $target) {
                $publisherId = $request->selected_publisher;
                // Ambil target date dari request, atau default 30 hari dari sekarang
                $targetDate = isset($request->target_dates[$publisherId]) && $request->target_dates[$publisherId]
                    ? $request->target_dates[$publisherId]
                    : now()->addDays(30)->format('Y-m-d');

                // Cek jika book sudah ada untuk kombinasi naskah + publisher ini
                $existingBook = Book::where('naskah_id', $manuscript->naskah_id)
                    ->where('penerbit_id', $publisherId)
                    ->first();

                if (!$existingBook) {
                    Book::create([
                        'buku_id' => (string) Str::uuid(),
                        'naskah_id' => $manuscript->naskah_id,
                        'judul_buku' => $manuscript->judul_naskah,
                        'pic_user_id' => null,
                        'penerbit_id' => $publisherId,
                        'status_keseluruhan' => 'draft',
                        'tanggal_target_naik_cetak' => $targetDate,
                        'tanggal_realisasi_naik_cetak' => null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('approval-naskah.index')
                ->with('success', "Naskah '{$manuscript->judul_naskah}' berhasil diapprove dan masuk ke {$manuscript->targetPublishers->count()} penerbit.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Approve Naskah Error', [
                'naskah_id' => $naskah_id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('approval-naskah.index')->with('error', 'Terjadi kesalahan saat approve naskah: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, $naskah_id)
    {
        $request->validate([
            'alasan_penolakan' => 'required|string|min:10',
        ]);

        $manuscript = Manuscript::findOrFail($naskah_id);
        $manuscript->update([
            'status' => 'cancelled',
            'info_tambahan' => array_merge($manuscript->info_tambahan ?? [], [
                'alasan_penolakan' => $request->alasan_penolakan,
                'rejected_by' => Auth::id(),
                'rejected_at' => now(),
            ])
        ]);

        return redirect()->route('approval-naskah.index')
            ->with('success', 'Naskah berhasil ditolak.');
    }

    public function review(Request $request, $naskah_id)
    {
        try {
            $manuscript = Manuscript::findOrFail($naskah_id);

            // Validasi status harus draft
            if ($manuscript->status !== 'draft') {
                return redirect()->route('approval-naskah.index')->with('error', 'Hanya naskah dengan status draft yang dapat direview.');
            }

            $manuscript->update([
                'status' => 'review',
                'info_tambahan' => array_merge($manuscript->info_tambahan ?? [], [
                    'reviewed_by' => Auth::id(),
                    'reviewed_at' => now(),
                ])
            ]);

            return redirect()->route('approval-naskah.index')
                ->with('success', "Naskah '{$manuscript->judul_naskah}' berhasil diubah ke status review.");
        } catch (\Exception $e) {
            return redirect()->route('approval-naskah.index')->with('error', 'Terjadi kesalahan saat memulai review: ' . $e->getMessage());
        }
    }
}
