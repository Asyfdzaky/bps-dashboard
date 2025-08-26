import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Book } from '@/types/books';
import { router } from '@inertiajs/react';
import { ArrowLeft, Building, Calendar, CheckCircle, ChevronDown, Circle, Clock, FileText, Plus, Save, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditBookPageProps {
    book: Book;
    users: Array<{ user_id: string; nama_lengkap: string; email: string }>;
    publishers: Array<{ penerbit_id: string; nama_penerbit: string }>;
    masterTasks: Array<{ tugas_id: string; nama_tugas: string; urutan: number }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Edit Buku',
        href: '#',
    },
];

export default function EditBookPage({ book, users, publishers, masterTasks }: EditBookPageProps) {
    const [editedBook, setEditedBook] = useState<Book>({ ...book });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setEditedBook({ ...book });
    }, [book]);

    const handleBookChange = (field: keyof Book, value: string | undefined) => {
        setEditedBook((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleTaskChange = (taskIndex: number, field: string, value: string | number | undefined) => {
        setEditedBook((prev) => ({
            ...prev,
            task_progress: prev.task_progress?.map((task, index) => (index === taskIndex ? { ...task, [field]: value } : task)) || [],
        }));
    };

    const addNewTask = (masterTask?: { tugas_id: string; nama_tugas: string; urutan: number }) => {
        if (!masterTask) {
            if (!masterTasks || masterTasks.length === 0) {
                alert('Tidak ada master task yang tersedia. Silakan tambahkan master task terlebih dahulu.');
                return;
            }
            // Jika tidak ada masterTask yang dipilih, gunakan yang pertama
            masterTask = masterTasks[0];
        }

        // Cek apakah task ini sudah ada
        const existingTask = editedBook.task_progress?.find((task) => task.tugas_id === masterTask!.tugas_id);
        if (existingTask) {
            alert(`Task "${masterTask.nama_tugas}" sudah ada dalam daftar tugas.`);
            return;
        }

        const newTask = {
            progres_id: `temp_${Date.now()}`,
            buku_id: book.buku_id,
            tugas_id: masterTask.tugas_id,
            pic_tugas_user_id: 'none',
            deadline: '',
            status: 'pending' as const,
            progress_percentage: 0,
            tanggal_mulai: '',
            tanggal_selesai: '',
            catatan: '',
            master_task: masterTask,
            pic: undefined,
        };

        setEditedBook((prev) => ({
            ...prev,
            task_progress: [...(prev.task_progress || []), newTask],
        }));
    };

    const removeTask = (taskIndex: number) => {
        setEditedBook((prev) => ({
            ...prev,
            task_progress: prev.task_progress?.filter((_, index) => index !== taskIndex) || [],
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Use Inertia router to update the book
            router.put(
                `/dashboard/book/${editedBook.buku_id}`,
                {
                    judul_buku: editedBook.judul_buku,
                    pic_user_id: editedBook.pic_user_id,
                    penerbit_id: editedBook.penerbit_id,
                    status_keseluruhan: editedBook.status_keseluruhan,
                    tanggal_target_naik_cetak: editedBook.tanggal_target_naik_cetak,
                    tanggal_realisasi_naik_cetak: editedBook.tanggal_realisasi_naik_cetak,
                    task_progress: editedBook.task_progress,
                },
                {
                    onSuccess: () => {
                        // Redirect back to dashboard
                        router.visit('/dashboard');
                    },
                    onError: (errors) => {
                        console.error('Error updating book:', errors);
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error saving book:', error);
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.visit('/dashboard');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-3 w-3 text-green-600" />;
            case 'in_progress':
                return <Clock className="h-3 w-3 text-blue-600" />;
            case 'pending':
                return <Circle className="h-3 w-3 text-gray-400" />;
            case 'overdue':
                return <Clock className="h-3 w-3 text-red-600" />;
            default:
                return <Circle className="h-3 w-3 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = 'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium';
        switch (status) {
            case 'completed':
                return `${baseClasses} bg-green-100 text-green-700`;
            case 'in_progress':
                return `${baseClasses} bg-blue-100 text-blue-700`;
            case 'pending':
                return `${baseClasses} bg-gray-100 text-gray-700`;
            case 'overdue':
                return `${baseClasses} bg-red-100 text-red-700`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-700`;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Selesai';
            case 'in_progress':
                return 'Sedang Berjalan';
            case 'pending':
                return 'Menunggu';
            case 'overdue':
                return 'Terlambat';
            default:
                return 'Menunggu';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-6 py-4">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={handleBack} className="p-2">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">Edit Buku</h1>
                                    <p className="text-sm text-gray-600">{book.judul_buku}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={handleBack}>
                                    Batal
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="space-y-8">
                        {/* Book Information Section */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="mb-6 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold">Informasi Buku</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Judul Buku</Label>
                                            <Input
                                                value={editedBook.judul_buku}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBookChange('judul_buku', e.target.value)}
                                                placeholder="Masukkan judul buku"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Status Keseluruhan</Label>
                                            <Select
                                                value={editedBook.status_keseluruhan}
                                                onValueChange={(value) => handleBookChange('status_keseluruhan', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="review">Review</SelectItem>
                                                    <SelectItem value="editing">Editing</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                <User className="h-4 w-4" />
                                                PIC
                                            </Label>
                                            <Select value={editedBook.pic_user_id} onValueChange={(value) => handleBookChange('pic_user_id', value)}>
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
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                <Building className="h-4 w-4" />
                                                Penerbit
                                            </Label>
                                            <Select value={editedBook.penerbit_id} onValueChange={(value) => handleBookChange('penerbit_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih penerbit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {publishers.map((publisher) => (
                                                        <SelectItem key={publisher.penerbit_id} value={publisher.penerbit_id}>
                                                            {publisher.nama_penerbit}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Calendar className="h-4 w-4" />
                                            Target Naik Cetak
                                        </Label>
                                        <Input
                                            type="date"
                                            value={editedBook.tanggal_target_naik_cetak}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleBookChange('tanggal_target_naik_cetak', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Realisasi Naik Cetak</Label>
                                        <Input
                                            type="date"
                                            value={editedBook.tanggal_realisasi_naik_cetak || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleBookChange('tanggal_realisasi_naik_cetak', e.target.value || undefined)
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tasks Section */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold">Progres Tugas</h2>
                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                            {editedBook.task_progress?.length || 0} tugas
                                        </span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Tambah Tugas
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {masterTasks && masterTasks.length > 0 ? (
                                                masterTasks.map((masterTask) => {
                                                    const isAlreadyAdded = editedBook.task_progress?.some(
                                                        (task) => task.tugas_id === masterTask.tugas_id,
                                                    );
                                                    return (
                                                        <DropdownMenuItem
                                                            key={masterTask.tugas_id}
                                                            onClick={() => addNewTask(masterTask)}
                                                            disabled={isAlreadyAdded}
                                                            className={isAlreadyAdded ? 'cursor-not-allowed text-gray-400' : ''}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-medium text-gray-500">{masterTask.urutan}.</span>
                                                                <span>{masterTask.nama_tugas}</span>
                                                                {isAlreadyAdded && <span className="text-xs text-gray-400">(Sudah ada)</span>}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    );
                                                })
                                            ) : (
                                                <DropdownMenuItem disabled>Tidak ada Master Task</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {editedBook.task_progress && editedBook.task_progress.length > 0 ? (
                                    <div className="space-y-4">
                                        {editedBook.task_progress
                                            .sort((a, b) => (a.master_task?.urutan || 0) - (b.master_task?.urutan || 0))
                                            .map((task, index) => (
                                                <div key={task.progres_id} className="relative">
                                                    {/* Timeline connector */}
                                                    {index < editedBook.task_progress!.length - 1 && (
                                                        <div className="absolute top-8 left-4 h-full w-0.5 bg-gray-200"></div>
                                                    )}

                                                    <div className="flex gap-4">
                                                        {/* Timeline node */}
                                                        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-card shadow-sm">
                                                            <div
                                                                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                                                    task.status === 'completed'
                                                                        ? 'bg-green-500'
                                                                        : task.status === 'in_progress'
                                                                          ? 'bg-blue-500'
                                                                          : task.status === 'pending'
                                                                            ? 'bg-gray-300'
                                                                            : 'bg-red-500'
                                                                }`}
                                                            >
                                                                {task.status === 'completed' && (
                                                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Task content */}
                                                        <div className="flex-1 pb-4">
                                                            <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
                                                                <div className="mb-4 flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <h3 className="mb-2 font-medium text-gray-900">
                                                                            {task.master_task?.nama_tugas || `Task ${task.tugas_id}`}
                                                                        </h3>
                                                                        <div className="flex items-center gap-2">
                                                                            {getStatusIcon(task.status)}
                                                                            <span className={getStatusBadge(task.status)}>
                                                                                {getStatusText(task.status)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeTask(index)}
                                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs text-gray-600">Status</Label>
                                                                        <Select
                                                                            value={task.status}
                                                                            onValueChange={(value) => handleTaskChange(index, 'status', value)}
                                                                        >
                                                                            <SelectTrigger className="h-8">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="pending">Menunggu</SelectItem>
                                                                                <SelectItem value="in_progress">Sedang Berjalan</SelectItem>
                                                                                <SelectItem value="completed">Selesai</SelectItem>
                                                                                <SelectItem value="overdue">Terlambat</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs text-gray-600">PIC</Label>
                                                                        <Select
                                                                            value={task.pic_tugas_user_id || 'none'}
                                                                            onValueChange={(value) =>
                                                                                handleTaskChange(
                                                                                    index,
                                                                                    'pic_tugas_user_id',
                                                                                    value === 'none' ? '' : value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="h-8">
                                                                                <SelectValue placeholder="Pilih PIC" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="none">Tidak ada PIC</SelectItem>
                                                                                {users.map((user) => (
                                                                                    <SelectItem key={user.user_id} value={user.user_id}>
                                                                                        {user.nama_lengkap}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs text-gray-600">Deadline</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={task.deadline || ''}
                                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                                handleTaskChange(index, 'deadline', e.target.value || undefined)
                                                                            }
                                                                            className="h-8"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs text-gray-500">Tanggal Mulai</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={task.tanggal_mulai || ''}
                                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                                handleTaskChange(index, 'tanggal_mulai', e.target.value || undefined)
                                                                            }
                                                                            className="h-8"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs text-gray-500">Tanggal Selesai</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={task.tanggal_selesai || ''}
                                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                                handleTaskChange(
                                                                                    index,
                                                                                    'tanggal_selesai',
                                                                                    e.target.value || undefined,
                                                                                )
                                                                            }
                                                                            className="h-8"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="mt-4 space-y-1">
                                                                    <Label className="text-xs text-gray-500">Catatan</Label>
                                                                    <Input
                                                                        value={task.catatan || ''}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                            handleTaskChange(index, 'catatan', e.target.value)
                                                                        }
                                                                        placeholder="Tambahkan catatan..."
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
                                        <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                        <h3 className="mb-2 text-lg font-medium text-gray-700">Belum ada tugas</h3>
                                        <p className="mb-4 text-gray-500">Tambahkan tugas pertama untuk memulai tracking progress</p>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    disabled={!masterTasks || masterTasks.length === 0}
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    {masterTasks && masterTasks.length > 0 ? 'Tambah Tugas Pertama' : 'Tidak ada Master Task'}
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {masterTasks && masterTasks.length > 0 ? (
                                                    masterTasks.map((masterTask) => {
                                                        const isAlreadyAdded = editedBook.task_progress?.some(
                                                            (task) => task.tugas_id === masterTask.tugas_id,
                                                        );
                                                        return (
                                                            <DropdownMenuItem
                                                                key={masterTask.tugas_id}
                                                                onClick={() => addNewTask(masterTask)}
                                                                disabled={isAlreadyAdded}
                                                                className={isAlreadyAdded ? 'cursor-not-allowed text-gray-400' : ''}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-medium text-gray-500">{masterTask.urutan}.</span>
                                                                    <span>{masterTask.nama_tugas}</span>
                                                                    {isAlreadyAdded && <span className="text-xs text-gray-400">(Sudah ada)</span>}
                                                                </div>
                                                            </DropdownMenuItem>
                                                        );
                                                    })
                                                ) : (
                                                    <DropdownMenuItem disabled>Tidak ada Master Task</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
