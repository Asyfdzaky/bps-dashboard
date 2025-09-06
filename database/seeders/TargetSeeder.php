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
            // Target Tahunan
            Target::firstOrCreate([
                'penerbit_id' => $publisher->penerbit_id,
                'tipe_target' => 'tahunan',
                'tahun' => $currentYear,
                'bulan' => 0, // 0 untuk target tahunan
            ], [
                'jumlah_target' => rand(50, 150), // Target tahunan 50-150 buku
            ]);

            // Target Bulanan untuk setiap bulan
            for ($month = 1; $month <= 12; $month++) {
                Target::firstOrCreate([
                    'penerbit_id' => $publisher->penerbit_id,
                    'tipe_target' => 'bulanan',
                    'tahun' => $currentYear,
                    'bulan' => $month,
                ], [
                    'jumlah_target' => rand(3, 15), // Target bulanan 3-15 buku
                ]);
            }

            // Target untuk tahun sebelumnya (untuk data historis)
            for ($month = 1; $month <= 12; $month++) {
                Target::firstOrCreate([
                    'penerbit_id' => $publisher->penerbit_id,
                    'tipe_target' => 'bulanan',
                    'tahun' => $currentYear - 1,
                    'bulan' => $month,
                ], [
                    'jumlah_target' => rand(3, 15),
                ]);
            }
        }

        $this->command->info('Target data berhasil dibuat untuk ' . $publishers->count() . ' publisher.');
    }
}
