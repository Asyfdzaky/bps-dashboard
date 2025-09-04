import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

type User = {
    user_id: string;
    nama_lengkap: string;
    email: string;
};

type Publisher = {
    penerbit_id: string;
    nama_penerbit: string;
};

type MasterTask = {
    tugas_id: number;
    nama_tugas: string;
    urutan: number;
};

type TaskProgress = {
    progres_id: string;
    tugas_id: number;
    pic_tugas_user_id?: string;
    deadline?: string;
    status: string;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    catatan?: string;
};

type TaskProgressValue = string | number | undefined | null;

type PageProps = {
    users: User[];
    publishers: Publisher[];
    masterTasks: MasterTask[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Naskah', href: '/manajemen-naskah' },
    { title: 'Buat Naskah', href: '/manajemen-naskah/create' },
];

export default function CreateNaskahPage({ users, publishers, masterTasks }: PageProps) {
    const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        judul_buku: '',
        pic_user_id: '',
        penerbit_id: '',
        status_keseluruhan: 'draft',
        tanggal_target_naik_cetak: '',
        tanggal_realisasi_naik_cetak: '',
        task_progress: [] as TaskProgress[],
    });

    const addTask = () => {
        const newTask: TaskProgress = {
            progres_id: `temp_${Date.now()}`,
            tugas_id: 0,
            status: 'pending',
        };
        setTaskProgress([...taskProgress, newTask]);
    };

    const removeTask = (index: number) => {
        const newTasks = taskProgress.filter((_, i) => i !== index);
        setTaskProgress(newTasks);
    };

    const updateTask = (index: number, field: keyof TaskProgress, value: TaskProgressValue) => {
        const newTasks = [...taskProgress];
        newTasks[index] = { ...newTasks[index], [field]: value };
        setTaskProgress(newTasks);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Update form data with task progress
        setData('task_progress', taskProgress);

        // Submit form
        post('/manajemen-naskah');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Naskah Baru" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Buat Naskah Baru</h1>
                    <p className="text-muted-foreground">Tambahkan naskah baru ke dalam sistem</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>Data utama naskah</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="judul_buku">Judul Buku *</Label>
                                    <Input
                                        id="judul_buku"
                                        value={data.judul_buku}
                                        onChange={(e) => setData('judul_buku', e.target.value)}
                                        placeholder="Masukkan judul buku"
                                        className={errors.judul_buku ? 'border-red-500' : ''}
                                    />
                                    {errors.judul_buku && <p className="mt-1 text-sm text-red-500">{errors.judul_buku}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status_keseluruhan">Status *</Label>
                                    <Select value={data.status_keseluruhan} onValueChange={(value) => setData('status_keseluruhan', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="editing">Editing</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="pic_user_id">PIC *</Label>
                                    <Select value={data.pic_user_id} onValueChange={(value) => setData('pic_user_id', value)}>
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

                                <div>
                                    <Label htmlFor="penerbit_id">Publisher *</Label>
                                    <Select value={data.penerbit_id} onValueChange={(value) => setData('penerbit_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih publisher" />
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

                                <div>
                                    <Label htmlFor="tanggal_target_naik_cetak">Target Naik Cetak</Label>
                                    <Input
                                        id="tanggal_target_naik_cetak"
                                        type="date"
                                        value={data.tanggal_target_naik_cetak}
                                        onChange={(e) => setData('tanggal_target_naik_cetak', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tanggal_realisasi_naik_cetak">Realisasi Naik Cetak</Label>
                                    <Input
                                        id="tanggal_realisasi_naik_cetak"
                                        type="date"
                                        value={data.tanggal_realisasi_naik_cetak}
                                        onChange={(e) => setData('tanggal_realisasi_naik_cetak', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task Progress */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Progress Tugas</CardTitle>
                                    <CardDescription>Daftar tugas yang perlu diselesaikan</CardDescription>
                                </div>
                                <Button type="button" onClick={addTask} variant="outline" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Tugas
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {taskProgress.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">Belum ada tugas yang ditambahkan</div>
                            ) : (
                                <div className="space-y-4">
                                    {taskProgress.map((task, index) => (
                                        <div key={task.progres_id} className="rounded-lg border p-4">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="font-medium">Tugas {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeTask(index)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label>Tugas *</Label>
                                                    <Select
                                                        value={task.tugas_id.toString()}
                                                        onValueChange={(value) => updateTask(index, 'tugas_id', parseInt(value))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih tugas" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {masterTasks.map((masterTask) => (
                                                                <SelectItem key={masterTask.tugas_id} value={masterTask.tugas_id.toString()}>
                                                                    {masterTask.nama_tugas}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>Status *</Label>
                                                    <Select value={task.status} onValueChange={(value) => updateTask(index, 'status', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="overdue">Overdue</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>PIC Tugas</Label>
                                                    <Select
                                                        value={task.pic_tugas_user_id || ''}
                                                        onValueChange={(value) =>
                                                            updateTask(index, 'pic_tugas_user_id', value === 'none' ? null : value)
                                                        }
                                                    >
                                                        <SelectTrigger>
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

                                                <div>
                                                    <Label>Deadline</Label>
                                                    <Input
                                                        type="date"
                                                        value={task.deadline || ''}
                                                        onChange={(e) => updateTask(index, 'deadline', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Tanggal Mulai</Label>
                                                    <Input
                                                        type="date"
                                                        value={task.tanggal_mulai || ''}
                                                        onChange={(e) => updateTask(index, 'tanggal_mulai', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Tanggal Selesai</Label>
                                                    <Input
                                                        type="date"
                                                        value={task.tanggal_selesai || ''}
                                                        onChange={(e) => updateTask(index, 'tanggal_selesai', e.target.value)}
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <Label>Catatan</Label>
                                                    <Textarea
                                                        value={task.catatan || ''}
                                                        onChange={(e) => updateTask(index, 'catatan', e.target.value)}
                                                        placeholder="Tambahkan catatan jika diperlukan"
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Naskah'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
