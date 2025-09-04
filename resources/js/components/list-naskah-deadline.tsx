import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type Props = { books: Book[]; title?: string };

export default function ListNaskahDeadline({ books }: Props) {
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

    const getDeadlineColor = (deadline: string) => {
        const days = getDaysUntilDeadline(deadline);
        if (days < 0) return 'bg-red-100 text-red-700'; // Overdue
        if (days <= 3) return 'bg-orange-100 text-orange-700'; // Critical
        if (days <= 7) return 'bg-yellow-100 text-yellow-700'; // Warning
        return 'bg-blue-100 text-blue-700'; // Normal
    };

    return (
        <Card className='bg-background'>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-primary">
                    Deadline Terdekat
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-2 p-4">
                        {upcomingDeadlines.map((b) => (
                            <Link key={b.buku_id} href={`/manajemen-naskah/${b.buku_id}`} className="block rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    {/* Left Section - Name and Status */}
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-semibold text-gray-900">{b.judul_buku}</div>
                                        <div
                                            className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getDeadlineColor(b.tanggal_target_naik_cetak)}`}
                                        >
                                            {getDaysUntilDeadline(b.tanggal_target_naik_cetak)} hari
                                        </div>
                                    </div>

                                    {/* Middle Section - Address/Info */}
                                    <div className="flex-1 px-4 text-sm text-gray-600">
                                        <div className="truncate text-xs">{b.pic?.nama_lengkap || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{formatDate(b.tanggal_target_naik_cetak)}</div>
                                    </div>

                                    {/* Right Section - Navigation Icon */}
                                    <div className="flex-shrink-0">
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-xs text-neutral-500 dark:text-neutral-400">Tidak ada deadline terdekat</div>
                )}
            </CardContent>
        </Card>
    );
}
