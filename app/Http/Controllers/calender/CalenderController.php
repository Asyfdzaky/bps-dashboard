<?php

namespace App\Http\Controllers\calender;

use Carbon\Carbon;
use App\Models\Book;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Calendar;
use App\Models\MasterTask;
use Illuminate\Support\Str;
use App\Models\TaskProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class CalenderController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // Ambil progres tugas + relasi untuk judul buku, nama tugas, dan PIC
        $tasks = TaskProgress::with(['book', 'masterTask', 'pic'])->get();

        $taskEvents = $tasks->map(function ($t) use ($today) {
            $deadline = $t->deadline ? Carbon::parse($t->deadline) : null;

            $status = 'proses';
            if ($t->status === 'selesai' || $t->tanggal_selesai) {
                $status = 'selesai';
            } elseif ($deadline && $deadline->isAfter($today) && $deadline->diffInDays($today) <= 3) {
                $status = 'mendekati-deadline';
            } elseif ($deadline && $deadline->isPast() && $t->status !== 'selesai') {
                $status = 'mendekati-deadline';
            }

            // Ambil data dari relasi yang sudah ada
            $taskName = $t->masterTask->nama_tugas ?? 'Tugas';
            $bookTitle = $t->book->judul_buku ?? 'Buku';
            $tahap = $t->masterTask->urutan ?? 1;
            $picName = $t->pic->nama_lengkap ?? 'Tidak ada PIC';

            return [
                'id' => $t->progres_id,
                'title' => ($tahap ? "Tahap {$tahap} - " : '') . "{$taskName} · {$bookTitle}",
                'start' => $deadline ? $deadline->toDateString() : $today->toDateString(),
                'status' => $status,
                'description' => $t->catatan,
                'pic_name' => $picName,
                'allDay' => true,
                'source' => 'task_progress',
            ];
        });

        // Tambahkan event target naik cetak buku
        $books = Book::all();
        $bookEvents = $books->filter(fn($b) => !empty($b->tanggal_target_naik_cetak))->map(function ($b) {
            $status = $b->tanggal_realisasi_naik_cetak ? 'selesai' : 'proses';

            return [
                'id' => 'book_' . $b->buku_id,
                'title' => 'Target Naik Cetak · ' . ($b->judul_buku ?? 'Buku'),
                'start' => Carbon::parse($b->tanggal_target_naik_cetak)->toDateString(),
                'status' => $status,
                'description' => $b->status_keseluruhan,
                'allDay' => true,
                'source' => 'book_target',
            ];
        });

        // Ambil custom calendar events dari database
        $customEvents = Calendar::with(['creator'])
            ->orderBy('start_date')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'start' => $event->start_date->toDateString(),
                    'end' => $event->end_date ? $event->end_date->toDateString() : null,
                    'status' => $event->status,
                    'description' => $event->description,
                    'pic_name' => $event->pic_name,
                    'allDay' => $event->all_day,
                    'created_by' => $event->creator->nama_lengkap ?? null,
                    'source' => 'custom_event',
                ];
            });

        // Gabungkan semua events
        $events = $taskEvents->concat($bookEvents)->concat($customEvents)->values();

        // Ambil data users untuk dropdown PIC
        $users = User::select('user_id', 'nama_lengkap')->orderBy('nama_lengkap')->get();

        return Inertia::render('calender/page', [
            'events' => $events,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start' => 'required|date',
            'end' => 'nullable|date|after_or_equal:start',
            'status' => 'required|in:proses,selesai,mendekati-deadline',
            'pic_name' => 'nullable|string|max:255',
            'all_day' => 'boolean',
            'pic_user_id' => 'nullable|exists:users,user_id',
        ]);

        $user = Auth::user();

        try {
            // If pic_user_id is provided, get user name
            if ($validated['pic_user_id']) {
                $picUser = User::find($validated['pic_user_id']);
                $validated['pic_name'] = $picUser->nama_lengkap;
            }

            Calendar::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'start_date' => $validated['start'],
                'end_date' => $validated['end'] ?? $validated['start'],
                'status' => $validated['status'],
                'pic_name' => $validated['pic_name'],
                'all_day' => $validated['all_day'] ?? true,
                'pic_user_id' => $validated['pic_user_id'],
                'created_by' => $user->user_id,
                'updated_by' => $user->user_id,
            ]);

            return redirect()->back()->with('success', 'Kegiatan berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menambahkan kegiatan: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $event = Calendar::findOrFail($id);
        $user = Auth::user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:proses,selesai,mendekati-deadline',
            'pic_name' => 'nullable|string|max:255',
            'all_day' => 'boolean',
            'pic_user_id' => 'nullable|exists:users,user_id',
        ]);

        // Update pic_name jika ada pic_user_id
        if ($validated['pic_user_id']) {
            $picUser = User::find($validated['pic_user_id']);
            $validated['pic_name'] = $picUser->nama_lengkap;
        }

        $validated['updated_by'] = $user->user_id;

        $event->update($validated);

        return redirect()->back()->with('success', 'Kegiatan berhasil diperbarui');
    }

    public function destroy($id)
    {
        $event = Calendar::findOrFail($id);
        $user = Auth::user();

        $event->update(['updated_by' => $user->user_id]);
        $event->delete();

        return redirect()->back()->with('success', 'Kegiatan berhasil dihapus');
    }
}
