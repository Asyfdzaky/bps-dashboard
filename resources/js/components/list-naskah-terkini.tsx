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
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
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
                        <div className="grid grid-cols-12 gap-4 border-b bg-muted/20 px-4 py-3 text-sm font-medium text-muted-foreground">
                            <div className="col-span-12 sm:col-span-4 lg:col-span-3">Judul</div>
                            <div className="hidden sm:col-span-2 sm:block lg:col-span-2">Penerbit</div>
                            <div className="hidden lg:col-span-2 lg:block">PIC</div>
                            <div className="hidden lg:col-span-2 lg:block">Tanggal</div>
                            <div className="hidden text-center sm:col-span-2 sm:block lg:col-span-2">Status</div>
                            <div className="hidden text-center sm:col-span-4 sm:block lg:col-span-1">Aksi</div>
                        </div>

                        {/* Book List */}
                        <div className="divide-y">
                            {recentBooks.map((book) => (
                                <div key={book.buku_id} className="grid grid-cols-12 items-center gap-4 p-4 transition-colors hover:bg-muted/30">
                                    {/* Judul */}
                                    <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                                        <h4 className="text-truncate text-foreground">{book.judul_buku}</h4>

                                        {/* Meta Info for Mobile - Hidden on larger screens */}
                                        <div className="mt-2 flex flex-col gap-2 text-xs text-muted-foreground sm:hidden">
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
                                            {/* Status di mobile */}
                                            <div className="flex items-center gap-2">
                                                <span>Status:</span>
                                                <Badge
                                                    variant={getStatusBadgeVariant(book.status_keseluruhan)}
                                                    className="rounded-lg px-3 py-1 text-xs font-medium"
                                                >
                                                    {getStatusText(book.status_keseluruhan)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Penerbit - Hidden on mobile */}
                                    <div className="hidden sm:col-span-2 sm:block lg:col-span-2">
                                        <span className="block truncate text-sm text-foreground">{book.publisher?.nama_penerbit || 'N/A'}</span>
                                    </div>

                                    {/* PIC - Hidden on mobile and small tablet */}
                                    <div className="hidden lg:col-span-2 lg:block">
                                        <span className="block truncate text-sm text-foreground">{book.pic?.nama_lengkap || 'N/A'}</span>
                                    </div>

                                    {/* Tanggal - Hidden on mobile and small tablet */}
                                    <div className="hidden lg:col-span-2 lg:block">
                                        <span className="text-sm whitespace-nowrap text-muted-foreground">{formatDate(book.created_at)}</span>
                                    </div>

                                    {/* Status - Hidden on mobile, tampil di sm ke atas */}
                                    <div className="hidden sm:col-span-2 sm:flex sm:items-center sm:justify-center lg:col-span-2">
                                        <Badge variant={getStatusBadgeVariant(book.status_keseluruhan)} className="px-3 py-1 text-xs font-medium">
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
                                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                                            >
                                                <Link href={`/manajemen-naskah/${book.buku_id}?from=dashboard`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-secondary hover:bg-secondary/10"
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
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Building className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h4 className="mb-2 text-lg font-semibold text-foreground">Belum ada naskah</h4>
                        <p className="max-w-sm text-center text-sm text-muted-foreground">
                            Naskah terkini akan muncul di sini setelah Anda mulai membuat atau mengelola naskah.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
