export type Manuscript = {
    naskah_id: string;
    judul_naskah: string;
    sinopsis: string;
    genre: string;
    status: 'draft' | 'review' | 'approved' | 'canceled';
    file_naskah_url: string;
    info_tambahan: {
        kata_kunci?: string;
        tebal_naskah?: string;
        target_pembaca_primer?: string;
        target_pembaca_sekunder?: string;
        segmen_pembaca?: string;
        selling_point?: string;
        bonus_addon?: string;
        kelebihan_dibanding_tema_sejenis?: string;
        potensi_alih_media?: string;
        nama_penulis_1: string;
        nama_penulis_2?: string;
        nik_penulis: string;
        alamat?: string;
        no_hp: string;
        email: string;
        pendidikan?: string;
        kegiatan_aktif?: string;
        karya_tulis_media?: string;
        judul_buku_lain?: string;
        rencana_promosi: string;
        rencana_penjualan?: string;
        media_sosial?: string;
        jejaring?: string;
    };
    target_publishers?: Array<{
        prioritas: number;
        publisher: {
            penerbit_id: string;
            nama_penerbit: string;
        };
    }>;
    created_at: string;
    updated_at: string;
};
