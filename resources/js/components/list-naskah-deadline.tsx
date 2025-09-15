import { Badge } from '@/components/ui/badge';
import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type Props = { books: Book[]; title?: string };

export default function ListNaskahDeadline({ books, title }: Props) {
    // Filter buku yang belum selesai dan urutkan berdasarkan deadline terdekat
    const upcomingDeadlines = books
        .filter((book) => book.status_keseluruhan !== 'published' && book.status_keseluruhan !== 'cancelled' && book.tanggal_target_naik_cetak)
        .sort((a, b) => {
            const dateA = new Date(a.tanggal_target_naik_cetak).getTime();
            const dateB = new Date(b.tanggal_target_naik_cetak).getTime();
            return dateA - dateB;
        })
        .slice(0, 5);

    const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '—');

    const getDaysUntilDeadline = (deadline: string) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDeadlineUrgency = (deadline: string) => {
        const days = getDaysUntilDeadline(deadline);
        if (days < 0)
            return {
                variant: 'destructive' as const,
                text: 'Overdue',
                bgClass:
                    'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30 hover:from-destructive/15 hover:to-destructive/10',
                iconColor: 'text-destructive',
            };
        if (days <= 3)
            return {
                variant: 'destructive' as const,
                text: `${days} hari`,
                bgClass: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200/50 hover:from-orange-100 hover:to-red-100',
                iconColor: 'text-orange-600',
            };
        if (days <= 7)
            return {
                variant: 'secondary' as const,
                text: `${days} hari`,
                bgClass: 'bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/30 hover:from-secondary/15 hover:to-secondary/10',
                iconColor: 'text-secondary-foreground',
            };
        return {
            variant: 'outline' as const,
            text: `${days} hari`,
            iconColor: 'text-chart-2',
        };
    };

    return (
        <Card className="border border-border">
            {title && (
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                        <div className="rounded-full bg-destructive/10 p-2">
                            <Clock className="h-5 w-5 text-destructive" />
                        </div>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-0">
                {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-4 p-6 pt-4">
                        {upcomingDeadlines.map((book) => {
                            const urgency = getDeadlineUrgency(book.tanggal_target_naik_cetak);
                            return (
                                <Link
                                    key={book.buku_id}
                                    href={`/manajemen-naskah/${book.buku_id}?from=dashboard`}
                                    className={`block rounded-xl border p-5 ${urgency.bgClass}`}
                                >
                                    <div className="flex flex-col gap-4">
                                        {/* Header with Title and Urgency Badge */}
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="line-clamp-2 flex-1 text-base leading-tight font-semibold text-primary">
                                                {book.judul_buku}
                                            </h4>
                                            <Badge variant={urgency.variant} className="flex-shrink-0 px-3 py-1 text-sm font-medium">
                                                {urgency.text}
                                            </Badge>
                                        </div>

                                        {/* Meta Information */}
                                        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-full bg-chart-2/20 p-1.5">
                                                    <User className="h-3.5 w-3.5 text-chart-2" />
                                                </div>
                                                <span className="truncate font-medium">{book.pic?.nama_lengkap || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-full bg-chart-3/20 p-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-chart-3" />
                                                </div>
                                                <span className="font-medium">{formatDate(book.tanggal_target_naik_cetak)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="rounded-full bg-muted p-4">
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Tidak ada deadline terdekat</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
