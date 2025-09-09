import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Manuscript } from '@/types/manuscript';
import { Head } from '@inertiajs/react';
import { BookOpen, Building, Calendar, Download, Eye, FileText, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kirim Naskah',
        href: '/kirim-naskah',
    },
    {
        title: 'Detail Naskah',
        href: '#',
    },
];

function getStatusBadge(status: string) {
    switch (status) {
        case 'draft':
            return (
                <Badge variant="outline" className="border-gray-300 bg-gray-50 font-medium text-gray-700">
                    Draft
                </Badge>
            );
        case 'review':
            return (
                <Badge variant="outline" className="border-blue-300 bg-blue-50 font-medium text-blue-700">
                    Review
                </Badge>
            );
        case 'approved':
            return (
                <Badge variant="outline" className="border-green-300 bg-green-50 font-medium text-green-700">
                    Disetujui
                </Badge>
            );
        case 'canceled':
            return (
                <Badge variant="outline" className="border-red-300 bg-red-50 font-medium text-red-700">
                    Dibatalkan
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                    Unknown
                </Badge>
            );
    }
}

export default function KirimNaskahShow({ manuscript }: { manuscript: Manuscript }) {
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const pdfUrl = `/storage/${manuscript.file_naskah_url}`;

    const handleDownloadPdf = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${manuscript.judul_naskah}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const DataField = ({ label, value, multiline = false }: { label: string; value?: string | null; multiline?: boolean }) => {
        if (!value) return null;

        return (
            <div className="border-b border-gray-100 py-3 last:border-b-0">
                <dt className="mb-1 text-sm font-semibold text-gray-600">{label}</dt>
                <dd className={`text-gray-900 ${multiline ? 'leading-relaxed whitespace-pre-wrap' : ''}`}>{value}</dd>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Naskah - ${manuscript.judul_naskah}`} />

            <div className="m-8 space-y-8">
                {/* Header */}
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="mb-3 text-3xl font-bold text-gray-900">{manuscript.judul_naskah}</h1>
                            <div className="flex items-center gap-4">
                                {getStatusBadge(manuscript.status)}
                                <span className="text-sm text-gray-500">Dikirim pada {formatDate(manuscript.created_at)}</span>
                            </div>
                        </div>
                        <div className="ml-6 flex gap-3">
                            <Button variant="outline" size="sm" onClick={() => setShowPdfPreview(!showPdfPreview)} className="border-gray-300">
                                <Eye className="mr-2 h-4 w-4" />
                                {showPdfPreview ? 'Tutup Preview' : 'Preview PDF'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="border-gray-300">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {showPdfPreview && (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                <FileText className="h-5 w-5" />
                                Preview Naskah
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="h-96 w-full">
                                <iframe src={pdfUrl} className="h-full w-full rounded-lg border border-gray-200" title="PDF Preview" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Informasi Naskah */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                <BookOpen className="h-5 w-5" />
                                Informasi Naskah
                            </h3>
                        </div>
                        <div className="p-6">
                            <dl className="space-y-0">
                                <DataField label="Genre/Kategori" value={manuscript.genre} />
                                <DataField label="Kata Kunci" value={manuscript.info_tambahan.kata_kunci} />
                                <DataField label="Tebal Naskah" value={manuscript.info_tambahan.tebal_naskah} />
                                <DataField label="Sinopsis" value={manuscript.sinopsis} multiline />
                                <DataField label="Selling Point" value={manuscript.info_tambahan.selling_point} multiline />
                            </dl>
                        </div>
                    </div>

                    {/* Target Pembaca & Segmen */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-800">Target Pembaca & Segmen</h3>
                        </div>
                        <div className="p-6">
                            <dl className="space-y-0">
                                <DataField label="Target Pembaca Primer" value={manuscript.info_tambahan.target_pembaca_primer} />
                                <DataField label="Target Pembaca Sekunder" value={manuscript.info_tambahan.target_pembaca_sekunder} />
                                <DataField label="Segmen Pembaca" value={manuscript.info_tambahan.segmen_pembaca} />
                            </dl>
                        </div>
                    </div>

                    {/* Profil Penulis */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                <User className="h-5 w-5" />
                                Profil Penulis
                            </h3>
                        </div>
                        <div className="p-6">
                            <dl className="space-y-0">
                                <DataField
                                    label="Nama Penulis"
                                    value={`${manuscript.info_tambahan.nama_penulis_1}${manuscript.info_tambahan.nama_penulis_2 ? `, ${manuscript.info_tambahan.nama_penulis_2}` : ''}`}
                                />
                                <DataField label="Email" value={manuscript.info_tambahan.email} />
                                <DataField label="No. HP" value={manuscript.info_tambahan.no_hp} />
                                <DataField label="Pendidikan" value={manuscript.info_tambahan.pendidikan} />
                                <DataField label="Alamat" value={manuscript.info_tambahan.alamat} multiline />
                            </dl>
                        </div>
                    </div>

                    {/* Target Penerbit */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                <Building className="h-5 w-5" />
                                Target Penerbit
                            </h3>
                        </div>
                        <div className="p-6">
                            {manuscript.target_publishers && manuscript.target_publishers.length > 0 ? (
                                <div className="space-y-3">
                                    {manuscript.target_publishers
                                        .sort((a, b) => a.prioritas - b.prioritas)
                                        .map((target) => (
                                            <div
                                                key={target.prioritas}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                                            >
                                                <span className="font-medium text-gray-900">{target.publisher.nama_penerbit}</span>
                                                <Badge variant="outline" className="border-gray-300 bg-white text-gray-700">
                                                    Prioritas {target.prioritas}
                                                </Badge>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Tidak ada target penerbit</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rencana Promosi */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-800">Rencana Promosi & Pemasaran</h3>
                    </div>
                    <div className="p-6">
                        <dl className="space-y-0">
                            <DataField label="Rencana Promosi" value={manuscript.info_tambahan.rencana_promosi} multiline />
                            <DataField label="Rencana Penjualan" value={manuscript.info_tambahan.rencana_penjualan} multiline />
                            <DataField label="Media Sosial" value={manuscript.info_tambahan.media_sosial} />
                            <DataField label="Jejaring" value={manuscript.info_tambahan.jejaring} />
                        </dl>
                    </div>
                </div>

                {/* Riwayat */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <Calendar className="h-5 w-5" />
                            Riwayat
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <dt className="mb-1 text-sm font-semibold text-gray-600">Tanggal Dibuat</dt>
                                <dd className="text-gray-900">{formatDate(manuscript.created_at)}</dd>
                            </div>
                            <div>
                                <dt className="mb-1 text-sm font-semibold text-gray-600">Terakhir Diperbarui</dt>
                                <dd className="text-gray-900">{formatDate(manuscript.updated_at)}</dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
