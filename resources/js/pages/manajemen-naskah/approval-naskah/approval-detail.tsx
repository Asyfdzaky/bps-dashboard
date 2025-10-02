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
    publishers?: Array<{ penerbit_id: string; nama_penerbit: string }>; // Optional but we'll handle it
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Naskah',
        href: '/manajemen-naskah',
    },
    {
        title: 'Approval Naskah',
        href: '/approval',
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

    // Form untuk approve - hanya pilih 1 penerbit
    const approveForm = useForm({
        catatan_approval: '',
        target_date: '', // 1 target date
        selected_publisher: '', // Hanya 1 penerbit
    });

    // Form untuk reject
    const rejectForm = useForm({
        alasan_penolakan: '',
    });

    // Form untuk review (ubah status dari draft ke review)
    const reviewForm = useForm({});

    // Ambil publishers dari target_publishers naskah, bukan dari props publishers
    const availablePublishers =
        manuscript.target_publishers
            ?.map((target) => ({
                penerbit_id: target.publisher.penerbit_id,
                nama_penerbit: target.publisher.nama_penerbit,
                prioritas: target.prioritas,
            }))
            .sort((a, b) => a.prioritas - b.prioritas) || [];

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();

        if (availablePublishers.length === 0) {
            alert('Naskah ini tidak memiliki target penerbit. Silakan hubungi penulis untuk menambahkan target penerbit.');
            return;
        }

        if (!approveForm.data.selected_publisher) {
            alert('Silakan pilih penerbit terlebih dahulu.');
            return;
        }

        if (!approveForm.data.target_date) {
            alert('Silakan pilih target tanggal naik cetak.');
            return;
        }

        // ✅ Validasi tanggal tidak boleh di masa lalu
        const selectedDate = new Date(approveForm.data.target_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('Target tanggal tidak boleh di masa lalu.');
            return;
        }

        approveForm.post(`/approval/${manuscript.naskah_id}/approve`, {
            onSuccess: (response) => {
                console.log('Approval success:', response);
                setShowApproveModal(false);
                router.visit('approval');
            },
            onError: (errors) => {
                console.error('Approval errors:', errors);
                // ✅ Tampilkan error yang lebih informatif
                const errorMessage = Object.values(errors).flat().join(', ');
                alert(`Error: ${errorMessage}`);
            },
            onFinish: () => {
                console.log('Approval request finished');
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(`/approval/${manuscript.naskah_id}/reject`, {
            onSuccess: () => {
                setShowRejectModal(false);
                router.visit('approval');
            },
        });
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        reviewForm.post(`/approval/${manuscript.naskah_id}/review`, {
            onSuccess: () => {
                setShowReviewModal(false);
                router.visit('approval');
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
                <>
                    <Button variant="outline" onClick={() => setShowRejectModal(true)} className="flex-1 border-red-200 text-red-700 hover:bg-red-50 sm:flex-none">
                        <XCircle className="mr-1 h-4 w-4 sm:mr-2" />
                        Tolak
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowReviewModal(true)}
                        className="flex-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50 sm:flex-none"
                    >
                        <Eye className="mr-1 h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Mulai Review</span>
                        <span className="sm:hidden">Review</span>
                    </Button>
                    <Button onClick={() => setShowApproveModal(true)} className="flex-1 bg-green-600 hover:bg-green-700 sm:flex-none">
                        <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" />
                        Approve
                    </Button>
                </>
            );
        } else if (manuscript.status === 'review') {
            return (
                <>
                    <Button variant="outline" onClick={() => setShowRejectModal(true)} className="flex-1 border-red-200 text-red-700 hover:bg-red-50 sm:flex-none">
                        <XCircle className="mr-1 h-4 w-4 sm:mr-2" />
                        Tolak
                    </Button>
                    <Button onClick={() => setShowApproveModal(true)} className="flex-1 bg-green-600 hover:bg-green-700 sm:flex-none">
                        <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" />
                        Approve
                    </Button>
                </>
            );
        }
        return null; // Jika status canceled, tidak ada tombol aksi
    };

    // Function untuk handle date change
    const handleDateChange = (date: Date | undefined) => {
        const dateString = date ? date.toISOString().split('T')[0] : '';
        approveForm.setData('target_date', dateString);
    };

    const handlePublisherChange = (publisherId: string) => {
        approveForm.setData('selected_publisher', publisherId);
    };

    // Get selected publisher info for display - dengan null safety
    const selectedPublisher = availablePublishers.find((p) => p.penerbit_id === approveForm.data.selected_publisher);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review Naskah - ${manuscript.judul_naskah}`} />

            <div className="m-4 space-y-4 sm:m-6 sm:space-y-6 lg:m-8">
                {/* Header */}
                <div className="space-y-3 sm:space-y-4">
                    <Button variant="default" size="sm" onClick={() => router.visit('/approval')} className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke List
                    </Button>
                    
                    {/* Action Buttons - Stack on mobile */}
                    {manuscript.status !== 'cancelled' && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {renderActionButtons()}
                        </div>
                    )}
                </div>

                {/* Border full width dengan title di dalam */}
                <div className="border-t border-border pt-4 sm:pt-6">
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">{manuscript.judul_naskah}</h1>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        {getStatusBadge(manuscript.status)}
                        <span className="text-xs text-muted-foreground sm:text-sm">Dikirim pada {formatDate(manuscript.created_at)}</span>
                    </div>
                </div>

                {/* PDF Preview Toggle */}
                <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Button variant="outline" size="sm" onClick={() => setShowPdfPreview(!showPdfPreview)} className="w-full sm:w-auto">
                        <Eye className="mr-1 h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">{showPdfPreview ? 'Tutup Preview' : 'Preview PDF'}</span>
                        <span className="sm:hidden">Preview</span>
                    </Button>
                    <Button variant="outline" className="w-full text-primary hover:bg-accent sm:w-auto" size="sm" asChild>
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-1 h-4 w-4 sm:mr-2" />
                            Download
                        </a>
                    </Button>
                </div>

                {/* PDF Preview */}
                {showPdfPreview && (
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Preview Naskah</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="h-64 w-full sm:h-96">
                                <iframe src={pdfUrl} className="h-full w-full rounded-lg border" title="PDF Preview" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Informasi Penulis */}
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                Informasi Penulis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                                    <User className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{manuscript.author.nama_lengkap}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{manuscript.author.email}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Naskah */}
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                Informasi Naskah
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                            <div>
                                <Label className="text-xs font-medium sm:text-sm">Genre</Label>
                                <p className="text-xs text-gray-700 sm:text-sm">{manuscript.genre}</p>
                            </div>
                            <div>
                                <Label className="text-xs font-medium sm:text-sm">Status</Label>
                                <div className="mt-1">{getStatusBadge(manuscript.status)}</div>
                            </div>
                            <div>
                                <Label className="text-xs font-medium sm:text-sm">Tanggal Kirim</Label>
                                <p className="text-xs text-gray-700 sm:text-sm">{formatDate(manuscript.created_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sinopsis */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Sinopsis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">{manuscript.sinopsis}</p>
                        </CardContent>
                    </Card>

                    {/* Target Penerbit */}
                    {manuscript.target_publishers && manuscript.target_publishers.length > 0 && (
                        <Card className="lg:col-span-2">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Target Penerbit</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                                <div className="space-y-2 sm:space-y-3">
                                    {manuscript.target_publishers.map((target) => (
                                        <div key={target.prioritas} className="flex items-center justify-between rounded-lg border p-2.5 sm:p-3">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-sm font-medium sm:text-base">{target.publisher.nama_penerbit}</h4>
                                            </div>
                                            <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">P{target.prioritas}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Riwayat Status */}
                    {manuscript.info_tambahan && (
                        <Card className="lg:col-span-2">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Riwayat Approval</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                                <div className="space-y-3">
                                    {manuscript.info_tambahan.reviewed_at && (
                                        <div className="border-l-4 border-yellow-400 pl-3 sm:pl-4">
                                            <p className="text-sm font-medium sm:text-base">Direview</p>
                                            <p className="text-xs text-gray-600 sm:text-sm">{formatDate(manuscript.info_tambahan.reviewed_at)}</p>
                                        </div>
                                    )}
                                    {manuscript.info_tambahan.approved_at && (
                                        <div className="border-l-4 border-green-400 pl-3 sm:pl-4">
                                            <p className="text-sm font-medium sm:text-base">Disetujui</p>
                                            <p className="text-xs text-gray-600 sm:text-sm">{formatDate(manuscript.info_tambahan.approved_at)}</p>
                                            {manuscript.info_tambahan.catatan_approval && (
                                                <p className="mt-1 text-xs text-gray-700 sm:text-sm">Catatan: {manuscript.info_tambahan.catatan_approval}</p>
                                            )}
                                        </div>
                                    )}
                                    {manuscript.info_tambahan.rejected_at && (
                                        <div className="border-l-4 border-red-400 pl-3 sm:pl-4">
                                            <p className="text-sm font-medium sm:text-base">Ditolak</p>
                                            <p className="text-xs text-gray-600 sm:text-sm">{formatDate(manuscript.info_tambahan.rejected_at)}</p>
                                            {manuscript.info_tambahan.alasan_penolakan && (
                                                <p className="mt-1 text-xs text-gray-700 sm:text-sm">Alasan: {manuscript.info_tambahan.alasan_penolakan}</p>
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

                {/* Modal Approve - Clean Version */}
                <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                    <DialogContent className="max-h-[95vh] max-w-3xl overflow-hidden border-0">
                        <DialogHeader className="border-b border-border pb-4">
                            <DialogTitle className="text-xl font-semibold text-foreground">Approve Naskah: {manuscript.judul_naskah}</DialogTitle>
                            <p className="text-sm text-muted-foreground">Pilih penerbit dan tetapkan target tanggal untuk proses approval</p>
                        </DialogHeader>

                        <form onSubmit={handleApprove} className="flex h-full flex-col">
                            <div className="flex-1 space-y-6 overflow-y-auto py-4">
                                {/* Publisher Selection Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-medium text-foreground">Pilih Penerbit</h3>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                            {availablePublishers.length} Penerbit Tersedia
                                        </span>
                                    </div>

                                    {availablePublishers.length === 0 ? (
                                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                                            <div className="flex items-start gap-3">
                                                <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-destructive">Target Penerbit Tidak Ditemukan</h4>
                                                    <p className="text-sm text-destructive/80">
                                                        Naskah ini belum memiliki target penerbit. Hubungi penulis untuk menambahkan target penerbit
                                                        terlebih dahulu.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {availablePublishers.map((publisher) => (
                                                <button
                                                    key={publisher.penerbit_id}
                                                    type="button"
                                                    onClick={() => handlePublisherChange(publisher.penerbit_id)}
                                                    className={cn(
                                                        'group w-full rounded-lg border-2 p-4 text-left transition-all duration-150',
                                                        approveForm.data.selected_publisher === publisher.penerbit_id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5',
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {/* Radio Button */}
                                                            <div
                                                                className={cn(
                                                                    'relative h-4 w-4 rounded-full border-2 transition-colors',
                                                                    approveForm.data.selected_publisher === publisher.penerbit_id
                                                                        ? 'border-primary bg-primary'
                                                                        : 'border-muted-foreground group-hover:border-primary',
                                                                )}
                                                            >
                                                                {approveForm.data.selected_publisher === publisher.penerbit_id && (
                                                                    <div className="absolute inset-1 rounded-full bg-primary-foreground" />
                                                                )}
                                                            </div>

                                                            {/* Publisher Info */}
                                                            <div>
                                                                <h4 className="font-medium text-foreground">{publisher.nama_penerbit}</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Prioritas {publisher.prioritas}
                                                                    {publisher.prioritas === 1 && ' • Pilihan Utama'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Priority Badge */}
                                                        <div
                                                            className={cn(
                                                                'rounded-full px-2.5 py-1 text-xs font-medium',
                                                                publisher.prioritas === 1
                                                                    ? 'border border-secondary/30 bg-secondary/20 text-secondary-foreground'
                                                                    : 'bg-muted text-muted-foreground',
                                                            )}
                                                        >
                                                            P{publisher.prioritas}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Publisher Details */}
                                {selectedPublisher && (
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <CheckCircle className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">{selectedPublisher.nama_penerbit}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Prioritas {selectedPublisher.prioritas}
                                                    {selectedPublisher.prioritas === 1 && ' • Pilihan utama penulis'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Date Picker Section */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                                <CalendarIcon className="h-4 w-4" />
                                                Target Tanggal Naik Cetak
                                            </Label>
                                            <DatePicker
                                                date={approveForm.data.target_date ? new Date(approveForm.data.target_date) : undefined}
                                                onDateChange={handleDateChange}
                                                placeholder="Pilih target tanggal naik cetak"
                                            />
                                            <p className="text-xs text-muted-foreground">Tanggal estimasi buku akan mulai proses percetakan</p>
                                        </div>
                                    </div>
                                )}

                                {/* Notes Section */}
                                <div className="space-y-2">
                                    <Label htmlFor="catatan_approval" className="text-sm font-medium text-foreground">
                                        Catatan Approval (Opsional)
                                    </Label>
                                    <Textarea
                                        id="catatan_approval"
                                        value={approveForm.data.catatan_approval}
                                        onChange={(e) => approveForm.setData('catatan_approval', e.target.value)}
                                        placeholder="Tambahkan catatan untuk penulis dan tim produksi..."
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <DialogFooter className="flex-shrink-0 border-t border-border pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowApproveModal(false)}
                                    className="border-border text-muted-foreground hover:text-foreground"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        approveForm.processing ||
                                        !approveForm.data.selected_publisher ||
                                        !approveForm.data.target_date ||
                                        availablePublishers.length === 0
                                    }
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {approveForm.processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Approve ke {selectedPublisher?.nama_penerbit || 'Penerbit'}
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Reject - Clean Version */}
                <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                    <DialogContent className="max-w-lg border-0">
                        <DialogHeader className="border-b border-border pb-4">
                            <DialogTitle className="text-lg font-semibold text-foreground">Tolak Naskah</DialogTitle>
                            <p className="text-sm text-muted-foreground">Berikan alasan penolakan untuk naskah "{manuscript.judul_naskah}"</p>
                        </DialogHeader>

                        <form onSubmit={handleReject} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="alasan_penolakan" className="text-sm font-medium text-foreground">
                                    Alasan Penolakan
                                </Label>
                                <Textarea
                                    id="alasan_penolakan"
                                    value={rejectForm.data.alasan_penolakan}
                                    onChange={(e) => rejectForm.setData('alasan_penolakan', e.target.value)}
                                    placeholder="Jelaskan alasan mengapa naskah ditolak dengan detail..."
                                    rows={4}
                                    required
                                    className="resize-none"
                                />
                                {rejectForm.errors.alasan_penolakan && (
                                    <p className="text-sm text-destructive">{rejectForm.errors.alasan_penolakan}</p>
                                )}
                            </div>

                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                                <div className="flex items-start gap-2">
                                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                                    <p className="text-sm text-destructive">
                                        <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Naskah akan ditolak secara permanen dan
                                        penulis akan menerima notifikasi.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="border-t border-border pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowRejectModal(false)}
                                    className="border-border text-muted-foreground hover:text-foreground"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={rejectForm.processing}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {rejectForm.processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Tolak Naskah
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Review - Clean Version */}
                <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                    <DialogContent className="max-w-lg border-0">
                        <DialogHeader className="border-b border-border pb-4">
                            <DialogTitle className="text-lg font-semibold text-foreground">Mulai Review Naskah</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                                <h4 className="mb-2 text-sm font-medium text-foreground">Naskah yang akan direview:</h4>
                                <p className="text-sm font-medium text-primary">{manuscript.judul_naskah}</p>
                                <p className="text-sm text-muted-foreground">oleh {manuscript.author.nama_lengkap}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Status naskah akan berubah menjadi <span className="font-medium text-foreground">"Sedang Review"</span>
                                    dan Anda dapat melakukan evaluasi lebih lanjut.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Setelah review selesai, Anda dapat memilih untuk approve atau tolak naskah.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-border pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowReviewModal(false)}
                                className="border-border text-muted-foreground hover:text-foreground"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleReview}
                                disabled={reviewForm.processing}
                                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            >
                                {reviewForm.processing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-secondary-foreground border-t-transparent" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Mulai Review
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
