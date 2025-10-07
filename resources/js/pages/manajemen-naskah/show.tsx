import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Book } from '@/types/books';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, Building, Calendar, CheckCircle, Clock, FileText, PauseCircle, User } from 'lucide-react';
import React, { useMemo } from 'react';

interface InfoCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

function InfoCard({ title, icon, children }: InfoCardProps) {
    return (
        <div className="relative overflow-hidden rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <p className="mb-2 truncate text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
                    {children}
                </div>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function ShowDashboard() {
    const { book, referer } = usePage<{ book: Book; referer: string }>().props;

    const breadcrumbs = useMemo(() => {
        switch (referer) {
            case 'dashboard':
                return [
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Detail Buku', href: '#' },
                ] as BreadcrumbItem[];
            case 'progress':
                return [
                    { title: 'Progres Naskah', href: '/progres-naskah' },
                    { title: 'Detail Buku', href: '#' },
                ] as BreadcrumbItem[];
            case 'naskah':
            default:
                return [
                    { title: 'Manajemen Naskah', href: '/manajemen-naskah' },
                    { title: 'Detail Buku', href: '#' },
                ] as BreadcrumbItem[];
        }
    }, [referer]);

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

    const formatDate = (dateString: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const calculateOverallProgress = () => {
        if (!book.task_progress || book.task_progress.length === 0) return 0;
        const totalTasks = book.task_progress.length;
        const completedTasks = book.task_progress.filter((task) => task.status === 'completed').length;
        return Math.round((completedTasks / totalTasks) * 100);
    };

    const overallProgress = calculateOverallProgress();

    const taskCounts = useMemo(() => {
        return {
            completed: book.task_progress?.filter((t) => t.status === 'completed').length || 0,
            in_progress: book.task_progress?.filter((t) => t.status === 'in_progress').length || 0,
            pending: book.task_progress?.filter((t) => t.status === 'pending').length || 0,
            overdue: book.task_progress?.filter((t) => t.status === 'overdue').length || 0,
        };
    }, [book.task_progress]);

    const totalTasks = book.task_progress?.length || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Buku - ${book.judul_buku}`} />

            <div className="min-h-screen">
                {/* Header */}
                <div>
                    <div className="max-w-7xl">
                        <div className="flex items-center justify-between">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">{book.judul_buku}</h1>
                                <p className="mt-1 text-sm text-gray-600">Detail dan progres penerbitan buku</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto max-w-7xl">
                    <div className="space-y-8">
                        {/* Info Cards */}
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                            <InfoCard title="Penulis" icon={<User className="h-5 w-5" />}>
                                <h3 className="truncate text-lg font-bold">{book.manuscript?.author?.nama_lengkap || 'N/A'}</h3>
                                <p className="mt-2 text-xs text-muted-foreground">PIC: {book.pic?.nama_lengkap || 'N/A'}</p>
                            </InfoCard>

                            <InfoCard title="Penerbit" icon={<Building className="h-5 w-5" />}>
                                <h3 className="truncate text-lg font-bold">{book.publisher?.nama_penerbit || 'N/A'}</h3>
                                <p className="mt-2 text-xs text-muted-foreground">Genre: {book.manuscript?.genre || 'N/A'}</p>
                            </InfoCard>

                            <InfoCard title="Target Cetak" icon={<Calendar className="h-5 w-5" />}>
                                <h3 className="text-lg font-bold">{formatDate(book.tanggal_target_naik_cetak) || 'Belum ditentukan'}</h3>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Realisasi: {formatDate(book.tanggal_realisasi_naik_cetak) || 'Belum ada'}
                                </p>
                            </InfoCard>

                            <InfoCard title="Progress" icon={<CheckCircle className="h-5 w-5" />}>
                                <h3 className="truncate text-lg font-bold">{overallProgress}%</h3>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {taskCounts.completed} dari {totalTasks} selesai
                                </p>
                            </InfoCard>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Progress Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Progres</CardTitle>
                                    <CardDescription>Jumlah tugas berdasarkan status</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                                        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Selesai</p>
                                                <p className="text-2xl font-bold">{taskCounts.completed}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                                <Clock className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Berjalan</p>
                                                <p className="text-2xl font-bold">{taskCounts.in_progress}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                                <PauseCircle className="h-6 w-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Menunggu</p>
                                                <p className="text-2xl font-bold">{taskCounts.pending}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
                                                <AlertCircle className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Terlambat</p>
                                                <p className="text-2xl font-bold">{taskCounts.overdue}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Timeline Progres</CardTitle>
                                    <CardDescription>Tahapan penerbitan buku</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {book.task_progress?.length ? (
                                        <div className="relative">
                                            {/* Timeline Line */}
                                            <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border"></div>

                                            {book.task_progress
                                                .sort((a, b) => (a.master_task?.urutan || 0) - (b.master_task?.urutan || 0))
                                                .map((task) => (
                                                    <div key={task.progres_id} className="relative flex gap-4 pb-6 last:pb-0">
                                                        {/* Timeline Dot */}
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

                                                        {/* Timeline Content */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-2 flex items-start justify-between">
                                                                <div>
                                                                    <h4 className="text-sm font-medium">
                                                                        {task.master_task?.nama_tugas || `Task ${task.tugas_id}`}
                                                                    </h4>
                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        {task.pic?.nama_lengkap || 'Belum ada PIC'}
                                                                    </p>
                                                                </div>
                                                                <Badge className={getStatusColor(task.status)}>{getStatusText(task.status)}</Badge>
                                                            </div>

                                                            {/* Progress */}
                                                            {task.progress_percentage > 0 && (
                                                                <div className="mb-2">
                                                                    <div className="mb-1 flex items-center justify-between">
                                                                        <span className="text-xs text-muted-foreground">Progress</span>
                                                                        <span className="text-xs font-medium">{task.progress_percentage}%</span>
                                                                    </div>
                                                                    <Progress value={task.progress_percentage} className="h-1.5" />
                                                                </div>
                                                            )}

                                                            {/* Dates */}
                                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                                {task.tanggal_mulai && (
                                                                    <div>
                                                                        <span>Mulai: </span>
                                                                        <span className="font-medium">{formatDate(task.tanggal_mulai)}</span>
                                                                    </div>
                                                                )}
                                                                {task.deadline && (
                                                                    <div>
                                                                        <span>Target: </span>
                                                                        <span className="font-medium">{formatDate(task.deadline)}</span>
                                                                    </div>
                                                                )}
                                                                {task.tanggal_selesai && (
                                                                    <div>
                                                                        <span>Selesai: </span>
                                                                        <span className="font-medium">{formatDate(task.tanggal_selesai)}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Notes */}
                                                            {task.catatan && (
                                                                <div className="mt-2 rounded bg-muted/30 p-2 text-xs">{task.catatan}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                                            <p className="text-sm text-muted-foreground">Belum ada progres tersedia</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
