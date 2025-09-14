import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Calendar, User, Building } from 'lucide-react';
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

    const getStatusVariant = (status: Book['status_keseluruhan']) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            published: 'default',
            draft: 'secondary',
            review: 'outline',
            editing: 'secondary',
            cancelled: 'destructive',
        };
        return variants[status] ?? 'outline';
    };

    const getStatusText = (status: Book['status_keseluruhan']) => {
        const text: Record<string, string> = {
            published: 'Published',
            draft: 'Draft',
            review: 'Review',
            editing: 'Editing',
            cancelled: 'Cancelled',
        };
        return text[status] ?? 'Unknown';
    };

    const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

    return (
        <Card className="border border-border/50 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            {title && (
                <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className={title ? "p-0" : "p-0"}>
                {recentBooks.length > 0 ? (
                    <>
                        {/* Card Grid Layout - Responsive */}
                        <div className="grid gap-4 p-6 pt-4">
                            {recentBooks.map((book) => (
                                <Card key={book.buku_id} className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-border/30 bg-gradient-to-r from-background to-background/95 hover:from-background hover:to-primary/5">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                            {/* Main Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col gap-2">
                                                    {/* Book Title */}
                                                    <h4 className="font-semibold text-base lg:text-lg text-primary group-hover:text-primary/90 line-clamp-2 leading-tight transition-colors">
                                                        {book.judul_buku}
                                                    </h4>
                                                    
                                                    {/* Meta Information */}
                                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-full bg-secondary/20">
                                                                <Building className="h-3.5 w-3.5 text-secondary-foreground" />
                                                            </div>
                                                            <span className="truncate font-medium">{book.publisher?.nama_penerbit || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-full bg-chart-2/20">
                                                                <User className="h-3.5 w-3.5 text-chart-2" />
                                                            </div>
                                                            <span className="truncate">{book.pic?.nama_lengkap || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-full bg-chart-3/20">
                                                                <Calendar className="h-3.5 w-3.5 text-chart-3" />
                                                            </div>
                                                            <span>{formatDate(book.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Status and Actions */}
                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <Badge 
                                                    variant={getStatusVariant(book.status_keseluruhan)} 
                                                    className="text-sm px-3 py-1 font-medium"
                                                >
                                                    {getStatusText(book.status_keseluruhan)}
                                                </Badge>
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 opacity-60 group-hover:opacity-100 hover:bg-primary/10 transition-all duration-200"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4 text-primary" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 shadow-lg border-border/50">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manajemen-naskah/${book.buku_id}?from=dashboard`} className="cursor-pointer">
                                                                Lihat detail
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manajemen-naskah/${book.buku_id}/edit`} className="cursor-pointer">
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-muted/30 to-muted/50 border-t border-border/30">
                                <div className="text-sm text-muted-foreground font-medium">
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
                                        <span className="hidden sm:inline">Previous</span>
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
                                        <span className="hidden sm:inline">Next</span>
                                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                
                ) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Tidak ada naskah terkini
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
