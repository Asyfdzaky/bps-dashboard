import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type Props = { books: Book[]; title?: string };

export default function ListNaskahTerkini({ books, title = 'Projects' }: Props) {
    const recentBooks = [...books].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    const statusPill = (status: Book['status_keseluruhan']) => {
        const map: Record<string, string> = {
            published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            draft: 'bg-neutral-100 text-neutral-700 border-neutral-200',
            review: 'bg-blue-100 text-blue-700 border-blue-200',
            editing: 'bg-amber-100 text-amber-700 border-amber-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        const text: Record<string, string> = {
            published: 'Published',
            draft: 'Draft',
            review: 'Review',
            editing: 'Editing',
            cancelled: 'Cancelled',
        };
        return (
            <span
                className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${map[status] ?? 'border-neutral-200 bg-neutral-100 text-neutral-700'}`}
            >
                {text[status] ?? 'Unknown'}
            </span>
        );
    };

    const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

    return (
        <Card className="bg-gray-50">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                {recentBooks.length > 0 ? (
                    <div className="overflow-x-auto bg-white">
                        <Table className="min-w-full table-fixed">
                            <TableHeader>
                                <TableRow className="bg-white">
                                    <TableHead className="py-3 text-sm font-medium text-gray-700">Judul Buku</TableHead>
                                    <TableHead className="w-[150px] py-3 text-sm font-medium text-gray-700">Penerbit</TableHead>
                                    <TableHead className="w-[150px] py-3 text-sm font-medium text-gray-700">PIC</TableHead>
                                    <TableHead className="w-[130px] py-3 text-sm font-medium text-gray-700">Created</TableHead>
                                    <TableHead className="w-[110px] py-3 text-sm font-medium text-gray-700">Status</TableHead>
                                    <TableHead className="w-[50px] py-3 text-sm font-medium text-gray-700"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBooks.map((b) => (
                                    <TableRow key={b.buku_id} className="border-lg bg-gray-100">
                                        <TableCell className="py-3">
                                            <div className="truncate font-medium text-gray-900" title={b.judul_buku}>
                                                {b.judul_buku}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="truncate font-medium text-gray-600">{b.publisher?.nama_penerbit || 'N/A'}</div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="text-gray-600">{b.pic?.nama_lengkap || 'N/A'}</div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="text-gray-600">{formatDate(b.created_at)}</div>
                                        </TableCell>
                                        <TableCell className="py-3 text-center">{statusPill(b.status_keseluruhan)}</TableCell>
                                        <TableCell className="py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/book/${b.buku_id}`}>Lihat detail</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/book/${b.buku_id}/edit`}>Edit</Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada naskah terkini</div>
                )}
            </CardContent>
        </Card>
    );
}
