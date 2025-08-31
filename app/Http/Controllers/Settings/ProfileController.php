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
        $user = $request->user();
        
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => [
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'foto_profil_url' => $user->foto_profil_url,
                'profile' => $user->profile ? [
                    'nik' => $user->profile->nik,
                    'alamat' => $user->profile->alamat,
                    'nomor_hp' => $user->profile->nomor_hp,
                    'pendidikan' => $user->profile->pendidikan,
                    'kegiatan_aktif' => $user->profile->kegiatan_aktif,
                    'karya_tulis' => $user->profile->karya_tulis,
                    'buku_lain' => $user->profile->buku_lain,
                    'media_sosial' => $user->profile->media_sosial,
                    'jejaring' => $user->profile->jejaring,
                ] : null,
            ],
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validatedData = $request->validated();

        // Update basic user info
        $user->update([
            'nama_lengkap' => $validatedData['nama_lengkap'],
            'email' => $validatedData['email'],
        ]);

        // Handle profile photo upload
        if ($request->hasFile('foto_profil')) {
            $this->handlePhotoUpload($request, $user);
        }

        // Update or create profile
        $profileData = collect($validatedData)->except(['nama_lengkap', 'email', 'foto_profil'])->toArray();
        
        if ($user->profile) {
            $user->profile->update($profileData);
        } else {
            $user->profile()->create($profileData);
        }

        // Reset email verification if email changed
        if ($user->wasChanged('email')) {
            $user->update(['email_verified_at' => null]);
        }

        return back()->with('status', 'Profil berhasil diperbarui.');
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

        // Delete profile photo if exists
        if ($user->foto_profil_url) {
            Storage::disk('public')->delete($user->foto_profil_url);
        }

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Handle profile photo upload.
     */
    private function handlePhotoUpload(Request $request, $user): void
    {
        // Delete old photo if exists
        if ($user->foto_profil_url) {
            Storage::disk('public')->delete($user->foto_profil_url);
        }

        // Store new photo
        $path = $request->file('foto_profil')->store('profile-pictures', 'public');
        $user->update(['foto_profil_url' => $path]);
    }
}