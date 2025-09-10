<?php

namespace App\Http\Controllers\naskah;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        'penerbit_id_2' => ['nullable', 'exists:publishers,penerbit_id'],
        
        // Step 2 - Manuscript Data
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
        
        // Step 3 - Profile Data (akan masuk ke UserProfile)
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
        
        // Step 4 - Marketing Data
        'rencana_promosi' => ['required', 'string'],
        'rencana_penjualan' => ['nullable', 'string'],
        'media_sosial' => ['nullable', 'string'],
        'jejaring' => ['nullable', 'string'],
    ]);

    try {
        DB::beginTransaction();

        // 1. Update atau buat UserProfile
        $this->updateOrCreateUserProfile($user->user_id, $validated);

        // 2. Simpan file PDF
        $path = $request->file('file_pdf')->store('manuscripts', ['disk' => 'public']);
        $naskah_id = Str::uuid();

        // 3. Buat Manuscript (tanpa data profil)
        $manuscript = \App\Models\Manuscript::create([
            'penulis_user_id' => $user->user_id,
            'naskah_id' => $naskah_id,
            'judul_naskah' => $validated['judul_naskah'],
            'sinopsis' => $validated['sinopsis'],
            'genre' => $validated['kategori'],
            'status' => 'draft',
            'file_naskah_url' => $path,
            'info_tambahan' => [
                // Manuscript specific data only
                'kata_kunci' => $validated['kata_kunci'] ?? null,
                'tebal_naskah' => $validated['tebal_naskah'] ?? null,
                'target_pembaca_primer' => $validated['target_pembaca_primer'] ?? null,
                'target_pembaca_sekunder' => $validated['target_pembaca_sekunder'] ?? null,
                'segmen_pembaca' => $validated['segmen_pembaca'],
                'selling_point' => $validated['selling_point'] ?? null,
                'bonus_addon' => $validated['bonus_addon'] ?? null,
                'kelebihan_dibanding_tema_sejenis' => $validated['kelebihan_dibanding_tema_sejenis'] ?? null,
                'potensi_alih_media' => $validated['potensi_alih_media'] ?? null,
                // Marketing data
                'rencana_promosi' => $validated['rencana_promosi'],
                'rencana_penjualan' => $validated['rencana_penjualan'] ?? null,
            ],
        ]);

        // 4. Simpan target penerbit
        $this->saveTargetPublishers($naskah_id, $validated);

        DB::commit();

        return redirect()->route('kirim-naskah')
            ->with('success', 'Naskah berhasil dikirim dan profil diperbarui.');

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
    }
}

/**
 * Update atau buat user profile
 */
private function updateOrCreateUserProfile($userId, array $validated)
{
    // Parse media sosial menjadi array jika ada
    $mediaSosial = null;
    if (!empty($validated['media_sosial'])) {
        // Jika string, convert ke array (misal: "Instagram: @username, Twitter: @handle")
        $mediaSosial = is_string($validated['media_sosial']) 
            ? ['data' => $validated['media_sosial']] 
            : $validated['media_sosial'];
    }

    UserProfile::updateOrCreate(
        ['user_id' => $userId],
        [
            'nik' => $validated['nik_penulis'],
            'alamat' => $validated['alamat'],
            'nomor_hp' => $validated['no_hp'],
            'pendidikan' => $validated['pendidikan'],
            'kegiatan_aktif' => $validated['kegiatan_aktif'],
            'karya_tulis' => $validated['karya_tulis_media'],
            'buku_lain' => $validated['judul_buku_lain'],
            'media_sosial' => $mediaSosial,
            'jejaring' => $validated['jejaring'],
        ]
    );

    // Update juga nama penulis di User table jika diperlukan
    if (!empty($validated['nama_penulis_1'])) {
        \App\Models\User::where('user_id', $userId)->update([
            'nama_lengkap' => $validated['nama_penulis_1'],
            'email' => $validated['email'],
        ]);
    }
}

/**
 * Simpan target publishers
 */
private function saveTargetPublishers($naskahId, array $validated)
{
    // Target penerbit prioritas 1
    \App\Models\ManuscriptTargetPublisher::create([
        'naskah_id' => $naskahId,
        'penerbit_id' => $validated['penerbit_id'],
        'prioritas' => 1,
    ]);

    // Target penerbit prioritas 2 (opsional)
    if (!empty($validated['penerbit_id_2'])) {
        \App\Models\ManuscriptTargetPublisher::create([
            'naskah_id' => $naskahId,
            'penerbit_id' => $validated['penerbit_id_2'],
            'prioritas' => 2,
        ]);
    }
}

/**
 * Display the specified resource.
 */
public function show($naskahId)
{
    $user = Auth::user();
    
    // Get manuscript with related data INCLUDING user profile
    $manuscript = \App\Models\Manuscript::with([
        'author:user_id,nama_lengkap,email',
        'author.profile', // Load user profile
        'targetPublishers.publisher:penerbit_id,nama_penerbit'
    ])
    ->where('naskah_id', $naskahId)
    ->where('penulis_user_id', $user->user_id)
    ->firstOrFail();

    return Inertia::render('kirim-naskah/show', [
        'manuscript' => $manuscript,
    ]);
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
