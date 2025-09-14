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
        title: 'Approval Naskah',
        href: '/approval-naskah',
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

        approveForm.post(`/manajemen-naskah/approval/${manuscript.naskah_id}/approve`, {
            onSuccess: (response) => {
                console.log('Approval success:', response);
                setShowApproveModal(false);
                router.visit('/approval-naskah');
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
        rejectForm.post(`/manajemen-naskah/approval/${manuscript.naskah_id}/reject`, {
            onSuccess: () => {
                setShowRejectModal(false);
                router.visit('/approval-naskah');
            },
        });
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        reviewForm.post(`/manajemen-naskah/approval/${manuscript.naskah_id}/review`, {
            onSuccess: () => {
                setShowReviewModal(false);
                router.visit('/approval-naskah');
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

            <div className="m-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <Button variant="default" size="sm" onClick={() => router.visit('/approval-naskah')} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke List
                        </Button>
                    </div>
                    {manuscript.status !== 'cancelled' && renderActionButtons()}
                </div>

                {/* Border full width dengan title di dalam */}
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
