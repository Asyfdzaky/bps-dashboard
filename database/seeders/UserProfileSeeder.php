<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;

class UserProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users
        $users = User::all();

        foreach ($users as $user) {
            // Check if user already has profile
            if (!$user->profile) {
                UserProfile::create([
                    'user_id' => $user->user_id,
                    'nik' => $this->generateNIK(),
                    'alamat' => $this->generateAddress(),
                    'nomor_hp' => $this->generatePhoneNumber(),
                    'pendidikan' => $this->generateEducation(),
                    'kegiatan_aktif' => $this->generateActiveActivities(),
                    'karya_tulis' => $this->generateWritingWorks(),
                    'buku_lain' => $this->generateOtherBooks(),
                    'media_sosial' => $this->generateSocialMedia(),
                    'jejaring' => $this->generateNetworking(),
                ]);
            }
        }
    }

    private function generateNIK(): string
    {
        // Generate random 16-digit NIK
        return str_pad(rand(1, 9999999999999999), 16, '0', STR_PAD_LEFT);
    }

    private function generateAddress(): string
    {
        $cities = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Yogyakarta', 'Malang', 'Palembang'];
        $streets = ['Jl. Sudirman', 'Jl. Thamrin', 'Jl. Gatot Subroto', 'Jl. Hayam Wuruk', 'Jl. Gajah Mada'];
        
        $city = $cities[array_rand($cities)];
        $street = $streets[array_rand($streets)];
        $number = rand(1, 999);
        
        return "$street No. $number, $city";
    }

    private function generatePhoneNumber(): string
    {
        $prefixes = ['0812', '0813', '0814', '0815', '0816', '0817', '0818', '0819', '0855', '0856', '0857', '0858', '0859'];
        $prefix = $prefixes[array_rand($prefixes)];
        $number = str_pad(rand(1, 99999999), 8, '0', STR_PAD_LEFT);
        
        return "$prefix$number";
    }

    private function generateEducation(): string
    {
        $educations = [
            'S1 Statistika - Universitas Indonesia',
            'S1 Ekonomi - Universitas Gadjah Mada',
            'S1 Matematika - Institut Teknologi Bandung',
            'S2 Statistika - Universitas Padjadjaran',
            'S1 Ilmu Komputer - Universitas Brawijaya',
            'S1 Ekonomi Pembangunan - Universitas Airlangga',
            'S1 Matematika - Universitas Diponegoro',
            'S2 Ekonomi - Universitas Indonesia',
        ];
        
        return $educations[array_rand($educations)];
    }

    private function generateActiveActivities(): string
    {
        $activities = [
            'Peneliti di Pusat Statistik',
            'Dosen di Universitas Negeri',
            'Konsultan Data dan Statistik',
            'Penulis Buku Ajar',
            'Penerjemah Dokumen Teknis',
            'Editor Jurnal Ilmiah',
            'Trainer Workshop Statistik',
            'Konsultan Penelitian',
        ];
        
        return $activities[array_rand($activities)];
    }

    private function generateWritingWorks(): string
    {
        $works = [
            'Buku "Statistika Dasar untuk Peneliti" (2023)',
            'Jurnal "Analisis Data Kependudukan" (2022)',
            'Buku "Metodologi Penelitian Kuantitatif" (2021)',
            'Artikel "Penerapan Statistik dalam Ekonomi" (2023)',
            'Buku "Pengantar Ekonometrika" (2022)',
            'Jurnal "Statistika Terapan untuk Bisnis" (2021)',
            'Buku "Analisis Regresi dan Korelasi" (2023)',
            'Artikel "Statistika dalam Penelitian Sosial" (2022)',
        ];
        
        return $works[array_rand($works)];
    }

    private function generateOtherBooks(): string
    {
        $books = [
            'Buku "Matematika Ekonomi" (2020)',
            'Buku "Statistika Bisnis" (2019)',
            'Buku "Metode Penelitian" (2018)',
            'Buku "Analisis Data dengan SPSS" (2021)',
            'Buku "Statistika untuk Penelitian" (2020)',
            'Buku "Ekonometrika Dasar" (2019)',
            'Buku "Statistika Deskriptif" (2018)',
            'Buku "Metode Sampling" (2021)',
        ];
        
        return $books[array_rand($books)];
    }

    private function generateSocialMedia(): array
    {
        $platforms = ['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'YouTube'];
        $socialMedia = [];
        
        // Randomly select 2-4 platforms
        $selectedPlatforms = array_rand($platforms, rand(2, 4));
        if (!is_array($selectedPlatforms)) {
            $selectedPlatforms = [$selectedPlatforms];
        }
        
        foreach ($selectedPlatforms as $index) {
            $platform = $platforms[$index];
            $socialMedia[$platform] = $this->generateSocialMediaHandle($platform);
        }
        
        return $socialMedia;
    }

    private function generateSocialMediaHandle(string $platform): string
    {
        $names = ['john_doe', 'jane_smith', 'researcher_123', 'data_analyst', 'statistician_pro', 'academic_writer'];
        $name = $names[array_rand($names)];
        
        switch ($platform) {
            case 'LinkedIn':
                return "linkedin.com/in/$name";
            case 'Twitter':
                return "@$name";
            case 'Instagram':
                return "@$name";
            case 'Facebook':
                return "facebook.com/$name";
            case 'YouTube':
                return "youtube.com/@$name";
            default:
                return $name;
        }
    }

    private function generateNetworking(): string
    {
        $networks = [
            'Ikatan Statistikawan Indonesia (ISI)',
            'Himpunan Ahli Statistik Indonesia (HASTI)',
            'Asosiasi Peneliti Indonesia (API)',
            'Ikatan Penerjemah Indonesia (HPI)',
            'Asosiasi Penulis Buku Indonesia (APBI)',
            'Himpunan Peneliti Indonesia (HIMPI)',
            'Asosiasi Konsultan Indonesia (AKI)',
            'Ikatan Dosen Indonesia (IKADI)',
        ];
        
        return $networks[array_rand($networks)];
    }
}
