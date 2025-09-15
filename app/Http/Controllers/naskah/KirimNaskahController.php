<?php

namespace App\Http\Controllers\naskah;

use App\Models\Book;
use Inertia\Inertia;
use App\Models\Author;
use App\Models\Manuscript;
use App\Models\UserProfile;
use App\Models\ManuscriptAuthor;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

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

            // Step 3 - Authors Data
            'nama_penulis_1' => ['required', 'string', 'max:255'],
            'nama_penulis_2' => ['nullable', 'string', 'max:255'],
            'email_penulis_2' => ['nullable', 'email', 'max:255'],
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

            // 1. Update basic user profile (data umum)
            $this->updateUserProfile($user->user_id, $validated);

            // 2. Simpan file PDF
            $path = $request->file('file_pdf')->store('manuscripts', ['disk' => 'public']);
            $naskah_id = Str::uuid();

            // 3. Buat Manuscript
            $manuscript = Manuscript::create([
                'penulis_user_id' => $user->user_id, // Keep for backward compatibility
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

            // 4. Handle Authors (NEW)
            $this->handleManuscriptAuthors($naskah_id, $user->user_id, $validated);

            // 5. Simpan target penerbit
            $this->saveTargetPublishers($naskah_id, $validated);

            DB::commit();

            return redirect()->route('kirim-naskah')
                ->with('success', 'Naskah berhasil dikirim!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update basic user profile (data umum saja)
     */
    private function updateUserProfile($userId, array $validated)
    {
        // Update user profile dengan data dasar saja
        UserProfile::updateOrCreate(
            ['user_id' => $userId],
            [
                'nik' => $validated['nik_penulis'],
                'alamat' => $validated['alamat'],
                'nomor_hp' => $validated['no_hp'],
                'pendidikan' => $validated['pendidikan'],
            ]
        );
    }

    /**
     * Handle manuscript authors (NEW METHOD)
     */
    private function handleManuscriptAuthors($naskahId, $userId, array $validated)
    {
        // Primary Author (user yang login)
        $primaryAuthor = Author::updateOrCreate(
            ['user_id' => $userId],
            [
                'nama_lengkap' => $validated['nama_penulis_1'],
                'email' => $validated['email'],
                'nik' => $validated['nik_penulis'],
                'alamat' => $validated['alamat'],
                'nomor_hp' => $validated['no_hp'],
                'pendidikan' => $validated['pendidikan'],
                'kegiatan_aktif' => $validated['kegiatan_aktif'],
                'karya_tulis' => $validated['karya_tulis_media'],
                'buku_lain' => $validated['judul_buku_lain'],
                'media_sosial' => $this->parseMediaSosial($validated['media_sosial']),
                'jejaring' => $validated['jejaring'],
            ]
        );

        // Link primary author to manuscript
        ManuscriptAuthor::create([
            'naskah_id' => $naskahId,
            'author_id' => $primaryAuthor->author_id,
            'role' => 'primary',
            'order_position' => 1,
        ]);

        // Co-Author (if exists)
        if (!empty($validated['nama_penulis_2'])) {
            // Check if co-author already exists by name and email
            $coAuthor = Author::where('nama_lengkap', $validated['nama_penulis_2'])
                ->where('email', $validated['email_penulis_2'] ?? null)
                ->first();

            if (!$coAuthor) {
                // Create new external author
                $coAuthor = Author::create([
                    'user_id' => null, // External author
                    'nama_lengkap' => $validated['nama_penulis_2'],
                    'email' => $validated['email_penulis_2'] ?? null,
                ]);
            }

            // Link co-author to manuscript
            ManuscriptAuthor::create([
                'naskah_id' => $naskahId,
                'author_id' => $coAuthor->author_id,
                'role' => 'co_author',
                'order_position' => 2,
            ]);
        }
    }

    /**
     * Parse media sosial text to structured data
     */
    private function parseMediaSosial($mediaSosial)
    {
        if (empty($mediaSosial)) return null;

        // Parse text format ke structured data
        // Format: "Instagram: @username\nTwitter: @handle\nFacebook: @page"
        $lines = explode("\n", $mediaSosial);
        $parsed = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^([^:]+):\s*(.+)$/', $line, $matches)) {
                $platform = strtolower(trim($matches[1]));
                $info = trim($matches[2]);
                $parsed[$platform] = $info;
            }
        }

        // If no structured format found, save as raw text
        return empty($parsed) ? ['raw' => $mediaSosial] : $parsed;
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
    public function show($naskah_id)
    {
        $user = Auth::user();

        // Get manuscript with authors relationship
        $manuscript = Manuscript::with([
            'authors.user',
            'targetPublishers.publisher:penerbit_id,nama_penerbit'
        ])
            ->where('naskah_id', $naskah_id)
            ->where('penulis_user_id', $user->user_id) // Security check
            ->first();

        if (!$manuscript) {
            return redirect()->route('dashboard')
                ->with('error', 'Naskah tidak ditemukan atau Anda tidak memiliki akses.');
        }

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
