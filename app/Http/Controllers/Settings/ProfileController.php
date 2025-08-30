<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'user' => [
                'nama_lengkap'   => $request->user()->nama_lengkap,
                'email'          => $request->user()->email,
                'foto_profil_url'=> $request->user()->foto_profil_url
                    
            ],
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // isi field text yang tervalidasi
        $user->fill($request->safe()->only(['nama_lengkap','email']));

        // handle upload foto (opsional)
        if ($request->hasFile('foto_profil')) {
            // hapus file lama kalau ada
            if ($user->foto_profil_url && Storage::disk('public')->exists($user->foto_profil_url)) {
                Storage::disk('public')->delete($user->foto_profil_url);
            }

            // simpan file baru ke disk public
            $path = $request->file('foto_profil')->store('profile-pictures', 'public');

            // simpan path relatif ke DB
            $user->foto_profil_url = $path;
        }

        // jika email berubah, reset verifikasi
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit')->with('status', 'Profil diperbarui.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // opsional: hapus foto saat akun dihapus
        if ($user->foto_profil_url && Storage::disk('public')->exists($user->foto_profil_url)) {
            Storage::disk('public')->delete($user->foto_profil_url);
        }

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
