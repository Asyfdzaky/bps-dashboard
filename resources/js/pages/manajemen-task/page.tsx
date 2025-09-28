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
import { CheckCircle, Edit2, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
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
        type: 'success' | 'error';c
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

            // Kirim urutan baru ke backend
            router.post(
                route('manajemen-task.reorder'),
                { order: newTasks.map((t, idx) => ({ tugas_id: t.tugas_id, urutan: idx + 1 })) },
                {
                    preserveScroll: true,
                    onSuccess: () => showNotification('Urutan task berhasil diperbarui!', 'success'),
                    onError: () => showNotification('Terjadi kesalahan saat menyimpan urutan task.', 'error'),
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
                onSuccess: () => setNewTask(''),
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
                    showNotification('Task berhasil diperbarui!', 'success');
                },
                preserveScroll: true,
                onError: () => {
                    showNotification('Terjadi kesalahan saat memperbarui task.', 'error');
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus tugas ini?')) {
            router.delete(route('manajemen-task.destroy', { id }), {
                preserveScroll: true,
                onSuccess: () => {
                    showNotification(`task berhasil dihapus!`, 'success');
                },
                onError: () => {
                    showNotification('Terjadi kesalahan saat menghapus task.', 'error');
                },
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

            <div className="container mx-auto h-full space-y-6 p-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-foreground text-3xl font-bold">Manajemen Task</h1>
                        <p className="text-muted-foreground mt-1">Kelola urutan dan daftar task dalam sistem</p>
                    </div>
                </div>

                {/* Form Tambah Task */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Tambah Task Baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="flex gap-3">
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
                            <Button type="submit" disabled={!newTask.trim()} className="h-10 px-6">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List Task */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Task</CardTitle>
                        <p className="text-muted-foreground text-sm">{tasks.length} task tersedia. Drag untuk mengubah urutan.</p>
                    </CardHeader>
                    <CardContent>
                        {tasks.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="text-muted-foreground mb-4">
                                    <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                        <Plus className="h-8 w-8" />
                                    </div>
                                    <p className="text-lg font-medium">Belum ada task</p>
                                    <p className="text-sm">Tambahkan task pertama untuk memulai</p>
                                </div>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={tasks.map((t) => t.tugas_id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {tasks.map((task, idx) => (
                                            <SortableItem key={task.tugas_id} id={task.tugas_id}>
                                                <Card className="border-l-primary/20 border-l-4 transition-all duration-200 hover:shadow-md">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            {/* Drag Handle */}
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    className="text-muted-foreground hover:text-foreground cursor-grab p-1 transition-colors active:cursor-grabbing"
                                                                    aria-label="Drag to reorder"
                                                                >
                                                                    <GripVertical className="h-5 w-5" />
                                                                </button>

                                                                {/* Nomor Urut */}
                                                                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                                                                    {idx + 1}
                                                                </div>
                                                            </div>

                                                            {/* Content */}
                                                            {editingId === task.tugas_id ? (
                                                                <form onSubmit={handleUpdate} className="flex flex-1 gap-3">
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
                                                                            className="h-9 px-3"
                                                                        >
                                                                            <Save className="mr-1 h-4 w-4" />
                                                                            Simpan
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={cancelEdit}
                                                                            className="h-9 px-3"
                                                                        >
                                                                            <X className="mr-1 h-4 w-4" />
                                                                            Batal
                                                                        </Button>
                                                                    </div>
                                                                </form>
                                                            ) : (
                                                                <>
                                                                    <div className="flex-1">
                                                                        <h3 className="text-foreground font-medium leading-none">
                                                                            {task.nama_tugas}
                                                                        </h3>
                                                                        <p className="text-muted-foreground mt-1 text-sm">Urutan: {task.urutan}</p>
                                                                    </div>

                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleEdit(task)}
                                                                            className="h-9 px-3"
                                                                        >
                                                                            <Edit2 className="mr-1 h-4 w-4" />
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleDelete(task.tugas_id)}
                                                                            className="h-9 px-3"
                                                                        >
                                                                            <Trash2 className="mr-1 h-4 w-4" />
                                                                            Hapus
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
                    <div className="text-muted-foreground text-center text-sm">💡 Tip: Drag task menggunakan ikon grip untuk mengubah urutan</div>
                )}
            </div>
        </AppLayout>
    );
}
