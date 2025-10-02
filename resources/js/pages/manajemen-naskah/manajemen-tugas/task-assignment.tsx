import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Book } from '@/types/books';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Eye, Filter, Plus, Search, Settings, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

type TaskProgress = {
    progres_id: string;
    buku_id: string;
    tugas_id: string;
    pic_tugas_user_id?: string;
    deadline?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    catatan?: string;
    book?: Book;
    master_task?: {
        tugas_id: string;
        nama_tugas: string;
        urutan: number;
    };
    pic?: {
        user_id: string;
        nama_lengkap: string;
        email: string;
    };
};

type Statistics = {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
};

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

interface TaskAssignmentPageProps {
    books: Book[];
    users: User[];
    masterTasks: MasterTask[];
    statistics: Statistics;
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
];

export default function TaskAssignmentPage({ books, users, masterTasks, statistics }: TaskAssignmentPageProps) {
    const [selectedTask, setSelectedTask] = useState<TaskProgress | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Collect all task progress from books
    const allTasks: TaskProgress[] = books.flatMap((book) =>
        (book.task_progress || []).map((task) => ({
            ...task,
            book,
        }))
    );

    // Filter tasks based on search and status
    const filteredTasks = allTasks.filter((task) => {
        const matchesSearch =
            task.book?.judul_buku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.master_task?.nama_tugas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.pic?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleDelete = (task: TaskProgress) => {
        setSelectedTask(task);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedTask) {
            router.delete(`/task-assignment/${selectedTask.progres_id}`);
        }
        closeDeleteDialog();
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setSelectedTask(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'overdue':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
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
                return 'Unknown';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assignment Tugas" />
            <div className="mx-auto w-full max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Assignment Tugas</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola assignment tugas untuk semua buku</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/task-assignment/create">
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Assign Tugas Baru
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tugas</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
                            <Clock className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sedang Berjalan</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.in_progress}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.completed}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
                            <Calendar className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.overdue}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Cari buku, tugas, atau PIC..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="in_progress">Sedang Berjalan</option>
                                    <option value="completed">Selesai</option>
                                    <option value="overdue">Terlambat</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Assignment Tugas</CardTitle>
                        <CardDescription>
                            Menampilkan {filteredTasks.length} dari {allTasks.length} tugas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredTasks.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Buku</TableHead>
                                        <TableHead>Tugas</TableHead>
                                        <TableHead>PIC</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Deadline</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTasks.map((task) => (
                                        <TableRow key={task.progres_id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{task.book?.judul_buku}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {task.book?.manuscript?.author?.nama_lengkap}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                        {task.master_task?.urutan}
                                                    </span>
                                                    <span>{task.master_task?.nama_tugas}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {task.pic ? (
                                                    <div>
                                                        <div className="font-medium">{task.pic.nama_lengkap}</div>
                                                        <div className="text-sm text-gray-500">{task.pic.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Belum di-assign</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(task.status)}>{getStatusText(task.status)}</Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(task.deadline)}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {task.tanggal_mulai && (
                                                        <div className="text-xs text-gray-500">
                                                            Mulai: {formatDate(task.tanggal_mulai)}
                                                        </div>
                                                    )}
                                                    {task.tanggal_selesai && (
                                                        <div className="text-xs text-gray-500">
                                                            Selesai: {formatDate(task.tanggal_selesai)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/task-assignment/${task.progres_id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <Settings className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                <h3 className="mb-2 text-lg font-medium text-gray-700">Belum ada assignment tugas</h3>
                                <p className="mb-4 text-gray-500">Mulai assign tugas untuk mengelola progress buku</p>
                                <Link href="/task-assignment/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Assign Tugas Pertama
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus assignment tugas "{selectedTask?.master_task?.nama_tugas}" untuk buku "
                            {selectedTask?.book?.judul_buku}"? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeDeleteDialog}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}