import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PenerbitPage() {
    const { publishers, flash } = usePage<{ publishers: any[]; flash?: { success?: string } }>().props;
    const [search, setSearch] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPublisher, setEditingPublisher] = useState<any>(null);
    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success',
    });

    // Form states
    const [formData, setFormData] = useState({
        nama_penerbit: '',
        deskripsi_segmen: '',
    });
    const [formErrors, setFormErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filtered = publishers.filter((p) => p.nama_penerbit.toLowerCase().includes(search.toLowerCase()));

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Penerbit',
            href: '/penerbit',
        },
    ];

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification((prev) => ({ ...prev, show: false }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    // Show notification from flash messages
    useEffect(() => {
        if (flash?.success) {
            showNotification(flash.success, 'success');
        }
    }, [flash]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({
            show: true,
            message,
            type,
        });
    };

    const hideNotification = () => {
        setNotification((prev) => ({ ...prev, show: false }));
    };

    const resetForm = () => {
        setFormData({
            nama_penerbit: '',
            deskripsi_segmen: '',
        });
        setFormErrors({});
        setEditingPublisher(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setIsCreateDialogOpen(true);
    };

    const openEditDialog = (publisher: any) => {
        setFormData({
            nama_penerbit: publisher.nama_penerbit || '',
            deskripsi_segmen: publisher.deskripsi_segmen || '',
        });
        setEditingPublisher(publisher);
        setFormErrors({});
        setIsEditDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent, isEdit: boolean) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        try {
            if (isEdit && editingPublisher) {
                await router.put(`/penerbit/${editingPublisher.penerbit_id}`, formData, {
                    onSuccess: () => {
                        setIsEditDialogOpen(false);
                        resetForm();
                        showNotification(`Penerbit "${formData.nama_penerbit}" berhasil diperbarui!`, 'success');
                    },
                    onError: (errors) => {
                        setFormErrors(errors);
                        showNotification('Terjadi kesalahan saat memperbarui penerbit.', 'error');
                    },
                });
            } else {
                await router.post('/penerbit', formData, {
                    onSuccess: () => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                        showNotification(`Penerbit "${formData.nama_penerbit}" berhasil ditambahkan!`, 'success');
                    },
                    onError: (errors) => {
                        setFormErrors(errors);
                        showNotification('Terjadi kesalahan saat menambahkan penerbit.', 'error');
                    },
                });
            }
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('Terjadi kesalahan yang tidak terduga.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (publisher: any) => {
        router.delete(`/penerbit/${publisher.penerbit_id}`, {
            onSuccess: () => {
                showNotification(`Penerbit "${publisher.nama_penerbit}" berhasil dihapus!`, 'success');
            },
            onError: () => {
                showNotification('Terjadi kesalahan saat menghapus penerbit.', 'error');
            },
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error for this field when user starts typing
        if (formErrors[field]) {
            setFormErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Penerbit" />

            {/* Notification Toast */}
            {notification.show && (
                <div className="animate-in slide-in-from-top-5 fade-in-0 fixed right-4 top-4 z-50">
                    <Alert
                        className={`min-w-80 border-l-4 shadow-lg ${
                            notification.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800'
                        }`}
                    >
                        <CheckCircle className={`h-4 w-4 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
                        <AlertTitle className="flex items-center justify-between">
                            {notification.type === 'success' ? 'Berhasil!' : 'Error!'}
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-transparent" onClick={hideNotification}>
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertTitle>
                        <AlertDescription className="mt-1">{notification.message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="w-full">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen Penerbit</h1>

                    {/* Create Dialog */}
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Penerbit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Tambah Penerbit Baru</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create-nama-penerbit">
                                        Nama Penerbit <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="create-nama-penerbit"
                                        value={formData.nama_penerbit}
                                        onChange={(e) => handleInputChange('nama_penerbit', e.target.value)}
                                        required
                                        placeholder="Masukkan nama penerbit"
                                    />
                                    {formErrors.nama_penerbit && <p className="text-sm text-red-500">{formErrors.nama_penerbit}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="create-deskripsi-segmen">Deskripsi Segmen</Label>
                                    <Input
                                        id="create-deskripsi-segmen"
                                        value={formData.deskripsi_segmen}
                                        onChange={(e) => handleInputChange('deskripsi_segmen', e.target.value)}
                                        placeholder="Masukkan deskripsi segmen (opsional)"
                                    />
                                    {formErrors.deskripsi_segmen && <p className="text-sm text-red-500">{formErrors.deskripsi_segmen}</p>}
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Memproses...' : 'Tambah Penerbit'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <Input
                            placeholder="Cari penerbit berdasarkan nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mb-4"
                        />

                        {/* TABLE CONTAINER */}
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/70">
                                    <tr>
                                        <th className="text-foreground/80 p-3 text-left font-semibold">Nama Penerbit</th>
                                        <th className="text-foreground/80 hidden p-3 text-left font-semibold sm:table-cell">Deskripsi Segmen</th>
                                        <th className="text-foreground/80 w-[120px] p-3 text-center font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? (
                                        filtered.map((p) => (
                                            <tr key={p.penerbit_id} className="hover:bg-muted/50 border-b transition-colors">
                                                <td className="text-foreground p-3 font-medium">{p.nama_penerbit}</td>
                                                <td className="text-muted-foreground hidden p-3 sm:table-cell">{p.deskripsi_segmen || '-'}</td>
                                                <td className="space-x-2 p-3 text-center">
                                                    {/* Edit Dialog */}
                                                    <Dialog
                                                        open={isEditDialogOpen && editingPublisher?.penerbit_id === p.penerbit_id}
                                                        onOpenChange={(open) => {
                                                            setIsEditDialogOpen(open);
                                                            if (!open) resetForm();
                                                        }}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-primary hover:bg-primary/10 h-8 w-8"
                                                                onClick={() => openEditDialog(p)}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Data Penerbit</DialogTitle>
                                                            </DialogHeader>
                                                            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="edit-nama-penerbit">
                                                                        Nama Penerbit <span className="text-red-500">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        id="edit-nama-penerbit"
                                                                        value={formData.nama_penerbit}
                                                                        onChange={(e) => handleInputChange('nama_penerbit', e.target.value)}
                                                                        required
                                                                        placeholder="Masukkan nama penerbit"
                                                                    />
                                                                    {formErrors.nama_penerbit && (
                                                                        <p className="text-sm text-red-500">{formErrors.nama_penerbit}</p>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="edit-deskripsi-segmen">Deskripsi Segmen</Label>
                                                                    <Input
                                                                        id="edit-deskripsi-segmen"
                                                                        value={formData.deskripsi_segmen}
                                                                        onChange={(e) => handleInputChange('deskripsi_segmen', e.target.value)}
                                                                        placeholder="Masukkan deskripsi segmen (opsional)"
                                                                    />
                                                                    {formErrors.deskripsi_segmen && (
                                                                        <p className="text-sm text-red-500">{formErrors.deskripsi_segmen}</p>
                                                                    )}
                                                                </div>

                                                                <DialogFooter>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => setIsEditDialogOpen(false)}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        Batal
                                                                    </Button>
                                                                    <Button type="submit" disabled={isSubmitting}>
                                                                        {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>

                                                    {/* Delete Alert Dialog */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="destructive" className="h-8 w-8">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Apakah Anda yakin ingin menghapus penerbit <strong>"{p.nama_penerbit}"</strong>?
                                                                    Tindakan ini tidak dapat dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => handleDelete(p)}
                                                                >
                                                                    Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-muted-foreground p-6 text-center">
                                                {search ? 'Tidak ada penerbit yang cocok dengan pencarian Anda.' : 'Belum ada data penerbit.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
