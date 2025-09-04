<?php

namespace App\Http\Controllers\calender;

use App\Http\Controllers\Controller;
use App\Models\TaskProgress;
use App\Models\Book;
use Carbon\Carbon;
use Inertia\Inertia;

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

            $taskName = $t->masterTask->nama_tugas ?? 'Tugas';
            $bookTitle = $t->book->judul_buku ?? 'Buku';
            $tahap = $t->masterTask->urutan ?? null;
            $picName = $t->pic->nama_lengkap ?? null;

            return [
                'id' => $t->progres_id,
                'title' => ($tahap ? "Tahap {$tahap} - " : '') . "{$taskName} · {$bookTitle}",
                'start' => $deadline ? $deadline->toDateString() : $today->toDateString(),
                'status' => $status,
                'description' => $t->catatan,
                'tahap' => $tahap,
                'task_name' => $taskName,
                'pic_name' => $picName,
                'book_title' => $bookTitle,
                'allDay' => true,
            ];
        });

        // Tambahkan event target naik cetak buku
        $books = Book::all();
        $bookEvents = $books->filter(fn ($b) => !empty($b->tanggal_target_naik_cetak))->map(function ($b) {
            $status = $b->tanggal_realisasi_naik_cetak ? 'selesai' : 'proses';

            return [
                'id' => $b->buku_id,
                'title' => 'Target Naik Cetak · ' . ($b->judul_buku ?? 'Buku'),
                'start' => Carbon::parse($b->tanggal_target_naik_cetak)->toDateString(),
                'status' => $status,
                'description' => $b->status_keseluruhan,
                'allDay' => true,
            ];
        });

        $events = $taskEvents->concat($bookEvents)->values();

        return Inertia::render('calender/page', [
            'events' => $events,
        ]);
    }
}