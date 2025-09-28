<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Models\Publisher;
use Illuminate\Http\Request;
use Inertia\Inertia;


class PenerbitController extends Controller
{
    public function index()
    {
        $publishers = Publisher::all();
        return Inertia::render('penerbit/page', ['publishers' => $publishers]);
    }

    public function create()
    {
        return Inertia::render('penerbit/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_penerbit' => 'required|string|max:255',
            'deskripsi_segmen' => 'nullable|string',
        ]);
        Publisher::create($request->only('nama_penerbit', 'deskripsi_segmen'));
        return redirect()->route('penerbit.index');
    }

    public function edit($id)
    {
        $publisher = Publisher::findOrFail($id);
        return Inertia::render('penerbit/edit', ['publisher' => $publisher]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_penerbit' => 'required|string|max:255',
            'deskripsi_segmen' => 'nullable|string',
        ]);
        $publisher = Publisher::findOrFail($id);
        $publisher->update($request->only('nama_penerbit', 'deskripsi_segmen'));
        return redirect()->route('penerbit.index');
    }

    public function destroy($id)
    {
        Publisher::findOrFail($id)->delete();
        return redirect()->route('penerbit.index');
    }
}
