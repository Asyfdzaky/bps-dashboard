import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Save, User } from 'lucide-react';

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
    book?: {
        buku_id: string;
        judul_buku: string;
        manuscript?: {
            author?: {
                nama_lengkap: string;
            };
        };
        publisher?: {
            nama_penerbit: string;
        };
    };
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

interface EditTaskAssignmentPageProps {
    taskProgress: TaskProgress;
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
        title: 'Edit Assignment',
        href: '#',
    },
];

export default function EditTaskAssignmentPage({ taskProgress, users, masterTasks }: EditTaskAssignmentPageProps) {
    const { data, setData, put, processing, errors } = useForm({
        pic_tugas_user_id: taskProgress.pic_tugas_user_id || '',
        deadline: taskProgress.deadline || '',
        status: taskProgress.status,
        tanggal_mulai: taskProgress.tanggal_mulai || '',
        tanggal_selesai: taskProgress.tanggal_selesai || '',
        catatan: taskProgress.catatan || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/task-assignment/${taskProgress.progres_id}`, {
            onSuccess: () => {
                router.visit('/task-assignment');
            },
        });
    };

    const handleBack = () => {
        router.visit('/task-assignment');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'in_progress':
                return 'text-blue-600';
            case 'pending':
                return 'text-gray-600';
            case 'overdue':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Assignment - ${taskProgress.master_task?.nama_tugas}`} />

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
                                    <h1 className="text-xl font-semibold text-gray-900">Edit Task Assignment</h1>
                                    <p className="text-sm text-gray-600">{taskProgress.master_task?.nama_tugas}</p>
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
                <div className="mx-auto max-w-4xl">
                    <div className="space-y-6">
                        {/* Task Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Tugas</CardTitle>
                                <CardDescription>Detail tugas yang sedang di-edit</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Buku</Label>
                                        <p className="mt-1 text-sm text-gray-900">{taskProgress.book?.judul_buku}</p>
                                        <p className="text-xs text-gray-500">
                                            {taskProgress.book?.manuscript?.author?.nama_lengkap} - {taskProgress.book?.publisher?.nama_penerbit}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Tugas</Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                {taskProgress.master_task?.urutan}
                                            </span>
                                            <span className="text-sm text-gray-900">{taskProgress.master_task?.nama_tugas}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Form */}
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit Assignment Details</CardTitle>
                                    <CardDescription>Update task assignment information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                            {errors.pic_tugas_user_id && (
                                                <p className="text-sm text-red-600">{errors.pic_tugas_user_id}</p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status *</Label>
                                            <Select value={data.status} onValueChange={(value: any) => setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                                                            Menunggu
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="in_progress">
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                            Sedang Berjalan
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="completed">
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                            Selesai
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="overdue">
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                                            Terlambat
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                        </div>
                                    </div>

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
                                            className="max-w-xs"
                                        />
                                        {errors.deadline && <p className="text-sm text-red-600">{errors.deadline}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Start Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                                            <Input
                                                type="date"
                                                value={data.tanggal_mulai}
                                                onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                            />
                                            {errors.tanggal_mulai && <p className="text-sm text-red-600">{errors.tanggal_mulai}</p>}
                                        </div>

                                        {/* End Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                                            <Input
                                                type="date"
                                                value={data.tanggal_selesai}
                                                onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                            />
                                            {errors.tanggal_selesai && <p className="text-sm text-red-600">{errors.tanggal_selesai}</p>}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="catatan">Catatan</Label>
                                        <Textarea
                                            value={data.catatan}
                                            onChange={(e) => setData('catatan', e.target.value)}
                                            placeholder="Tambahkan catatan untuk tugas ini..."
                                            rows={4}
                                        />
                                        {errors.catatan && <p className="text-sm text-red-600">{errors.catatan}</p>}
                                    </div>

                                    {/* Current Status Summary */}
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <h4 className="mb-2 text-sm font-medium text-gray-700">Status Saat Ini:</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                            <div>
                                                <span className="text-gray-500">Status:</span>
                                                <p className={`font-medium ${getStatusColor(data.status)}`}>
                                                    {data.status === 'pending' && 'Menunggu'}
                                                    {data.status === 'in_progress' && 'Sedang Berjalan'}
                                                    {data.status === 'completed' && 'Selesai'}
                                                    {data.status === 'overdue' && 'Terlambat'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">PIC:</span>
                                                <p className="font-medium">
                                                    {data.pic_tugas_user_id
                                                        ? users.find((u) => u.user_id === data.pic_tugas_user_id)?.nama_lengkap
                                                        : 'Belum di-assign'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Deadline:</span>
                                                <p className="font-medium">
                                                    {data.deadline
                                                        ? new Date(data.deadline).toLocaleDateString('id-ID')
                                                        : 'Belum ditentukan'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Durasi:</span>
                                                <p className="font-medium">
                                                    {data.tanggal_mulai && data.tanggal_selesai
                                                        ? `${Math.ceil(
                                                              (new Date(data.tanggal_selesai).getTime() -
                                                                  new Date(data.tanggal_mulai).getTime()) /
                                                                  (1000 * 60 * 60 * 24)
                                                          )} hari`
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}