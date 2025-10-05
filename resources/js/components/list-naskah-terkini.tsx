import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { Building, Calendar, Edit3, Eye, MoreVertical } from 'lucide-react';
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
        <Card className="border-0 px-0 py-2">
            <CardContent className="">
                {recentBooks.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[35%] lg:w-[30%]">Judul</TableHead>
                                        <TableHead className="w-[20%]">Penerbit</TableHead>
                                        <TableHead className="hidden lg:table-cell lg:w-[20%]">PIC</TableHead>
                                        <TableHead className="hidden lg:table-cell lg:w-[15%]">Tanggal</TableHead>
                                        <TableHead className="w-[15%] text-center">Status</TableHead>
                                        <TableHead className="w-[10%] text-center lg:w-[5%]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBooks.map((book) => (
                                        <TableRow key={book.buku_id}>
                                            <TableCell className="font-medium">
                                                <div className="truncate">{book.judul_buku}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="truncate">{book.publisher?.nama_penerbit || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="truncate">{book.pic?.nama_lengkap || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell className="hidden text-muted-foreground lg:table-cell">
                                                {formatDate(book.created_at)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusBadgeVariant(book.status_keseluruhan)} className="text-xs">
                                                    {getStatusText(book.status_keseluruhan)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white">
                                                            <MoreVertical className="h-4 w-4 text-black" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/manajemen-naskah/${book.buku_id}?from=dashboard`}
                                                                className="cursor-pointer"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                <span>Lihat Detail</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manajemen-naskah/${book.buku_id}/edit`} className="cursor-pointer">
                                                                <Edit3 className="h-4 w-4" />
                                                                <span>Edit</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View - Minimalist */}
                        <div className="divide-y sm:hidden">
                            {recentBooks.map((book) => (
                                <div key={book.buku_id} className="py-2">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <h4 className="line-clamp-2 flex-1 text-sm font-medium text-foreground">{book.judul_buku}</h4>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 bg-white">
                                                    <MoreVertical className="h-4 w-4 text-black" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/manajemen-naskah/${book.buku_id}?from=dashboard`} className="cursor-pointer">
                                                        <Eye className="h-4 w-4" />
                                                        <span>Lihat Detail</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/manajemen-naskah/${book.buku_id}/edit`} className="cursor-pointer">
                                                        <Edit3 className="h-4 w-4" />
                                                        <span>Edit</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="space-y-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Building className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="truncate">{book.publisher?.nama_penerbit || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{formatDate(book.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <Badge variant={getStatusBadgeVariant(book.status_keseluruhan)} className="text-xs">
                                            {getStatusText(book.status_keseluruhan)}
                                        </Badge>
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
