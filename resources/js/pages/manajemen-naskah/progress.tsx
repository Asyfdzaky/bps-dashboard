import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Book, FileText } from 'lucide-react';

type Author = { name?: string | null };
type Pic = { nama_lengkap?: string | null };
type Manuscript = { author?: Author | null };
type Book = {
    buku_id: string;
    judul_buku?: string | null;
    manuscript?: Manuscript | null;
    pic?: Pic | null;
    tanggal_target_naik_cetak?: string | null;
    tanggal_realisasi_naik_cetak?: string | null;
};

type PageProps = {
    BooksByStage: Record<string, Book[]>;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Progres Naskah" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Summary Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Progres</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                            {stages.map((stage) => {
                                const count = countByStage[stage] ?? 0;
                                return (
                                    <div key={stage} className="flex flex-col items-center justify-center rounded-xl border bg-card p-4">
                                        <div className="text-3xl font-bold text-primary">{count}</div>
                                        <div className="mt-2 text-center text-sm font-medium text-muted-foreground">{stage}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Timeline Progres Naskah</CardTitle>
                        <CardDescription>Tahapan penerbitan buku — total {totalBooks} buku aktif</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <div className="space-y-8">
                                {stages.map((stage, idx) => {
                                    const books = BooksByStage?.[stage] ?? [];
                                    const hasBooks = books.length > 0;

                                    return (
                                        <div key={stage} className="relative flex gap-6">
                                            <div className="flex h-80 flex-col items-center">
                                                {/* Dot */}
                                                <div
                                                    className={`z-10 mb-5 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background text-sm font-semibold ${
                                                        hasBooks ? 'bg-primary text-primary-foreground' : 'border-border'
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </div>

                                                {/* Bottom line */}
                                                <div
                                                    className={`w-0.5 flex-1 ${
                                                        idx < stages.length - 1 ? (hasBooks ? 'bg-accent' : 'bg-border') : 'bg-transparent'
                                                    }`}
                                                />
                                            </div>

                                            {/* Stage Content */}
                                            <div className="flex-1 pb-10">
                                                {/* Stage Header */}
                                                <div className="mb-4 flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold">{stage}</h3>
                                                    <Badge variant={hasBooks ? 'default' : 'outline'}>{books.length} buku</Badge>
                                                </div>

                                                {/* Books in this stage */}
                                                {hasBooks ? (
                                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                        {books.map((book) => (
                                                            <div
                                                                key={book.buku_id}
                                                                className="rounded-lg border bg-muted/50 p-3 transition-shadow hover:shadow-sm"
                                                            >
                                                                <div className="mb-2 line-clamp-2 font-medium text-foreground">
                                                                    {book.judul_buku ?? `Buku ${book.buku_id}`}
                                                                </div>
                                                                <div className="mb-1 text-sm text-muted-foreground">
                                                                    <strong>Penulis:</strong> {book.manuscript?.author?.name ?? '-'}
                                                                </div>
                                                                <div className="mb-3 text-sm text-muted-foreground">
                                                                    <strong>PIC:</strong> {book.pic?.nama_lengkap ?? '-'}
                                                                </div>
                                                                <div className="space-y-1 text-xs">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Target Cetak:</span>
                                                                        <span className="font-medium">
                                                                            {formatDate(book.tanggal_target_naik_cetak)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Realisasi:</span>
                                                                        <span className="font-medium">
                                                                            {formatDate(book.tanggal_realisasi_naik_cetak)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 rounded-lg border-2 border-dashed bg-muted/30 px-4 py-4">
                                                        <FileText className="h-5 w-5 text-muted-foreground/50" />
                                                        <span className="text-sm text-muted-foreground">Tidak ada buku pada tahapan ini</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fallback jika tidak ada data */}
                {(!stages || stages.length === 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline Progres</CardTitle>
                            <CardDescription>Tahapan penerbitan buku</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="py-8 text-center">
                                <Book className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">Belum ada data progres tersedia</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
