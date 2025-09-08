<?php

namespace App\Http\Controllers\naskah;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class KirimNaskahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    $user = Auth::user();

    $publishers = \App\Models\Publisher::select('penerbit_id', 'nama_penerbit')->orderBy('nama_penerbit')->get();

    return Inertia::render('kirim-naskah/page', [
        'user' => $user,
        'publishers' => $publishers,
    ]);
}

/**
 * Store a newly created resource in storage.
 */
public function store(Request $request)
{
    $user = Auth::user();

    $validated = $request->validate([
        // Step 1
        'penerbit_id' => ['required', 'exists:publishers,penerbit_id'],
        // Step 2
        'judul_naskah' => ['required', 'string', 'max:255'],
        'sinopsis' => ['required', 'string'],
        'kategori' => ['required', 'string', 'max:100'],
        'kata_kunci' => ['nullable', 'string', 'max:255'],
        'tebal_naskah' => ['nullable', 'string', 'max:50'],
        'target_pembaca_primer' => ['nullable', 'string', 'max:255'],
        'target_pembaca_sekunder' => ['nullable', 'string', 'max:255'],
        'segmen_pembaca' => ['required', 'string', 'max:50'],
        'selling_point' => ['nullable', 'string'],
        'bonus_addon' => ['nullable', 'string'],
        'kelebihan_dibanding_tema_sejenis' => ['nullable', 'string'],
        'potensi_alih_media' => ['nullable', 'string'],
        'file_pdf' => ['required', 'file', 'mimetypes:application/pdf', 'max:51200'], // 50MB
        // Step 3
        'nama_penulis_1' => ['required', 'string', 'max:255'],
        'nama_penulis_2' => ['nullable', 'string', 'max:255'],
        'nik_penulis' => ['required', 'string', 'max:100'],
        'alamat' => ['nullable', 'string'],
        'no_hp' => ['required', 'string', 'max:50'],
        'email' => ['required', 'email', 'max:255'],
        'pendidikan' => ['nullable', 'string', 'max:255'],
        'kegiatan_aktif' => ['nullable', 'string'],
        'karya_tulis_media' => ['nullable', 'string'],
        'judul_buku_lain' => ['nullable', 'string'],
        // Step 4
        'rencana_promosi' => ['required', 'string'],
        'rencana_penjualan' => ['nullable', 'string'],
        'media_sosial' => ['nullable', 'string'],
        'jejaring' => ['nullable', 'string'],
    ]);

    // Simpan file PDF
    $path = $request->file('file_pdf')->store('manuscripts', ['disk' => 'public']);
    $naskah_id = Str::uuid();

    // Buat Manuscript
    $manuscript = \App\Models\Manuscript::create([
        'penulis_user_id' => $user->user_id,
        'naskah_id' => $naskah_id,
        'judul_naskah' => $validated['judul_naskah'],
        'sinopsis' => $validated['sinopsis'] ?? null,
        'genre' => $validated['kategori'] ?? null,
        'status' => 'draft',
        'file_naskah_url' => $path, // simpan path di disk public
        'info_tambahan' => [
            'kata_kunci' => $validated['kata_kunci'] ?? null,
            'tebal_naskah' => $validated['tebal_naskah'] ?? null,
            'target_pembaca_primer' => $validated['target_pembaca_primer'] ?? null,
            'target_pembaca_sekunder' => $validated['target_pembaca_sekunder'] ?? null,
            'segmen_pembaca' => $validated['segmen_pembaca'] ?? null,
            'selling_point' => $validated['selling_point'] ?? null,
            'bonus_addon' => $validated['bonus_addon'] ?? null,
            'kelebihan_dibanding_tema_sejenis' => $validated['kelebihan_dibanding_tema_sejenis'] ?? null,
            'potensi_alih_media' => $validated['potensi_alih_media'] ?? null,
            // Profil penulis
            'nama_penulis_1' => $validated['nama_penulis_1'],
            'nama_penulis_2' => $validated['nama_penulis_2'] ?? null,
            'nik_penulis' => $validated['nik_penulis'],
            'alamat' => $validated['alamat'] ?? null,
            'no_hp' => $validated['no_hp'],
            'email' => $validated['email'],
            'pendidikan' => $validated['pendidikan'] ?? null,
            'kegiatan_aktif' => $validated['kegiatan_aktif'] ?? null,
            'karya_tulis_media' => $validated['karya_tulis_media'] ?? null,
            'judul_buku_lain' => $validated['judul_buku_lain'] ?? null,
            // Rencana promosi
            'rencana_promosi' => $validated['rencana_promosi'],
            'rencana_penjualan' => $validated['rencana_penjualan'] ?? null,
            'media_sosial' => $validated['media_sosial'] ?? null,
            'jejaring' => $validated['jejaring'] ?? null,
        ],
    ]);

        // Simpan target penerbit (prioritas 1)
        \App\Models\ManuscriptTargetPublisher::create([
            'naskah_id' => $naskah_id,
            'penerbit_id' => $validated['penerbit_id'],
            'prioritas' => 1,
        ]);
    
        // Simpan target penerbit (prioritas 2) jika ada
        if (!empty($validated['penerbit_id_2'])) {
            \App\Models\ManuscriptTargetPublisher::create([
                'naskah_id' => $naskah_id,
                'penerbit_id' => $validated['penerbit_id_2'],
                'prioritas' => 2,
            ]);
        }
    
        return redirect()->route('kirim-naskah') ->with('success', 'Naskah berhasil dikirim.');
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
