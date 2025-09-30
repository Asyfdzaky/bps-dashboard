import StatusBukuChart from '@/components/pie-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIGrid, ProgressSummary } from '@/components/ui/progress-summary';
import { StageProgress } from '@/components/ui/progress-timeline';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Book as BookType } from '@/types/books';
import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle, BarChart3, Book, CheckCircle, Clock, FileText, Filter } from 'lucide-react';
import { useState } from 'react';

type PageProps = {
    BooksByStage: Record<string, BookType[]>;
    StageOrder?: string[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Progres', href: '/progres-naskah' }];

const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.valueOf())) return '-';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function ProgressPage() {
    const { BooksByStage, StageOrder } = usePage<PageProps>().props;
    const [showOnlyActive, setShowOnlyActive] = useState(true);

    const stages = StageOrder && StageOrder.length > 0 ? StageOrder : Object.keys(BooksByStage ?? {});

    const countByStage: Record<string, number> = {};
    stages.forEach((s) => {
        countByStage[s] = BooksByStage?.[s]?.length ?? 0;
    });

    const totalBooks = Object.values(countByStage).reduce((a, b) => a + b, 0);

    // Hitung KPI berdasarkan status
    const selesaiCount = countByStage['Selesai'] ?? 0;
    const tertundaCount = countByStage['Tertunda'] ?? 0;
    const sedangDiprosesCount = totalBooks - selesaiCount - tertundaCount;

    // Data untuk chart
    const chartData = {
        'Sedang Diproses': sedangDiprosesCount,
        Selesai: selesaiCount,
        Tertunda: tertundaCount,
    };

    // Filter stages berdasarkan opsi yang dipilih
    const filteredStages = showOnlyActive ? stages.filter((stage) => (BooksByStage?.[stage]?.length ?? 0) > 0 && stage !== 'Selesai') : stages;

    // Konversi data buku menjadi format progress items
    const convertBookToProgressItem = (book: BookType, stage: string) => {
        let status: 'completed' | 'in_progress' | 'pending' | 'overdue' = 'pending';

        if (stage === 'Selesai') {
            status = 'completed';
        } else if (stage === 'Tertunda') {
            status = 'overdue';
        } else {
            status = 'in_progress';
        }

        return {
            id: book.buku_id,
            title: book.judul_buku || `Naskah ${book.buku_id}`,
            category: book.publisher?.nama_penerbit,
            status,
            assignedTo: book.pic
                ? [
                      {
                          id: book.pic.user_id,
                          name: book.pic.nama_lengkap,
                          initials: book.pic.nama_lengkap
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2),
                      },
                  ]
                : undefined,
            dueDate: book.tanggal_target_naik_cetak ? formatDate(book.tanggal_target_naik_cetak) : undefined,
            description: book.manuscript?.author?.nama_lengkap ? `Penulis: ${book.manuscript.author.nama_lengkap}` : undefined,
            buku_id: book.buku_id, // Tambahkan buku_id untuk navigasi
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Progres Naskah" />
            <div className="flex h-full max-w-full flex-1 flex-col gap-4 overflow-hidden p-4 sm:gap-6 sm:p-8">
                {/* KPI Cards */}
                <KPIGrid
                    items={[
                        {
                            title: 'Total Naskah',
                            value: totalBooks,
                            icon: <Book className="h-5 w-5 sm:h-6 sm:w-6" />,
                            color: 'primary',
                            description: 'Total Naskah',
                        },
                        {
                            title: 'Sedang Diproses',
                            value: sedangDiprosesCount,
                            icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
                            color: 'accent',
                            description: 'Naskah yang Sedang dalam Proses',
                        },
                        {
                            title: 'Selesai',
                            value: selesaiCount,
                            icon: <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
                            color: 'secondary',
                            description: 'Naskah yang Sudah Selesai',
                        },
                        {
                            title: 'Tertunda',
                            value: tertundaCount,
                            icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />,
                            color: 'destructive',
                            description: 'Naskah yang Tertunda',
                        },
                    ]}
                />

                {/* Chart Visualization */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                                Distribusi Progres
                            </CardTitle>
                            <CardDescription className="text-sm">Visualisasi status progres seluruh naskah</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <StatusBukuChart data={chartData} title="" />
                        </CardContent>
                    </Card>

                    <ProgressSummary
                        title="Ringkasan Per Tahapan"
                        description="Jumlah naskah di setiap tahapan penerbitan"
                        items={stages.map((stage) => ({
                            name: stage,
                            count: countByStage[stage] ?? 0,
                        }))}
                        total={totalBooks}
                        maxItems={8}
                        showPercentage={true}
                        className="h-full"
                    />
                </div>

                {/* Progress Timeline dengan Filter */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Filter Controls */}
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="min-w-0">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Progress Timeline
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm">
                                        {showOnlyActive
                                            ? `Daftar naskah yang sedang dalam proses — ${filteredStages.reduce((sum, stage) => sum + (countByStage[stage] ?? 0), 0)} naskah aktif`
                                            : `Daftar semua naskah dengan tahapan penerbitan — total ${totalBooks} naskah`}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    <Filter className="hidden h-4 w-4 text-muted-foreground sm:block" />
                                    <div className="flex rounded-lg border bg-muted/30 p-1">
                                        <Button
                                            variant={showOnlyActive ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setShowOnlyActive(true)}
                                            className="h-7 px-2 text-xs sm:px-3"
                                        >
                                            <span className="inline">Sedang Diproses</span>
                                        </Button>
                                        <Button
                                            variant={!showOnlyActive ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setShowOnlyActive(false)}
                                            className="h-7 px-2 text-xs sm:px-3"
                                        >
                                            Semua
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Progress per Stage */}
                    {filteredStages.length > 0 ? (
                        <div className="space-y-4 sm:space-y-6">
                            {filteredStages.map((stage) => {
                                const books = BooksByStage?.[stage] ?? [];
                                const hasBooks = books.length > 0;

                                // Skip stage jika tidak ada buku dan sedang filter aktif
                                if (showOnlyActive && !hasBooks) return null;

                                const progressItems = books.map((book) => convertBookToProgressItem(book, stage));

                                return (
                                    <StageProgress
                                        key={stage}
                                        stageName={stage}
                                        items={progressItems}
                                        showStageHeader={true}
                                        defaultOpen={true}
                                        className="max-w-full"
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="overflow-hidden">
                            <CardContent className="py-8 sm:py-12">
                                <div className="px-4 text-center">
                                    <Book className="mx-auto mb-4 h-8 w-8 text-muted-foreground/30 sm:h-12 sm:w-12" />
                                    <h3 className="text-base font-medium text-muted-foreground sm:text-lg">
                                        {showOnlyActive ? 'Tidak ada naskah yang sedang diproses' : 'Belum ada naskah tersedia'}
                                    </h3>
                                    <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground sm:text-sm">
                                        {showOnlyActive
                                            ? 'Semua naskah sudah selesai atau belum ada yang dalam proses'
                                            : 'Naskah akan muncul di sini setelah ditambahkan ke sistem'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
