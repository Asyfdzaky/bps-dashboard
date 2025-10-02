import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SortableItem } from '@/components/ui/sortable-item';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Edit2, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Manajemen Task', href: '/manajemen-task' }];

export default function ManajemenTaskPage() {
    const { tasks: initialTasks = [], flash } = usePage().props as { tasks: any[]; flash: any };
    const [tasks, setTasks] = useState(initialTasks);
    const [newTask, setNewTask] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success',
    });

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
        if (flash?.error) {
            showNotification(flash.error, 'error');
        }
    }, [flash]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
    };

    const hideNotification = () => {
        setNotification((prev) => ({ ...prev, show: false }));
    };

    // DnD Kit setup
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = tasks.findIndex((t) => t.tugas_id === active.id);
            const newIndex = tasks.findIndex((t) => t.tugas_id === over?.id);
            const newTasks = arrayMove(tasks, oldIndex, newIndex);
            setTasks(newTasks);

            router.post(
                route('manajemen-task.reorder'),
                { order: newTasks.map((t, idx) => ({ tugas_id: t.tugas_id, urutan: idx + 1 })) },
                {
                    preserveScroll: true,
                    onSuccess: () => showNotification('Urutan task berhasil diperbarui', 'success'),
                    onError: () => showNotification('Gagal menyimpan urutan task', 'error'),
                },
            );
        }
    };

    // CRUD Handlers
    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        router.post(
            route('manajemen-task.store'),
            { nama_tugas: newTask },
            {
                onSuccess: () => {
                    setNewTask('');
                    showNotification('Task berhasil ditambahkan', 'success');
                },
                onError: () => showNotification('Gagal menambahkan task', 'error'),
                preserveScroll: true,
            },
        );
    };

    const handleEdit = (task: any) => {
        setEditingId(task.tugas_id);
        setEditingName(task.nama_tugas);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingName.trim() || editingId === null) return;

        router.put(
            route('manajemen-task.update', { id: editingId }),
            { nama_tugas: editingName },
            {
                onSuccess: () => {
                    setEditingId(null);
                    setEditingName('');
                    showNotification('Task berhasil diperbarui', 'success');
                },
                onError: () => showNotification('Gagal memperbarui task', 'error'),
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus task ini?')) {
            router.delete(route('manajemen-task.destroy', { id }), {
                preserveScroll: true,
                onSuccess: () => showNotification('Task berhasil dihapus', 'success'),
                onError: () => showNotification('Gagal menghapus task', 'error'),
            });
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    // Refresh tasks on props change
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Task" />

            {/* Notification Toast */}
            {notification.show && (
                <div className="fixed top-4 right-4 z-50 duration-300 animate-in fade-in slide-in-from-top-2">
                    <Alert
                        className={`max-w-md min-w-[320px] border shadow-lg ${
                            notification.type === 'success' ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            {notification.type === 'success' ? (
                                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                            )}
                            <div className="min-w-0 flex-1">
                                <AlertTitle className="mb-1 text-sm font-semibold">
                                    {notification.type === 'success' ? 'Berhasil' : 'Terjadi Kesalahan'}
                                </AlertTitle>
                                <AlertDescription className="text-sm">{notification.message}</AlertDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 p-0 hover:bg-transparent" onClick={hideNotification}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </Alert>
                </div>
            )}

            <div className="container mx-auto h-full space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Manajemen Task</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">Kelola urutan dan daftar task dalam sistem</p>
                </div>

                {/* Form Tambah Task */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Plus className="h-5 w-5 text-primary" />
                            Tambah Task Baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1">
                                <Label htmlFor="new-task" className="sr-only">
                                    Nama Task
                                </Label>
                                <Input
                                    id="new-task"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Masukkan nama task baru..."
                                    className="h-10"
                                />
                            </div>
                            <Button type="submit" disabled={!newTask.trim()} className="h-10 w-full px-6 sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Task
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List Task */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg sm:text-xl">Daftar Task</CardTitle>
                            <p className="text-xs text-muted-foreground sm:text-sm">{tasks.length} task tersedia</p>
                        </div>
                        {tasks.length > 0 && <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Drag untuk mengubah urutan</p>}
                    </CardHeader>
                    <CardContent>
                        {tasks.length === 0 ? (
                            <div className="py-12 text-center sm:py-16">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted sm:h-20 sm:w-20">
                                    <Plus className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
                                </div>
                                <p className="mb-1 text-base font-medium text-foreground sm:text-lg">Belum ada task</p>
                                <p className="text-sm text-muted-foreground">Tambahkan task pertama untuk memulai</p>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={tasks.map((t) => t.tugas_id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3">
                                        {tasks.map((task, idx) => (
                                            <SortableItem key={task.tugas_id} id={task.tugas_id}>
                                                <Card className="border shadow-sm transition-shadow hover:shadow-md">
                                                    <CardContent className="p-3 sm:p-4">
                                                        <div className="flex items-center gap-2 sm:gap-4">
                                                            {/* Drag Handle & Number */}
                                                            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                                                                <button
                                                                    className="cursor-grab p-1 text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
                                                                    aria-label="Drag to reorder"
                                                                >
                                                                    <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                                                                </button>
                                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:h-8 sm:w-8 sm:text-sm">
                                                                    {idx + 1}
                                                                </div>
                                                            </div>

                                                            {/* Content */}
                                                            {editingId === task.tugas_id ? (
                                                                <form
                                                                    onSubmit={handleUpdate}
                                                                    className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-3"
                                                                >
                                                                    <Input
                                                                        value={editingName}
                                                                        onChange={(e) => setEditingName(e.target.value)}
                                                                        autoFocus
                                                                        className="h-9 flex-1"
                                                                        placeholder="Nama task..."
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            type="submit"
                                                                            size="sm"
                                                                            disabled={!editingName.trim()}
                                                                            className="h-9 flex-1 sm:flex-none sm:px-3"
                                                                        >
                                                                            <Save className="mr-1.5 h-4 w-4" />
                                                                            <span className="hidden sm:inline">Simpan</span>
                                                                            <span className="sm:hidden">Simpan</span>
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={cancelEdit}
                                                                            className="h-9 flex-1 sm:flex-none sm:px-3"
                                                                        >
                                                                            <X className="mr-1.5 h-4 w-4" />
                                                                            <span className="hidden sm:inline">Batal</span>
                                                                            <span className="sm:hidden">Batal</span>
                                                                        </Button>
                                                                    </div>
                                                                </form>
                                                            ) : (
                                                                <>
                                                                    <div className="mr-2 min-w-0 flex-1">
                                                                        <h3 className="truncate text-sm font-medium text-foreground sm:text-base">
                                                                            {task.nama_tugas}
                                                                        </h3>
                                                                        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                                                            Urutan: {task.urutan}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex shrink-0 gap-1.5 sm:gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleEdit(task)}
                                                                            className="h-8 px-2 sm:h-9 sm:px-3"
                                                                        >
                                                                            <Edit2 className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
                                                                            <span className="hidden sm:inline">Edit</span>
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleDelete(task.tugas_id)}
                                                                            className="h-8 px-2 sm:h-9 sm:px-3"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
                                                                            <span className="hidden sm:inline">Hapus</span>
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </SortableItem>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>

                {/* Info Footer */}
                {tasks.length > 0 && (
                    <div className="px-4 text-center text-xs text-muted-foreground sm:text-sm">
                        💡 Tip: Drag task menggunakan ikon grip untuk mengubah urutan
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
