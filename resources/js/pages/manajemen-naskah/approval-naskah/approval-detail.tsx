import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Download, Eye, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    manuscript: any; // Use the same interface as before
    publishers?: Array<{ penerbit_id: string; nama_penerbit: string }>;
    users?: Array<{ user_id: string; nama_lengkap: string; email: string }>;
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

export default function ApprovalDetail({ manuscript, publishers = [], users = [] }: Props) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const approveForm = useForm({
        penerbit_id: '',
        pic_user_id: '',
        catatan_approval: '',
        target_naik_cetak: '',
    });

    const rejectForm = useForm({
        alasan_penolakan: '',
    });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approveForm.post(`/manajemen-naskah/approval/${manuscript.naskah_id}/approve`, {
            onSuccess: () => {
                setShowApproveModal(false);
                router.visit('/manajemen-naskah/approval');
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
                            <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">
                                {manuscript.status === 'review' ? 'Menunggu Review' : manuscript.status}
                            </Badge>
                            <span className="text-sm text-gray-500">Dikirim pada {formatDate(manuscript.created_at)}</span>
                        </div>
                    </div>

                    {manuscript.status === 'review' && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowRejectModal(true)}
                                className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Tolak
                            </Button>
                            <Button onClick={() => setShowApproveModal(true)} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        </div>
                    )}
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

                {/* Manuscript Details - Same as before */}
                {/* ... (Use the same cards from the previous show page) ... */}

                {/* Approve Modal */}
                <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Approve Naskah</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleApprove}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="penerbit_id">Penerbit</Label>
                                    <Select value={approveForm.data.penerbit_id} onValueChange={(value) => approveForm.setData('penerbit_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Penerbit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {publishers.map((publisher) => (
                                                <SelectItem key={publisher.penerbit_id} value={publisher.penerbit_id}>
                                                    {publisher.nama_penerbit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {approveForm.errors.penerbit_id && <p className="text-sm text-red-600">{approveForm.errors.penerbit_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="pic_user_id">PIC</Label>
                                    <Select value={approveForm.data.pic_user_id} onValueChange={(value) => approveForm.setData('pic_user_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih PIC" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.user_id} value={user.user_id}>
                                                    {user.nama_lengkap}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {approveForm.errors.pic_user_id && <p className="text-sm text-red-600">{approveForm.errors.pic_user_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="target_naik_cetak">Target Naik Cetak</Label>
                                    <Input
                                        id="target_naik_cetak"
                                        type="date"
                                        value={approveForm.data.target_naik_cetak}
                                        onChange={(e) => approveForm.setData('target_naik_cetak', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {approveForm.errors.target_naik_cetak && (
                                        <p className="text-sm text-red-600">{approveForm.errors.target_naik_cetak}</p>
                                    )}
                                </div>

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
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={() => setShowApproveModal(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={approveForm.processing}>
                                    {approveForm.processing ? 'Memproses...' : 'Approve'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reject Modal */}
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
