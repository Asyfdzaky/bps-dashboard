<?php

namespace Database\Seeders;

use App\Models\Target;
use App\Models\Publisher;
use Illuminate\Database\Seeder;

class TargetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada publisher terlebih dahulu
        $publishers = Publisher::all();
        
        if ($publishers->isEmpty()) {
            $this->command->warn('Tidak ada publisher ditemukan. Pastikan PublisherSeeder dijalankan terlebih dahulu.');
            return;
        }

        $currentYear = now()->year;
        
        // Buat target untuk setiap publisher
        foreach ($publishers as $publisher) {
            // Target Tahunan - Target Terbit
            Target::firstOrCreate([
                'penerbit_id' => $publisher->penerbit_id,
                'tipe_target' => 'tahunan',
                'kategori' => 'target_terbit',
                'tahun' => $currentYear,
                'bulan' => null, // null untuk target tahunan
            ], [
                'jumlah_target' => rand(50, 150), // Target tahunan 50-150 buku
            ]);
            
            // Target Tahunan - Target Akuisisi
            Target::firstOrCreate([
                'penerbit_id' => $publisher->penerbit_id,
                'tipe_target' => 'tahunan',
                'kategori' => 'target_akuisisi',
                'tahun' => $currentYear,
                'bulan' => null, // null untuk target tahunan
            ], [
                'jumlah_target' => rand(80, 200), // Target akuisisi lebih tinggi
            ]);

            // Target Bulanan untuk setiap bulan - Target Terbit
            for ($month = 1; $month <= 12; $month++) {
                Target::firstOrCreate([
                    'penerbit_id' => $publisher->penerbit_id,
                    'tipe_target' => 'bulanan',
                    'kategori' => 'target_terbit',
                    'tahun' => $currentYear,
                    'bulan' => $month,
                ], [
                    'jumlah_target' => rand(3, 15), // Target bulanan 3-15 buku
                ]);
                
                // Target Bulanan untuk setiap bulan - Target Akuisisi
                Target::firstOrCreate([
                    'penerbit_id' => $publisher->penerbit_id,
                    'tipe_target' => 'bulanan',
                    'kategori' => 'target_akuisisi',
                    'tahun' => $currentYear,
                    'bulan' => $month,
                ], [
                    'jumlah_target' => rand(5, 20), // Target akuisisi bulanan lebih tinggi
                ]);
            }

            // Target Tahunan untuk tahun sebelumnya - Target Terbit
            Target::firstOrCreate([
                'penerbit_id' => $publisher->penerbit_id,
                'tipe_target' => 'tahunan',
                'kategori' => 'target_terbit',
                'tahun' => $currentYear - 1,
                'bulan' => null, // null untuk target tahunan
            ], [
                'jumlah_target' => rand(50, 150), // Target tahunan 50-150 buku
            ]);
            
            // Target Tahunan untuk tahun sebelumnya - Target Akuisisi
            Target::firstOrCreate([
                'penerbit_id' => $publisher->penerbit_id,
                'tipe_target' => 'tahunan',
                'kategori' => 'target_akuisisi',
                'tahun' => $currentYear - 1,
                'bulan' => null, // null untuk target tahunan
            ], [
                'jumlah_target' => rand(80, 200), // Target akuisisi lebih tinggi
            ]);
            
            // Target untuk tahun sebelumnya (untuk data historis) - Target Terbit
            for ($month = 1; $month <= 12; $month++) {
                Target::firstOrCreate([
                    'penerbit_id' => $publisher->penerbit_id,
                    'tipe_target' => 'bulanan',
                    'kategori' => 'target_terbit',
                    'tahun' => $currentYear - 1,
                    'bulan' => $month,
                ], [
                    'jumlah_target' => rand(3, 15),
                ]);
                
                // Target untuk tahun sebelumnya (untuk data historis) - Target Akuisisi
                Target::firstOrCreate([
                    'penerbit_id' => $publisher->penerbit_id,
                    'tipe_target' => 'bulanan',
                    'kategori' => 'target_akuisisi',
                    'tahun' => $currentYear - 1,
                    'bulan' => $month,
                ], [
                    'jumlah_target' => rand(5, 20),
                ]);
            }
        }

        $this->command->info('Target data berhasil dibuat untuk ' . $publishers->count() . ' publisher.');
    }
}
