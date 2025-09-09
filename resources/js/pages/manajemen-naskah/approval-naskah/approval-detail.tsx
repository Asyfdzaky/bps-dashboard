import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calender';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle, Download, Eye, FileText, Mail, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    manuscript: {
        naskah_id: string;
        judul_naskah: string;
        sinopsis: string;
        genre: string;
        status: 'draft' | 'review' | 'cancelled' | 'approved';
        created_at: string;
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Naskah',
        href: '/manajemen-naskah',
    },
    {
        title: 'Approval Naskah',
        href: '/manajemen-naskah/approval',
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
        case 'canceled':
            return (
                <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800">
                    Ditolak
                </Badge>
            );
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

// DatePicker Component untuk calendar
function DatePicker({
    date,
    onDateChange,
    placeholder = 'Pilih tanggal',
    disabled = false,
}: {
    date?: Date;
    onDateChange: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP', { locale: id }) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={onDateChange} disabled={(date) => date < new Date()} initialFocus />
            </PopoverContent>
        </Popover>
    );
}

export default function ApprovalDetail({ manuscript, publishers = [] }: Props) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    // Form untuk approve (simplified - tanpa PIC dan target date)
    const approveForm = useForm({
        catatan_approval: '',
        target_dates: {} as Record<string, string>,
    });

    // Form untuk reject
    const rejectForm = useForm({
        alasan_penolakan: '',
    });

    // Form untuk review (ubah status dari draft ke review)
    const reviewForm = useForm({});

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approveForm.post(`/manajemen-naskah/approval/${manuscript.naskah_id}/approve`, {
            onSuccess: (response) => {
                console.log('Approval success:', response); // Debug
                setShowApproveModal(false);
                router.visit('/manajemen-naskah/approval');
            },
            onError: (errors) => {
                console.error('Approval errors:', errors); // Debug
                // Tampilkan error di UI jika perlu
            },
            onFinish: () => {
                console.log('Approval request finished'); // Debug
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(`/manajemen-naskah/approval/${manuscript.naskah_id}/reject`, {
            onSuccess: () => {
                setShowRejectModal(false);
                router.visit('/manajemen-naskah/approval');
            },
        });
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        reviewForm.post(`/manajemen-naskah/approval/${manuscript.naskah_id}/review`, {
            onSuccess: () => {
                setShowReviewModal(false);
                router.visit('/manajemen-naskah/approval');
            },
        });
    };

    const pdfUrl = `/storage/${manuscript.file_naskah_url}`;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Tentukan tombol aksi berdasarkan status
    const renderActionButtons = () => {
        if (manuscript.status === 'draft') {
            return (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowRejectModal(true)} className="border-red-200 text-red-700 hover:bg-red-50">
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowReviewModal(true)}
                        className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Mulai Review
                    </Button>
                    <Button onClick={() => setShowApproveModal(true)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                    </Button>
                </div>
            );
        } else if (manuscript.status === 'review') {
            return (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowRejectModal(true)} className="border-red-200 text-red-700 hover:bg-red-50">
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak
                    </Button>
                    <Button onClick={() => setShowApproveModal(true)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                    </Button>
                </div>
            );
        }
        return null; // Jika status canceled, tidak ada tombol aksi
    };

    // Function untuk handle date change
    const handleDateChange = (publisherId: string, date: Date | undefined) => {
        const dateString = date ? date.toISOString().split('T')[0] : '';
        approveForm.setData('target_dates', {
            ...approveForm.data.target_dates,
            [publisherId]: dateString,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review Naskah - ${manuscript.judul_naskah}`} />

            <div className="m-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <Button variant="ghost" size="sm" onClick={() => router.visit('/manajemen-naskah/approval')} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke List
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">{manuscript.judul_naskah}</h1>
                        <div className="mt-2 flex items-center gap-4">
                            {getStatusBadge(manuscript.status)}
                            <span className="text-sm text-gray-500">Dikirim pada {formatDate(manuscript.created_at)}</span>
                        </div>
                    </div>

                    {manuscript.status !== 'cancelled' && renderActionButtons()}
                </div>

                {/* PDF Preview Toggle */}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPdfPreview(!showPdfPreview)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {showPdfPreview ? 'Tutup Preview' : 'Preview PDF'}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
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
                            <CardTitle>Preview Naskah</CardTitle>
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
                                Informasi Penulis
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
                        </CardContent>
                    </Card>

                    {/* Informasi Naskah */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informasi Naskah
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium">Genre</Label>
                                <p className="text-sm text-gray-700">{manuscript.genre}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <div className="mt-1">{getStatusBadge(manuscript.status)}</div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Tanggal Kirim</Label>
                                <p className="text-sm text-gray-700">{formatDate(manuscript.created_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sinopsis */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Sinopsis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-gray-700">{manuscript.sinopsis}</p>
                        </CardContent>
                    </Card>

                    {/* Target Penerbit */}
                    {manuscript.target_publishers && manuscript.target_publishers.length > 0 && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Target Penerbit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {manuscript.target_publishers.map((target) => (
                                        <div key={target.prioritas} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <h4 className="font-medium">{target.publisher.nama_penerbit}</h4>
                                            </div>
                                            <Badge variant="outline">Prioritas {target.prioritas}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Riwayat Status */}
                    {manuscript.info_tambahan && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Riwayat Approval</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {manuscript.info_tambahan.reviewed_at && (
                                        <div className="border-l-4 border-yellow-400 pl-4">
                                            <p className="font-medium">Direview</p>
                                            <p className="text-sm text-gray-600">{formatDate(manuscript.info_tambahan.reviewed_at)}</p>
                                        </div>
                                    )}
                                    {manuscript.info_tambahan.approved_at && (
                                        <div className="border-l-4 border-green-400 pl-4">
                                            <p className="font-medium">Disetujui</p>
                                            <p className="text-sm text-gray-600">{formatDate(manuscript.info_tambahan.approved_at)}</p>
                                            {manuscript.info_tambahan.catatan_approval && (
                                                <p className="mt-1 text-sm text-gray-700">Catatan: {manuscript.info_tambahan.catatan_approval}</p>
                                            )}
                                        </div>
                                    )}
                                    {manuscript.info_tambahan.rejected_at && (
                                        <div className="border-l-4 border-red-400 pl-4">
                                            <p className="font-medium">Ditolak</p>
                                            <p className="text-sm text-gray-600">{formatDate(manuscript.info_tambahan.rejected_at)}</p>
                                            {manuscript.info_tambahan.alasan_penolakan && (
                                                <p className="mt-1 text-sm text-gray-700">Alasan: {manuscript.info_tambahan.alasan_penolakan}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Modal Review (Draft -> Review) */}
                <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Mulai Review Naskah</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-sm text-gray-600">Apakah Anda yakin ingin memulai review untuk naskah "{manuscript.judul_naskah}"?</p>
                            <p className="mt-2 text-sm text-gray-600">Status naskah akan berubah menjadi "Sedang Review".</p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleReview} disabled={reviewForm.processing}>
                                {reviewForm.processing ? 'Memproses...' : 'Mulai Review'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Approve dengan Calendar */}
                <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Approve Naskah</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleApprove}>
                            <div className="space-y-6">
                                {/* Target Penerbit dengan Date Picker */}
                                {manuscript.target_publishers && manuscript.target_publishers.length > 0 ? (
                                    <div>
                                        <Label className="text-base font-semibold">Penerbit dan Target Naik Cetak</Label>
                                        <p className="mb-4 text-sm text-gray-500">
                                            Tentukan target tanggal naik cetak untuk setiap penerbit yang akan menerima naskah
                                        </p>
                                        <div className="space-y-4">
                                            {manuscript.target_publishers
                                                .sort((a, b) => a.prioritas - b.prioritas)
                                                .map((target, index) => (
                                                    <div
                                                        key={target.publisher.penerbit_id}
                                                        className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900">{target.publisher.nama_penerbit}</h4>
                                                                    {index === 0 && <p className="text-sm text-green-700">Prioritas utama penulis</p>}
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline" className="border-green-300 text-green-700">
                                                                Prioritas {target.prioritas}
                                                            </Badge>
                                                        </div>

                                                        {/* PERBAIKI Date Picker untuk setiap publisher */}
                                                        <div>
                                                            <Label className="flex items-center gap-1 text-sm font-medium">
                                                                <CalendarIcon className="h-4 w-4" />
                                                                Target Naik Cetak
                                                            </Label>
                                                            <div className="mt-2">
                                                                <DatePicker
                                                                    date={
                                                                        approveForm.data.target_dates[target.publisher.penerbit_id]
                                                                            ? new Date(approveForm.data.target_dates[target.publisher.penerbit_id])
                                                                            : undefined
                                                                    }
                                                                    onDateChange={(date) => handleDateChange(target.publisher.penerbit_id, date)}
                                                                    placeholder="Pilih target tanggal naik cetak"
                                                                />
                                                            </div>
                                                            <p className="mt-1 text-xs text-gray-600">
                                                                Tanggal target ketika buku akan naik ke percetakan
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        <div className="mt-4 rounded-lg bg-blue-50 p-3">
                                            <p className="text-sm text-blue-800">
                                                <strong>Total:</strong> Naskah akan masuk ke {manuscript.target_publishers.length} penerbit dengan
                                                target tanggal masing-masing.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                        <p className="text-sm text-red-700">
                                            Tidak ada target penerbit untuk naskah ini. Tidak dapat melanjutkan approval.
                                        </p>
                                    </div>
                                )}

                                {/* Catatan Approval */}
                                <div>
                                    <Label htmlFor="catatan_approval">Catatan Approval (Opsional)</Label>
                                    <Textarea
                                        id="catatan_approval"
                                        value={approveForm.data.catatan_approval}
                                        onChange={(e) => approveForm.setData('catatan_approval', e.target.value)}
                                        placeholder="Tambahkan catatan untuk penulis..."
                                        rows={3}
                                    />
                                </div>

                                <div className="rounded-lg bg-green-50 p-3">
                                    <p className="text-sm text-green-800">
                                        <strong>Perhatian:</strong> Naskah yang diapprove akan langsung masuk ke sistem manajemen buku dengan target
                                        tanggal yang telah ditentukan.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={() => setShowApproveModal(false)}>
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={approveForm.processing || !manuscript.target_publishers || manuscript.target_publishers.length === 0}
                                >
                                    {approveForm.processing ? 'Memproses...' : `Approve ke ${manuscript.target_publishers?.length || 0} Penerbit`}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Reject */}
                <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tolak Naskah</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleReject}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="alasan_penolakan">Alasan Penolakan</Label>
                                    <Textarea
                                        id="alasan_penolakan"
                                        value={rejectForm.data.alasan_penolakan}
                                        onChange={(e) => rejectForm.setData('alasan_penolakan', e.target.value)}
                                        placeholder="Jelaskan alasan mengapa naskah ditolak..."
                                        rows={4}
                                        required
                                    />
                                    {rejectForm.errors.alasan_penolakan && (
                                        <p className="text-sm text-red-600">{rejectForm.errors.alasan_penolakan}</p>
                                    )}
                                </div>

                                <div className="rounded-lg bg-red-50 p-3">
                                    <p className="text-sm text-red-800">
                                        <strong>Perhatian:</strong> Tindakan ini tidak dapat dibatalkan. Naskah akan ditolak secara permanen.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={() => setShowRejectModal(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                    {rejectForm.processing ? 'Memproses...' : 'Tolak Naskah'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
