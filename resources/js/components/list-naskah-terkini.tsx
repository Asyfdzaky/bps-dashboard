import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { Building, Calendar, Edit3, Eye, User } from 'lucide-react';
import { Card, CardContent } from './ui/card';

type Props = { books: Book[] };

export default function ListNaskahTerkini({ books }: Props) {
    // Ambil 5 data terbaru saja
    const recentBooks = [...books].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    const getStatusBadgeVariant = (status: Book['status_keseluruhan']) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            published: 'default',
            draft: 'outline',
            review: 'secondary',
            editing: 'default',
            cancelled: 'destructive',
        };
        return variants[status] ?? 'outline';
    };

    const getStatusText = (status: Book['status_keseluruhan']) => {
        const text: Record<string, string> = {
            published: 'Dipublikasi',
            draft: 'Draft',
            review: 'Review',
            editing: 'Editing',
            cancelled: 'Dibatalkan',
        };
        return text[status] ?? 'Unknown';
    };

    const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

    return (
        <Card className="border-0">
            <CardContent className="p-0">
                {recentBooks.length > 0 ? (
                    <>
                        {/* Header */}
                        <div className="bg-muted/20 text-muted-foreground grid grid-cols-12 gap-4 border-b px-4 py-3 text-sm font-medium">
                            <div className="col-span-12 sm:col-span-4 lg:col-span-3">Judul</div>
                            <div className="hidden sm:col-span-2 sm:block lg:col-span-2">Penerbit</div>
                            <div className="hidden lg:col-span-2 lg:block">PIC</div>
                            <div className="hidden lg:col-span-2 lg:block">Tanggal</div>
                            <div className="hidden sm:col-span-2 sm:block lg:col-span-2">Status</div>
                            <div className="hidden text-right sm:col-span-4 sm:block lg:col-span-1">Aksi</div>
                        </div>

                        {/* Book List */}
                        <div className="divide-y">
                            {recentBooks.map((book) => (
                                <div key={book.buku_id} className="hover:bg-muted/30 grid grid-cols-12 items-center gap-4 p-4 transition-colors">
                                    {/* Judul */}
                                    <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                                        <h4 className="text-truncate text-foreground">{book.judul_buku}</h4>

                                        {/* Meta Info for Mobile - Hidden on larger screens */}
                                        <div className="text-muted-foreground mt-2 flex flex-col gap-2 text-xs sm:hidden">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-3 w-3" />
                                                <span>{book.publisher?.nama_penerbit || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3" />
                                                <span>{book.pic?.nama_lengkap || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(book.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Penerbit - Hidden on mobile */}
                                    <div className="hidden sm:col-span-2 sm:block lg:col-span-2">
                                        <span className="text-foreground block truncate text-sm">{book.publisher?.nama_penerbit || 'N/A'}</span>
                                    </div>

                                    {/* PIC - Hidden on mobile and small tablet */}
                                    <div className="hidden lg:col-span-2 lg:block">
                                        <span className="text-foreground block truncate text-sm">{book.pic?.nama_lengkap || 'N/A'}</span>
                                    </div>

                                    {/* Tanggal - Hidden on mobile and small tablet */}
                                    <div className="hidden lg:col-span-2 lg:block">
                                        <span className="text-muted-foreground whitespace-nowrap text-sm">{formatDate(book.created_at)}</span>
                                    </div>

                                    {/* Status */}
                                    <div className="justify-centercol-span-8 flex items-center sm:col-span-2 lg:col-span-2">
                                        <Badge
                                            variant={getStatusBadgeVariant(book.status_keseluruhan)}
                                            className="rounded-full px-3 py-1 text-xs font-medium"
                                        >
                                            {getStatusText(book.status_keseluruhan)}
                                        </Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-4 flex justify-end sm:col-span-4 lg:col-span-1">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 rounded-lg"
                                            >
                                                <Link href={`/manajemen-naskah/${book.buku_id}?from=dashboard`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 rounded-lg"
                                            >
                                                <Link href={`/manajemen-naskah/${book.buku_id}/edit`}>
                                                    <Edit3 className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-16">
                        <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                            <Building className="text-muted-foreground h-8 w-8" />
                        </div>
                        <h4 className="text-foreground mb-2 text-lg font-semibold">Belum ada naskah</h4>
                        <p className="text-muted-foreground max-w-sm text-center text-sm">
                            Naskah terkini akan muncul di sini setelah Anda mulai membuat atau mengelola naskah.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
