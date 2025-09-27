<?php

namespace App\Http\Controllers;

use App\Models\MasterTask;
use Illuminate\Http\Request;
use Inertia\Inertia;

class taskController extends Controller
{
    public function index()
    {
        $tasks = MasterTask::orderBy('urutan')->get();
        return Inertia::render('manajemen-task/page', ['tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $request->validate(['nama_tugas' => 'required|string|max:255']);
        $maxUrutan = MasterTask::max('urutan') ?? 0;
        MasterTask::create([
            'nama_tugas' => $request->nama_tugas,
            'urutan' => $maxUrutan + 1,
        ]);
        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $request->validate(['nama_tugas' => 'required|string|max:255']);
        $task = MasterTask::findOrFail($id);
        $task->update(['nama_tugas' => $request->nama_tugas]);
        return redirect()->back();
    }

    public function destroy($id)
    {
        MasterTask::findOrFail($id)->delete();
        return redirect()->back();
    }

    public function reorder(Request $request)
    {
        // Validasi request
        $request->validate([
            'order' => 'required|array',
            'order.*.tugas_id' => 'required|exists:master_tasks,tugas_id',
            'order.*.urutan' => 'required|integer|min:1'
        ]);

        try {
            foreach ($request->order as $item) {
                MasterTask::where('tugas_id', $item['tugas_id'])
                    ->update(['urutan' => $item['urutan']]);
            }

            // Kembalikan redirect back untuk Inertia
            return redirect()->back()->with('success', 'Urutan task berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui urutan task');
        }
    }
}
