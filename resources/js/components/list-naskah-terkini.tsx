import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { Building, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, User } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type Props = { books: Book[]; title?: string };

export default function ListNaskahTerkini({ books, title = 'Projects' }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const sortedBooks = [...books].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const recentBooks = sortedBooks.slice(startIndex, startIndex + itemsPerPage);

    const getStatusBadgeClass = (status: Book['status_keseluruhan']) => {
        const classes: Record<string, string> = {
            published: 'bg-green-50 text-green-700 border-green-200',
            draft: 'bg-gray-50 text-gray-700 border-gray-200',
            review: 'bg-blue-50 text-blue-700 border-blue-200',
            editing: 'bg-orange-50 text-orange-700 border-orange-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
        };
        return classes[status] ?? 'bg-gray-50 text-gray-700 border-gray-200';
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
        <Card className="border">
            {title && (
                <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-0">
                {recentBooks.length > 0 ? (
                    <>
                        {/* Book List */}
                        <div className="divide-y divide-gray-100">
                            {recentBooks.map((book) => (
                                <div key={book.buku_id} className="p-6 transition-colors hover:bg-gray-50/50">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                        {/* Main Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-3">
                                                {/* Book Title */}
                                                <h4 className="line-clamp-2 text-lg leading-tight font-semibold text-gray-900">{book.judul_buku}</h4>

                                                {/* Meta Information */}
                                                <div className="flex flex-col gap-4 text-sm text-gray-600 sm:flex-row">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                                                            <Building className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium">{book.publisher?.nama_penerbit || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-100 bg-purple-50">
                                                            <User className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <span>{book.pic?.nama_lengkap || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-100 bg-green-50">
                                                            <Calendar className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <span>{formatDate(book.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and Actions */}
                                        <div className="flex items-center justify-between gap-4 lg:justify-end">
                                            <Badge
                                                className={`${getStatusBadgeClass(book.status_keseluruhan)} rounded-full border px-3 py-1 font-medium`}
                                            >
                                                {getStatusText(book.status_keseluruhan)}
                                            </Badge>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44 border-gray-200">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/manajemen-naskah/${book.buku_id}?from=dashboard`} className="cursor-pointer">
                                                            Lihat Detail
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/manajemen-naskah/${book.buku_id}/edit`} className="cursor-pointer">
                                                            Edit Naskah
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                                <div className="text-sm font-medium text-gray-600">
                                    Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedBooks.length)} dari {sortedBooks.length}{' '}
                                    item
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        <span className="hidden sm:inline">Sebelumnya</span>
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

                                            const isActive = currentPage === pageNumber;

                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    className={`h-8 w-8 p-0 text-sm ${
                                                        isActive
                                                            ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <span className="hidden sm:inline">Selanjutnya</span>
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-12">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <Building className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="mb-2 text-lg font-semibold text-gray-900">Belum ada naskah</h4>
                        <p className="max-w-sm text-center text-sm text-gray-600">
                            Naskah terkini akan muncul di sini setelah Anda mulai membuat atau mengelola naskah.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
