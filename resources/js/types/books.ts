export interface Book {
    buku_id: string;
    naskah_id: string;
    judul_buku: string;
    pic_user_id: string;
    penerbit_id: string;
    status_keseluruhan: 'draft' | 'review' | 'editing' | 'published' | 'cancelled';
    tanggal_target_naik_cetak: string;
    tanggal_realisasi_naik_cetak?: string;
    created_at: string;
    updated_at: string;

    // Relasi data
    manuscript?: {
        naskah_id: string;
        penulis_user_id: string;
        judul_naskah: string;
        sinopsis: string;
        genre: string;
        tanggal_masuk: string;
        status: string;
        file_naskah_url?: string;
        info_tambahan?: JSON;
        author?: {
            user_id: string;
            nama_lengkap: string;
            email: string;
        };
    };

    pic?: {
        user_id: string;
        nama_lengkap: string;
        email: string;
        foto_profil_url?: string;
    };

    publisher?: {
        penerbit_id: string;
        nama_penerbit: string;
        deskripsi_segmen: string;
    };

    taskProgress?: Array<{
        id: string;
        buku_id: string;
        master_task_id: string;
        progress_percentage: number;
        status: string;
        tanggal_mulai?: string;
        tanggal_selesai?: string;
        catatan?: string;
        masterTask?: {
            nama_task: string;
            deskripsi: string;
            urutan: number;
        };
    }>;
}