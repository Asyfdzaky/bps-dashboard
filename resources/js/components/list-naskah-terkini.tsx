import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type Props = { books: Book[]; title?: string };

export default function ListNaskahTerkini({ books, title = 'Projects' }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    const sortedBooks = [...books].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const recentBooks = sortedBooks.slice(startIndex, startIndex + itemsPerPage);

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
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-lg">
                            <Table className="w-full table-fixed">
                                <TableHeader>
                                    <TableRow className="bg-white">
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 w-[35%]">Judul Buku</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 w-[18%]">Penerbit</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 w-[15%]">PIC</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 w-[15%]">Created</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 w-[12%]">Status</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBooks.map((b) => (
                                        <TableRow key={b.buku_id} className="border-lg bg-gray-100">
                                            <TableCell className="py-2.5">
                                                <div className="text-xs font-medium text-gray-900 truncate" title={b.judul_buku}>
                                                    {b.judul_buku}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                                <div className="text-xs font-medium text-gray-600 truncate" title={b.publisher?.nama_penerbit || 'N/A'}>
                                                    {b.publisher?.nama_penerbit || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                                <div className="text-xs text-gray-600 truncate" title={b.pic?.nama_lengkap || 'N/A'}>
                                                    {b.pic?.nama_lengkap || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                                <div className="text-xs text-gray-600">{formatDate(b.created_at)}</div>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-center">{statusPill(b.status_keseluruhan)}</TableCell>
                                            <TableCell className="py-2.5">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
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

                        {/* Mobile Table View with Horizontal Scroll */}
                        <div className="md:hidden overflow-x-auto bg-white rounded-lg">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow className="bg-white">
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 min-w-[180px]">Judul Buku</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 min-w-[120px] whitespace-nowrap">Penerbit</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 min-w-[120px] whitespace-nowrap">PIC</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 min-w-[100px] whitespace-nowrap">Created</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 min-w-[100px] whitespace-nowrap">Status</TableHead>
                                        <TableHead className="py-2.5 text-xs font-medium text-gray-700 min-w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBooks.map((b) => (
                                        <TableRow key={b.buku_id} className="border-lg bg-gray-100">
                                            <TableCell className="py-2.5 min-w-[180px]">
                                                <div className="text-xs font-medium text-gray-900 leading-tight" title={b.judul_buku}>
                                                    {b.judul_buku}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5 whitespace-nowrap min-w-[120px]">
                                                <div className="text-xs font-medium text-gray-600">{b.publisher?.nama_penerbit || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell className="py-2.5 whitespace-nowrap min-w-[120px]">
                                                <div className="text-xs text-gray-600">{b.pic?.nama_lengkap || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell className="py-2.5 whitespace-nowrap min-w-[100px]">
                                                <div className="text-xs text-gray-600">{formatDate(b.created_at)}</div>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-center whitespace-nowrap min-w-[100px]">{statusPill(b.status_keseluruhan)}</TableCell>
                                            <TableCell className="py-2.5 min-w-[50px]">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
                                <div className="text-xs text-gray-500">
                                    Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedBooks.length)} dari {sortedBooks.length} item
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 px-3 text-xs"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                                        Previous
                                    </Button>
                                    
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let pageNumber;
                                            if (totalPages <= 5) {
                                                pageNumber = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNumber = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNumber = totalPages - 4 + i;
                                            } else {
                                                pageNumber = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    className="h-8 w-8 text-xs p-0"
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 px-3 text-xs"
                                    >
                                        Next
                                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                
                ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada naskah terkini</div>
                )}
            </CardContent>
        </Card>
    );
}
