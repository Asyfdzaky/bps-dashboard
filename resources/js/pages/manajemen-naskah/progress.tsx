import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIGrid, ProgressSummary } from '@/components/ui/progress-summary';
import AppLayout from '@/layouts/app-layout';
import StatusBukuChart from '@/components/pie-chart';
import { BreadcrumbItem } from '@/types';
import { Book as BookType } from '@/types/books';
import { Head, usePage } from '@inertiajs/react';
import { Book, FileText, CheckCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

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
        'Selesai': selesaiCount,
        'Tertunda': tertundaCount,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Progres Naskah" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* KPI Cards */}
                <KPIGrid
                    items={[
                        {
                            title: "Total Naskah",
                            value: totalBooks,
                            icon: <Book className="h-6 w-6" />,
                            color: "primary",
                        },
                        {
                            title: "Sedang Diproses",
                            value: sedangDiprosesCount,
                            icon: <Clock className="h-6 w-6" />,
                            color: "chart-2",
                        },
                        {
                            title: "Selesai",
                            value: selesaiCount,
                            icon: <CheckCircle className="h-6 w-6" />,
                            color: "chart-3",
                        },
                        {
                            title: "Tertunda",
                            value: tertundaCount,
                            icon: <AlertTriangle className="h-6 w-6" />,
                            color: "destructive",
                        },
                    ]}
                />

                {/* Chart Visualization */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Distribusi Progres Naskah
                            </CardTitle>
                            <CardDescription>
                                Visualisasi status progres seluruh naskah
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                        maxItems={6}
                        showPercentage={true}
                    />
                </div>

                {/* Detail Timeline - Tampilkan hanya yang memiliki buku */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Detail Progres Per Naskah
                        </CardTitle>
                        <CardDescription>
                            Daftar naskah dengan tahapan penerbitan saat ini — total {totalBooks} naskah aktif
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stages.filter(stage => (BooksByStage?.[stage]?.length ?? 0) > 0).map((stage) => {
                                const books = BooksByStage?.[stage] ?? [];
                                const stageColor = stage === 'Selesai' 
                                    ? 'text-chart-3 bg-chart-3/10' 
                                    : stage === 'Tertunda'
                                    ? 'text-destructive bg-destructive/10'
                                    : 'text-chart-2 bg-chart-2/10';

                                return (
                                    <div key={stage} className="space-y-4">
                                        {/* Stage Header */}
                                        <div className="flex items-center gap-3 border-l-4 border-l-primary pl-4">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${stageColor}`}>
                                                {stage === 'Selesai' ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : stage === 'Tertunda' ? (
                                                    <AlertTriangle className="h-4 w-4" />
                                                ) : (
                                                    <Clock className="h-4 w-4" />
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold">{stage}</h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {books.length} naskah
                                            </Badge>
                                        </div>

                                        {/* Books Grid */}
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ml-6">
                                            {books.slice(0, 6).map((book) => (
                                                <div
                                                    key={book.buku_id}
                                                    className="rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20"
                                                >
                                                    <div className="mb-3 line-clamp-2 font-medium text-foreground">
                                                        {book.judul_buku ?? `Naskah ${book.buku_id}`}
                                                    </div>
                                                    <div className="space-y-2 text-sm text-muted-foreground">
                                                        <div className="flex justify-between">
                                                            <span>Penulis:</span>
                                                            <span className="font-medium text-foreground">
                                                                {book.manuscript?.author?.nama_lengkap ?? '-'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>PIC:</span>
                                                            <span className="font-medium text-foreground">
                                                                {book.pic?.nama_lengkap ?? '-'}
                                                            </span>
                                                        </div>
                                                        {book.tanggal_target_naik_cetak && (
                                                            <div className="flex justify-between">
                                                                <span>Target:</span>
                                                                <span className="font-medium text-foreground">
                                                                    {formatDate(book.tanggal_target_naik_cetak)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {books.length > 6 && (
                                                <div className="flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        +{books.length - 6} naskah lainnya
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {stages.filter(stage => (BooksByStage?.[stage]?.length ?? 0) > 0).length === 0 && (
                            <div className="py-12 text-center">
                                <Book className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                                <h3 className="text-lg font-medium text-muted-foreground">Belum ada naskah aktif</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Naskah akan muncul di sini setelah ditambahkan ke sistem
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
