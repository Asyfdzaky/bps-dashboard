import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Book } from '@/types/books';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Calendar, Save, User, Users } from 'lucide-react';
import { useState } from 'react';

type User = {
    user_id: string;
    nama_lengkap: string;
    email: string;
};

type MasterTask = {
    tugas_id: string;
    nama_tugas: string;
    urutan: number;
};

interface AssignTaskPageProps {
    book?: Book | null;
    books: Book[];
    users: User[];
    masterTasks: MasterTask[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Naskah',
        href: '/manajemen-naskah',
    },
    {
        title: 'Assignment Tugas',
        href: '/task-assignment',
    },
    {
        title: 'Assign Tugas Baru',
        href: '#',
    },
];

export default function AssignTaskPage({ book, books, users, masterTasks }: AssignTaskPageProps) {
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        buku_id: book?.buku_id || '',
        tugas_id: '',
        pic_tugas_user_id: '',
        deadline: '',
        status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'overdue',
        tanggal_mulai: '',
        tanggal_selesai: '',
        catatan: '',
    });

    const { data: bulkData, setData: setBulkData, post: postBulk, processing: bulkProcessing } = useForm({
        buku_id: book?.buku_id || '',
        master_task_ids: [] as string[],
        pic_tugas_user_id: '',
        deadline: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/task-assignment', {
            onSuccess: () => {
                router.visit('/task-assignment');
            },
        });
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setBulkData('master_task_ids', selectedTasks);
        postBulk('/task-assignment/bulk-assign', {
            onSuccess: () => {
                router.visit('/task-assignment');
            },
        });
    };

    const handleBack = () => {
        router.visit('/task-assignment');
    };

    const handleTaskSelection = (taskId: string, checked: boolean) => {
        if (checked) {
            setSelectedTasks([...selectedTasks, taskId]);
        } else {
            setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
        }
    };

    const toggleSelectAll = () => {
        if (selectedTasks.length === masterTasks.length) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(masterTasks.map((task) => task.tugas_id));
        }
    };

    // Get existing tasks for the selected book to show which ones are already assigned
    const selectedBook = books.find((b) => b.buku_id === (isBulkMode ? bulkData.buku_id : data.buku_id));
    const existingTaskIds = selectedBook?.task_progress?.map((tp) => tp.tugas_id) || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Tugas Baru" />

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
                                    <h1 className="text-xl font-semibold text-gray-900">Assign Tugas Baru</h1>
                                    <p className="text-sm text-gray-600">Assign tugas ke buku dan PIC</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={handleBack}>
                                    Batal
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto max-w-4xl px-6 py-8">
                    <div className="space-y-6">
                        {/* Mode Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mode Assignment</CardTitle>
                                <CardDescription>Pilih mode assignment tugas yang ingin digunakan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="mode"
                                            checked={!isBulkMode}
                                            onChange={() => setIsBulkMode(false)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="text-sm font-medium">Single Assignment</span>
                                        <span className="text-xs text-gray-500">(Assign satu tugas)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="mode"
                                            checked={isBulkMode}
                                            onChange={() => setIsBulkMode(true)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="text-sm font-medium">Bulk Assignment</span>
                                        <span className="text-xs text-gray-500">(Assign multiple tugas sekaligus)</span>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {!isBulkMode ? (
                            /* Single Assignment Form */
                            <form onSubmit={handleSubmit}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                            Single Task Assignment
                                        </CardTitle>
                                        <CardDescription>Assign satu tugas ke buku dengan detail lengkap</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Book Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="buku_id">Pilih Buku *</Label>
                                            <Select value={data.buku_id} onValueChange={(value) => setData('buku_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih buku untuk di-assign tugas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {books.map((book) => (
                                                        <SelectItem key={book.buku_id} value={book.buku_id}>
                                                            <div>
                                                                <div className="font-medium">{book.judul_buku}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {book.manuscript?.author?.nama_lengkap} - {book.publisher?.nama_penerbit}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.buku_id && <p className="text-sm text-red-600">{errors.buku_id}</p>}
                                        </div>

                                        {/* Task Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="tugas_id">Pilih Tugas *</Label>
                                            <Select value={data.tugas_id} onValueChange={(value) => setData('tugas_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih tugas yang akan di-assign" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {masterTasks.map((task) => {
                                                        const isAssigned = existingTaskIds.includes(task.tugas_id);
                                                        return (
                                                            <SelectItem key={task.tugas_id} value={task.tugas_id} disabled={isAssigned}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                                        {task.urutan}
                                                                    </span>
                                                                    <span>{task.nama_tugas}</span>
                                                                    {isAssigned && <span className="text-xs text-red-500">(Sudah di-assign)</span>}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {errors.tugas_id && <p className="text-sm text-red-600">{errors.tugas_id}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* PIC Selection */}
                                            <div className="space-y-2">
                                                <Label htmlFor="pic_tugas_user_id" className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    PIC
                                                </Label>
                                                <Select
                                                    value={data.pic_tugas_user_id}
                                                    onValueChange={(value) => setData('pic_tugas_user_id', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih PIC" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">Tidak ada PIC</SelectItem>
                                                        {users.map((user) => (
                                                            <SelectItem key={user.user_id} value={user.user_id}>
                                                                <div>
                                                                    <div className="font-medium">{user.nama_lengkap}</div>
                                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Status */}
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Status *</Label>
                                                <Select value={data.status} onValueChange={(value: any) => setData('status', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Menunggu</SelectItem>
                                                        <SelectItem value="in_progress">Sedang Berjalan</SelectItem>
                                                        <SelectItem value="completed">Selesai</SelectItem>
                                                        <SelectItem value="overdue">Terlambat</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            {/* Deadline */}
                                            <div className="space-y-2">
                                                <Label htmlFor="deadline" className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Deadline
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={data.deadline}
                                                    onChange={(e) => setData('deadline', e.target.value)}
                                                />
                                            </div>

                                            {/* Start Date */}
                                            <div className="space-y-2">
                                                <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                                                <Input
                                                    type="date"
                                                    value={data.tanggal_mulai}
                                                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                                />
                                            </div>

                                            {/* End Date */}
                                            <div className="space-y-2">
                                                <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                                                <Input
                                                    type="date"
                                                    value={data.tanggal_selesai}
                                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div className="space-y-2">
                                            <Label htmlFor="catatan">Catatan</Label>
                                            <Textarea
                                                value={data.catatan}
                                                onChange={(e) => setData('catatan', e.target.value)}
                                                placeholder="Tambahkan catatan untuk tugas ini..."
                                                rows={3}
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                                <Save className="mr-2 h-4 w-4" />
                                                {processing ? 'Menyimpan...' : 'Assign Tugas'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        ) : (
                            /* Bulk Assignment Form */
                            <form onSubmit={handleBulkSubmit}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            Bulk Task Assignment
                                        </CardTitle>
                                        <CardDescription>Assign multiple tugas sekaligus ke satu buku</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Book Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="buku_id">Pilih Buku *</Label>
                                            <Select value={bulkData.buku_id} onValueChange={(value) => setBulkData('buku_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih buku untuk bulk assignment" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {books.map((book) => (
                                                        <SelectItem key={book.buku_id} value={book.buku_id}>
                                                            <div>
                                                                <div className="font-medium">{book.judul_buku}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {book.manuscript?.author?.nama_lengkap} - {book.publisher?.nama_penerbit}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Task Selection */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Pilih Tugas-tugas *</Label>
                                                <Button type="button" variant="outline" size="sm" onClick={toggleSelectAll}>
                                                    {selectedTasks.length === masterTasks.length ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            </div>
                                            <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-4">
                                                {masterTasks.map((task) => {
                                                    const isAssigned = existingTaskIds.includes(task.tugas_id);
                                                    const isSelected = selectedTasks.includes(task.tugas_id);
                                                    return (
                                                        <div key={task.tugas_id} className="flex items-center space-x-3">
                                                            <Checkbox
                                                                id={`task-${task.tugas_id}`}
                                                                checked={isSelected}
                                                                disabled={isAssigned}
                                                                onCheckedChange={(checked) =>
                                                                    handleTaskSelection(task.tugas_id, checked as boolean)
                                                                }
                                                            />
                                                            <label
                                                                htmlFor={`task-${task.tugas_id}`}
                                                                className={`flex flex-1 cursor-pointer items-center gap-2 ${
                                                                    isAssigned ? 'text-gray-400' : ''
                                                                }`}
                                                            >
                                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                                    {task.urutan}
                                                                </span>
                                                                <span>{task.nama_tugas}</span>
                                                                {isAssigned && <span className="text-xs text-red-500">(Sudah di-assign)</span>}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {selectedTasks.length === 0 && (
                                                <p className="text-sm text-gray-500">Pilih minimal satu tugas untuk bulk assignment</p>
                                            )}
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Default PIC */}
                                            <div className="space-y-2">
                                                <Label htmlFor="pic_tugas_user_id" className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Default PIC
                                                </Label>
                                                <Select
                                                    value={bulkData.pic_tugas_user_id}
                                                    onValueChange={(value) => setBulkData('pic_tugas_user_id', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih default PIC (opsional)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">Tidak ada PIC</SelectItem>
                                                        {users.map((user) => (
                                                            <SelectItem key={user.user_id} value={user.user_id}>
                                                                <div>
                                                                    <div className="font-medium">{user.nama_lengkap}</div>
                                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Default Deadline */}
                                            <div className="space-y-2">
                                                <Label htmlFor="deadline" className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Default Deadline
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={bulkData.deadline}
                                                    onChange={(e) => setBulkData('deadline', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={bulkProcessing || selectedTasks.length === 0}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                {bulkProcessing ? 'Menyimpan...' : `Bulk Assign ${selectedTasks.length} Tugas`}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}