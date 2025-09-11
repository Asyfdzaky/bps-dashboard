import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Building, Calendar, Download, Eye, FileText, Mail, User } from 'lucide-react';
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

interface Props {
    manuscript: {
        naskah_id: string;
        judul_naskah: string;
        sinopsis: string;
        genre: string;
        status: 'draft' | 'review' | 'cancelled' | 'approved';
        created_at: string;
        updated_at: string;
        file_naskah_url: string;
        info_tambahan?: any;
        author: {
            user_id: string;
            nama_lengkap: string;
            email: string;
        };
        target_publishers: Array<{
            prioritas: number;
            publisher: {
                penerbit_id: string;
                nama_penerbit: string;
            };
        }>;
    };
    publishers?: Array<{ penerbit_id: string; nama_penerbit: string }>;
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'draft':
            return (
                <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                    Draft
                </Badge>
            );
        case 'review':
            return (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">
                    Sedang Review
                </Badge>
            );
        case 'approved':
            return (
                <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800">
                    Disetujui
                </Badge>
            );
        case 'canceled':
        case 'cancelled':
            return (
                <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800">
                    Ditolak
                </Badge>
            );
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

export default function KirimNaskahShow({ manuscript, publishers = [] }: Props) {
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const pdfUrl = `/storage/${manuscript.file_naskah_url}`;

    // Safe access to info_tambahan with fallback
    const info = manuscript.info_tambahan || {};

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
            <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                <dd className={`text-sm text-foreground ${multiline ? 'leading-relaxed whitespace-pre-wrap' : ''}`}>{value}</dd>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Naskah - ${manuscript.judul_naskah}`} />

            <div className="m-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <Button variant="default" size="sm" onClick={() => router.visit('/kirim-naskah')} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke List
                        </Button>
                    </div>
                </div>

                {/* Title Section */}
                <div className="border-t border-border pt-6">
                    <h1 className="text-2xl font-bold text-foreground">{manuscript.judul_naskah}</h1>
                    <div className="mt-2 flex items-center gap-4">
                        {getStatusBadge(manuscript.status)}
                        <span className="text-sm text-muted-foreground">Dikirim pada {formatDate(manuscript.created_at)}</span>
                    </div>
                </div>

                {/* PDF Preview Toggle */}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPdfPreview(!showPdfPreview)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {showPdfPreview ? 'Tutup Preview' : 'Preview PDF'}
                    </Button>
                    <Button variant="outline" className="text-primary hover:bg-accent" size="sm" asChild>
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </a>
                    </Button>
                </div>

                {/* PDF Preview */}
                {showPdfPreview && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Preview Naskah
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 w-full">
                                <iframe src={pdfUrl} className="h-full w-full rounded-lg border" title="PDF Preview" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Informasi Penulis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profil Penulis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{manuscript.author.nama_lengkap}</h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Mail className="h-3 w-3" />
                                        {manuscript.author.email}
                                    </div>
                                </div>
                            </div>

                            {/* Additional author info from info_tambahan */}
                            <div className="space-y-3 border-t pt-3">
                                <DataField
                                    label="Nama Penulis"
                                    value={`${info.nama_penulis_1 || ''}${info.nama_penulis_2 ? `, ${info.nama_penulis_2}` : ''}`}
                                />
                                <DataField label="No. HP" value={info.no_hp} />
                                <DataField label="Pendidikan" value={info.pendidikan} />
                                <DataField label="Alamat" value={info.alamat} multiline />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Naskah */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Informasi Naskah
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <DataField label="Genre/Kategori" value={manuscript.genre} />
                            <DataField label="Status" value={manuscript.status} />
                            <DataField label="Kata Kunci" value={info.kata_kunci} />
                            <DataField label="Tebal Naskah" value={info.tebal_naskah} />
                            <DataField label="Tanggal Kirim" value={formatDate(manuscript.created_at)} />
                            <DataField label="Terakhir Diperbarui" value={formatDate(manuscript.updated_at)} />
                        </CardContent>
                    </Card>

                    {/* Sinopsis & Selling Point */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Sinopsis & Selling Point</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DataField label="Sinopsis" value={manuscript.sinopsis} multiline />
                            <DataField label="Selling Point" value={info.selling_point} multiline />
                        </CardContent>
                    </Card>

                    {/* Target Pembaca & Segmen */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Pembaca & Segmen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <DataField label="Target Pembaca Primer" value={info.target_pembaca_primer} />
                            <DataField label="Target Pembaca Sekunder" value={info.target_pembaca_sekunder} />
                            <DataField label="Segmen Pembaca" value={info.segmen_pembaca} />
                        </CardContent>
                    </Card>

                    {/* Target Penerbit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Target Penerbit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {manuscript.target_publishers && manuscript.target_publishers.length > 0 ? (
                                <div className="space-y-3">
                                    {manuscript.target_publishers
                                        .sort((a, b) => a.prioritas - b.prioritas)
                                        .map((target) => (
                                            <div key={target.prioritas} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <h4 className="font-medium">{target.publisher.nama_penerbit}</h4>
                                                </div>
                                                <Badge variant="outline">Prioritas {target.prioritas}</Badge>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Tidak ada target penerbit</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rencana Promosi */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Rencana Promosi & Pemasaran</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <DataField label="Rencana Promosi" value={info.rencana_promosi} multiline />
                            <DataField label="Rencana Penjualan" value={info.rencana_penjualan} multiline />
                            <DataField label="Media Sosial" value={info.media_sosial} />
                            <DataField label="Jejaring" value={info.jejaring} />
                        </CardContent>
                    </Card>

                    {/* Riwayat Status */}
                    {info && Object.keys(info).some((key) => key.includes('_at') || key.includes('catatan') || key.includes('alasan')) && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Riwayat Approval
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {info.reviewed_at && (
                                        <div className="border-l-4 border-yellow-400 pl-4">
                                            <p className="font-medium">Direview</p>
                                            <p className="text-sm text-gray-600">{formatDate(info.reviewed_at)}</p>
                                        </div>
                                    )}
                                    {info.approved_at && (
                                        <div className="border-l-4 border-green-400 pl-4">
                                            <p className="font-medium">Disetujui</p>
                                            <p className="text-sm text-gray-600">{formatDate(info.approved_at)}</p>
                                            {info.catatan_approval && <p className="mt-1 text-sm text-gray-700">Catatan: {info.catatan_approval}</p>}
                                            {info.target_date && (
                                                <p className="mt-1 text-sm text-gray-700">Target Naik Cetak: {formatDate(info.target_date)}</p>
                                            )}
                                            {info.selected_publisher && (
                                                <p className="mt-1 text-sm text-gray-700">Penerbit Terpilih: {info.selected_publisher}</p>
                                            )}
                                        </div>
                                    )}
                                    {info.rejected_at && (
                                        <div className="border-l-4 border-red-400 pl-4">
                                            <p className="font-medium">Ditolak</p>
                                            <p className="text-sm text-gray-600">{formatDate(info.rejected_at)}</p>
                                            {info.alasan_penolakan && <p className="mt-1 text-sm text-gray-700">Alasan: {info.alasan_penolakan}</p>}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
