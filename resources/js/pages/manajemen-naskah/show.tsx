import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Book } from '@/types/books';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, FileText, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Detail Buku',
        href: '#',
    },
];

export default function ShowDashboard() {
    const { book } = usePage<{ book: Book }>().props;

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Buku - ${book.judul_buku}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="p-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{book.judul_buku}</h1>
                            <p className="text-muted-foreground">Detail dan progres penerbitan buku</p>
                        </div>
                    </div>
                </div>

                {/* Info Cards - Moved to Top */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Basic Info */}
                    <Card className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Penulis</span>
                            </div>
                            <p className="text-sm">{book.manuscript?.author?.nama_lengkap || 'N/A'}</p>
                            <div className="text-xs text-muted-foreground">PIC: {book.pic?.nama_lengkap || 'N/A'}</div>
                        </div>
                    </Card>

                    {/* Publisher */}
                    <Card className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Penerbit</span>
                            </div>
                            <p className="text-sm">{book.publisher?.nama_penerbit || 'N/A'}</p>
                            <div className="text-xs text-muted-foreground">Genre: {book.manuscript?.genre || 'N/A'}</div>
                        </div>
                    </Card>

                    {/* Timeline */}
                    <Card className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Target Cetak</span>
                            </div>
                            <p className="text-sm">
                                {book.tanggal_target_naik_cetak ? formatDate(book.tanggal_target_naik_cetak) : 'Belum ditentukan'}
                            </p>
                            <div className="text-xs text-muted-foreground">
                                Realisasi: {book.tanggal_realisasi_naik_cetak ? formatDate(book.tanggal_realisasi_naik_cetak) : 'Belum ada'}
                            </div>
                        </div>
                    </Card>

                    {/* Progress Summary */}
                    <Card className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{overallProgress}%</span>
                                <Progress value={overallProgress} className="h-2 flex-1" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {book.task_progress?.filter((t) => t.status === 'completed').length || 0} dari {book.task_progress?.length || 0}{' '}
                                selesai
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Progress Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Ringkasan Progres
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                    <span>Selesai: {book.task_progress?.filter((t) => t.status === 'completed').length || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                    <span>Berjalan: {book.task_progress?.filter((t) => t.status === 'in_progress').length || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                                    <span>Menunggu: {book.task_progress?.filter((t) => t.status === 'pending').length || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <span>Terlambat: {book.task_progress?.filter((t) => t.status === 'overdue').length || 0}</span>
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
                                                    {task.catatan && <div className="mt-2 rounded bg-muted/30 p-2 text-xs">{task.catatan}</div>}
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
        </AppLayout>
    );
}
