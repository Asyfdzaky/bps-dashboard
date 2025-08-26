<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Manuscript;
use App\Models\Publisher;
use App\Models\User;
use App\Models\MasterTask;
use App\Models\TaskProgress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BukuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada data yang diperlukan terlebih dahulu
        $this->createPublishers();
        $this->createMasterTasks();
        $this->createManuscripts();
        $this->createBooks();
        $this->createTaskProgress();
    }

    private function createPublishers()
    {
        $publishers = [
            [
                'nama_penerbit' => 'Gramedia Pustaka Utama',
                'deskripsi_segmen' => 'Fiksi & Non-Fiksi Umum'
            ],
            [
                'nama_penerbit' => 'Elex Media Komputindo',
                'deskripsi_segmen' => 'Teknologi & Programming'
            ],
            [
                'nama_penerbit' => 'Penerbit Erlangga',
                'deskripsi_segmen' => 'Pendidikan & Akademik'
            ],
            [
                'nama_penerbit' => 'Mizan Pustaka',
                'deskripsi_segmen' => 'Agama & Spiritual'
            ],
            [
                'nama_penerbit' => 'Kompas Media Nusantara',
                'deskripsi_segmen' => 'Berita & Jurnalistik'
            ]
        ];

        foreach ($publishers as $publisher) {
            Publisher::firstOrCreate(
                ['nama_penerbit' => $publisher['nama_penerbit']],
                $publisher
            );
        }
    }

    private function createMasterTasks()
    {
        $tasks = [
            [
                'nama_tugas' => 'Cover Design',
                'urutan' => 1
            ],
            [
                'nama_tugas' => 'Pengantar & Endors',
                'urutan' => 2
            ],
            [
                'nama_tugas' => 'Editing Naskah',
                'urutan' => 3
            ],
            [
                'nama_tugas' => 'Draf PK & Peta Buku',
                'urutan' => 4
            ],
            [
                'nama_tugas' => 'Layout',
                'urutan' => 5
            ],
            [
                'nama_tugas' => 'Desain Peta Buku',
                'urutan' => 6
            ],
            [
                'nama_tugas' => 'Print & Proofread Awal',
                'urutan' => 7
            ],
            [
                'nama_tugas' => 'QC Isi & ACC Kover Final',
                'urutan' => 8
            ],
            [
                'nama_tugas' => 'Finishing Produksi',
                'urutan' => 9
            ],
            [
                'nama_tugas' => 'SPH',
                'urutan' => 10
            ],
            [
                'nama_tugas' => 'PK Final',
                'urutan' => 11
            ],
            [
                'nama_tugas' => 'Cetak Awal Dummy',
                'urutan' => 12
            ],
            [
                'nama_tugas' => 'Proofread Akhir',
                'urutan' => 13
            ],
            [
                'nama_tugas' => 'Input Akhir',
                'urutan' => 14
            ],
            [
                'nama_tugas' => 'Cetak Dummy Digital Printing (opsional)',
                'urutan' => 15
            ],
            [
                'nama_tugas' => 'Naik Cetak',
                'urutan' => 16
            ],
            [
                'nama_tugas' => 'Turun Cetak',
                'urutan' => 17
            ]
        ];

        foreach ($tasks as $task) {
            MasterTask::firstOrCreate(
                ['nama_tugas' => $task['nama_tugas']],
                $task
            );
        }
    }

    private function createManuscripts()
    {
        // Pastikan user penulis ada
        $penulis = User::where('email', 'penulis@bps.com')->first();
        if (!$penulis) {
            throw new \Exception('User penulis@bps.com tidak ditemukan. Pastikan DatabaseSeeder dijalankan terlebih dahulu.');
        }

        $manuscripts = [
            [
                'judul_naskah' => 'Panduan Lengkap Laravel untuk Pemula',
                'sinopsis' => 'Buku komprehensif untuk mempelajari framework Laravel dari dasar hingga mahir.',
                'genre' => 'Programming',
                'status' => 'approved'
            ],
            [
                'judul_naskah' => 'React.js: Modern Web Development',
                'sinopsis' => 'Panduan lengkap pengembangan web modern menggunakan React.js.',
                'genre' => 'Programming',
                'status' => 'review'
            ],
            [
                'judul_naskah' => 'Database Design Principles',
                'sinopsis' => 'Prinsip-prinsip fundamental dalam merancang database yang efisien.',
                'genre' => 'Programming',
                'status' => 'approved'
            ],
            [
                'judul_naskah' => 'UI/UX Design Fundamentals',
                'sinopsis' => 'Dasar-dasar desain antarmuka dan pengalaman pengguna.',
                'genre' => 'Design',
                'status' => 'draft'
            ],
            [
                'judul_naskah' => 'Python for Data Science',
                'sinopsis' => 'Penggunaan Python untuk analisis data dan machine learning.',
                'genre' => 'Programming',
                'status' => 'cancelled'
            ]
        ];

        $createdManuscripts = [];
        foreach ($manuscripts as $manuscript) {
            $createdManuscript = Manuscript::firstOrCreate(
                ['judul_naskah' => $manuscript['judul_naskah']],
                array_merge($manuscript, [
                    'penulis_user_id' => $penulis->user_id,
                    'tanggal_masuk' => now()->subDays(rand(10, 30))
                ])
            );
            $createdManuscripts[] = $createdManuscript;
        }

        return $createdManuscripts;
    }

    private function createBooks()
    {
        // Pastikan user yang diperlukan ada
        $manajer = User::where('email', 'manajer@bps.com')->first();
        $produksi = User::where('email', 'produksi@bps.com')->first();
        
        if (!$manajer || !$produksi) {
            throw new \Exception('User manajer@bps.com atau produksi@bps.com tidak ditemukan. Pastikan DatabaseSeeder dijalankan terlebih dahulu.');
        }

        // Ambil ID penerbit berdasarkan nama
        $publishers = [
            'Elex Media Komputindo' => Publisher::where('nama_penerbit', 'Elex Media Komputindo')->first()->penerbit_id,
            'Penerbit Erlangga' => Publisher::where('nama_penerbit', 'Penerbit Erlangga')->first()->penerbit_id,
            'Gramedia Pustaka Utama' => Publisher::where('nama_penerbit', 'Gramedia Pustaka Utama')->first()->penerbit_id,
        ];

        // Ambil manuscripts yang sudah dibuat
        $manuscripts = Manuscript::all();

        $books = [
            [
                'judul_buku' => 'Panduan Lengkap Laravel untuk Pemula',
                'pic_user_id' => $manajer->user_id,
                'penerbit_id' => $publishers['Elex Media Komputindo'],
                'status_keseluruhan' => 'published',
                'tanggal_target_naik_cetak' => now()->addDays(30),
                'tanggal_realisasi_naik_cetak' => now()->subDays(5)
            ],
            [
                'judul_buku' => 'React.js: Modern Web Development',
                'pic_user_id' => $produksi->user_id,
                'penerbit_id' => $publishers['Elex Media Komputindo'],
                'status_keseluruhan' => 'review',
                'tanggal_target_naik_cetak' => now()->addDays(45)
            ],
            [
                'judul_buku' => 'Database Design Principles',
                'pic_user_id' => $produksi->user_id,
                'penerbit_id' => $publishers['Penerbit Erlangga'],
                'status_keseluruhan' => 'editing',
                'tanggal_target_naik_cetak' => now()->addDays(60)
            ],
            [
                'judul_buku' => 'UI/UX Design Fundamentals',
                'pic_user_id' => $manajer->user_id,
                'penerbit_id' => $publishers['Gramedia Pustaka Utama'],
                'status_keseluruhan' => 'draft',
                'tanggal_target_naik_cetak' => now()->addDays(90)
            ],
            [
                'judul_buku' => 'Python for Data Science',
                'pic_user_id' => $produksi->user_id,
                'penerbit_id' => $publishers['Elex Media Komputindo'],
                'status_keseluruhan' => 'cancelled',
                'tanggal_target_naik_cetak' => now()->addDays(75)
            ]
        ];

        $createdBooks = [];
        foreach ($books as $index => $book) {
            $createdBook = Book::firstOrCreate(
                ['judul_buku' => $book['judul_buku']],
                array_merge($book, [
                    'naskah_id' => $manuscripts[$index]->naskah_id
                ])
            );
            $createdBooks[] = $createdBook;
        }

        return $createdBooks;
    }

    private function createTaskProgress()
    {
        // Pastikan user yang diperlukan ada
        $manajer = User::where('email', 'manajer@bps.com')->first();
        $produksi = User::where('email', 'produksi@bps.com')->first();
        
        if (!$manajer || !$produksi) {
            throw new \Exception('User manajer@bps.com atau produksi@bps.com tidak ditemukan. Pastikan DatabaseSeeder dijalankan terlebih dahulu.');
        }

        // Ambil ID master tasks berdasarkan nama
        $masterTasks = [
            'Cover Design' => MasterTask::where('nama_tugas', 'Cover Design')->first()->tugas_id,
            'Pengantar & Endors' => MasterTask::where('nama_tugas', 'Pengantar & Endors')->first()->tugas_id,
            'Editing Naskah' => MasterTask::where('nama_tugas', 'Editing Naskah')->first()->tugas_id,
            'Draf PK & Peta Buku' => MasterTask::where('nama_tugas', 'Draf PK & Peta Buku')->first()->tugas_id,
            'Layout' => MasterTask::where('nama_tugas', 'Layout')->first()->tugas_id,
            'Desain Peta Buku' => MasterTask::where('nama_tugas', 'Desain Peta Buku')->first()->tugas_id,
            'Print & Proofread Awal' => MasterTask::where('nama_tugas', 'Print & Proofread Awal')->first()->tugas_id,
            'QC Isi & ACC Kover Final' => MasterTask::where('nama_tugas', 'QC Isi & ACC Kover Final')->first()->tugas_id,
            'Finishing Produksi' => MasterTask::where('nama_tugas', 'Finishing Produksi')->first()->tugas_id,
            'SPH' => MasterTask::where('nama_tugas', 'SPH')->first()->tugas_id,
            'PK Final' => MasterTask::where('nama_tugas', 'PK Final')->first()->tugas_id,
            'Cetak Awal Dummy' => MasterTask::where('nama_tugas', 'Cetak Awal Dummy')->first()->tugas_id,
            'Proofread Akhir' => MasterTask::where('nama_tugas', 'Proofread Akhir')->first()->tugas_id,
            'Input Akhir' => MasterTask::where('nama_tugas', 'Input Akhir')->first()->tugas_id,
            'Cetak Dummy Digital Printing (opsional)' => MasterTask::where('nama_tugas', 'Cetak Dummy Digital Printing (opsional)')->first()->tugas_id,
            'Naik Cetak' => MasterTask::where('nama_tugas', 'Naik Cetak')->first()->tugas_id,
            'Turun Cetak' => MasterTask::where('nama_tugas', 'Turun Cetak')->first()->tugas_id,
        ];

        // Ambil books yang sudah dibuat
        $books = Book::all();

        $taskProgress = [
            // Book 1 - Published (100% complete - semua task selesai)
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Cover Design'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(25),
                'tanggal_mulai' => now()->subDays(30),
                'tanggal_selesai' => now()->subDays(25),
                'catatan' => 'Cover design selesai dan disetujui'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Pengantar & Endors'],
                'pic_tugas_user_id' => $manajer->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(24),
                'tanggal_mulai' => now()->subDays(29),
                'tanggal_selesai' => now()->subDays(24),
                'catatan' => 'Pengantar dan endors selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Editing Naskah'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(23),
                'tanggal_mulai' => now()->subDays(28),
                'tanggal_selesai' => now()->subDays(23),
                'catatan' => 'Editing naskah selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Draf PK & Peta Buku'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(22),
                'tanggal_mulai' => now()->subDays(27),
                'tanggal_selesai' => now()->subDays(22),
                'catatan' => 'Draf PK dan peta buku selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Layout'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(21),
                'tanggal_mulai' => now()->subDays(26),
                'tanggal_selesai' => now()->subDays(21),
                'catatan' => 'Layout selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Desain Peta Buku'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(20),
                'tanggal_mulai' => now()->subDays(25),
                'tanggal_selesai' => now()->subDays(20),
                'catatan' => 'Desain peta buku selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Print & Proofread Awal'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(19),
                'tanggal_mulai' => now()->subDays(24),
                'tanggal_selesai' => now()->subDays(19),
                'catatan' => 'Print dan proofread awal selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['QC Isi & ACC Kover Final'],
                'pic_tugas_user_id' => $manajer->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(18),
                'tanggal_mulai' => now()->subDays(23),
                'tanggal_selesai' => now()->subDays(18),
                'catatan' => 'QC isi dan ACC cover final selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Finishing Produksi'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(17),
                'tanggal_mulai' => now()->subDays(22),
                'tanggal_selesai' => now()->subDays(17),
                'catatan' => 'Finishing produksi selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['SPH'],
                'pic_tugas_user_id' => $manajer->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(16),
                'tanggal_mulai' => now()->subDays(21),
                'tanggal_selesai' => now()->subDays(16),
                'catatan' => 'SPH selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['PK Final'],
                'pic_tugas_user_id' => $manajer->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(15),
                'tanggal_mulai' => now()->subDays(20),
                'tanggal_selesai' => now()->subDays(15),
                'catatan' => 'PK final selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Cetak Awal Dummy'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(14),
                'tanggal_mulai' => now()->subDays(19),
                'tanggal_selesai' => now()->subDays(14),
                'catatan' => 'Cetak awal dummy selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Proofread Akhir'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(13),
                'tanggal_mulai' => now()->subDays(18),
                'tanggal_selesai' => now()->subDays(13),
                'catatan' => 'Proofread akhir selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Input Akhir'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(12),
                'tanggal_mulai' => now()->subDays(17),
                'tanggal_selesai' => now()->subDays(12),
                'catatan' => 'Input akhir selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Cetak Dummy Digital Printing (opsional)'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(11),
                'tanggal_mulai' => now()->subDays(16),
                'tanggal_selesai' => now()->subDays(11),
                'catatan' => 'Cetak dummy digital printing selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Naik Cetak'],
                'pic_tugas_user_id' => $manajer->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(10),
                'tanggal_mulai' => now()->subDays(15),
                'tanggal_selesai' => now()->subDays(10),
                'catatan' => 'Naik cetak selesai'
            ],
            [
                'buku_id' => $books[0]->buku_id,
                'tugas_id' => $masterTasks['Turun Cetak'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(5),
                'tanggal_mulai' => now()->subDays(10),
                'tanggal_selesai' => now()->subDays(5),
                'catatan' => 'Turun cetak selesai'
            ],

            // Book 2 - Review (60% complete - beberapa task selesai, beberapa sedang berjalan)
            [
                'buku_id' => $books[1]->buku_id,
                'tugas_id' => $masterTasks['Cover Design'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(10),
                'tanggal_mulai' => now()->subDays(15),
                'tanggal_selesai' => now()->subDays(10),
                'catatan' => 'Cover design selesai'
            ],
            [
                'buku_id' => $books[1]->buku_id,
                'tugas_id' => $masterTasks['Pengantar & Endors'],
                'pic_tugas_user_id' => $manajer->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(8),
                'tanggal_mulai' => now()->subDays(13),
                'tanggal_selesai' => now()->subDays(8),
                'catatan' => 'Pengantar dan endors selesai'
            ],
            [
                'buku_id' => $books[1]->buku_id,
                'tugas_id' => $masterTasks['Editing Naskah'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'in_progress',
                'deadline' => now()->addDays(5),
                'tanggal_mulai' => now()->subDays(7),
                'catatan' => 'Editing naskah sedang berjalan'
            ],
            [
                'buku_id' => $books[1]->buku_id,
                'tugas_id' => $masterTasks['Draf PK & Peta Buku'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'pending',
                'deadline' => now()->addDays(10),
                'catatan' => 'Menunggu editing naskah selesai'
            ],
            [
                'buku_id' => $books[1]->buku_id,
                'tugas_id' => $masterTasks['Layout'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'pending',
                'deadline' => now()->addDays(15),
                'catatan' => 'Menunggu draf PK selesai'
            ],

            // Book 3 - Editing (40% complete - beberapa task selesai)
            [
                'buku_id' => $books[2]->buku_id,
                'tugas_id' => $masterTasks['Cover Design'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(5),
                'tanggal_mulai' => now()->subDays(10),
                'tanggal_selesai' => now()->subDays(5),
                'catatan' => 'Cover design selesai'
            ],
            [
                'buku_id' => $books[2]->buku_id,
                'tugas_id' => $masterTasks['Pengantar & Endors'],
                'pic_tugas_user_id' => $manajer->user_id,
                'status' => 'in_progress',
                'deadline' => now()->addDays(3),
                'tanggal_mulai' => now()->subDays(2),
                'catatan' => 'Pengantar dan endors sedang dikerjakan'
            ],
            [
                'buku_id' => $books[2]->buku_id,
                'tugas_id' => $masterTasks['Editing Naskah'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'pending',
                'deadline' => now()->addDays(8),
                'catatan' => 'Menunggu pengantar dan endors selesai'
            ],

            // Book 4 - Draft (20% complete - hanya cover design selesai)
            [
                'buku_id' => $books[3]->buku_id,
                'tugas_id' => $masterTasks['Cover Design'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'completed',
                'deadline' => now()->subDays(2),
                'tanggal_mulai' => now()->subDays(7),
                'tanggal_selesai' => now()->subDays(2),
                'catatan' => 'Cover design selesai'
            ],
            [
                'buku_id' => $books[3]->buku_id,
                'tugas_id' => $masterTasks['Pengantar & Endors'],
                'pic_tugas_user_id' => $manajer->user_id,
                'status' => 'pending',
                'deadline' => now()->addDays(5),
                'catatan' => 'Belum dimulai'
            ],

            // Book 5 - Cancelled (0% complete - semua task pending)
            [
                'buku_id' => $books[4]->buku_id,
                'tugas_id' => $masterTasks['Cover Design'],
                'pic_tugas_user_id' => $produksi->user_id,
                'status' => 'pending',
                'deadline' => now()->addDays(10),
                'catatan' => 'Proyek dibatalkan'
            ],
        ];

        foreach ($taskProgress as $progress) {
            TaskProgress::firstOrCreate(
                [
                    'buku_id' => $progress['buku_id'],
                    'tugas_id' => $progress['tugas_id']
                ],
                $progress
            );
        }
    }
}
