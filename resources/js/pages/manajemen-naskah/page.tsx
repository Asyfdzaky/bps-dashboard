import ListNaskah from '@/components/list-naskah';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KPIGrid } from '@/components/ui/progress-summary';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { hasRole } from '@/types/access';
import { type Book } from '@/types/books';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Book as BookIcon, CheckCircle, Clock, FileText, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Naskah',
        href: '/manajemen-naskah',
    },
];

export default function ManajemenNaskah() {
    const { books } = usePage<{
        books: Book[];
    }>().props;
    const { auth } = usePage<{ auth: { user?: { roles?: string[] } } }>().props;
    const user = auth.user;
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDelete = (book: Book) => {
        setSelectedBook(book);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedBook) {
            router.delete(`/manajemen-naskah/${selectedBook.buku_id}`);
        }
        closeDeleteDialog();
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setSelectedBook(null);
    };

    const handleSearch = (q: string) => {
        router.get('/manajemen-naskah', { q });
    };

    // Calculate statistics
    const totalBooks = books.length;
    const draftBooks = books.filter((book) => book.status_keseluruhan === 'draft').length;
    const inProgressBooks = books.filter((book) => ['editing', 'review'].includes(book.status_keseluruhan)).length;
    const publishedBooks = books.filter((book) => book.status_keseluruhan === 'published').length;
    const isPenerbit = hasRole(user, 'penerbit');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Naskah" />
            <div className="w-full p-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Naskah</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola semua naskah buku dalam sistem</p>
                    </div>

                    {!isPenerbit && (
                        <Link href="/manajemen-naskah/create">
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Naskah
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="mb-6">
                    {/* KPI Cards */}
                    <KPIGrid
                        items={[
                            {
                                title: 'Total Naskah',
                                value: totalBooks,
                                icon: <BookIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
                                color: 'primary',
                                description: 'Total Naskah',
                            },
                            {
                                title: 'Draft',
                                value: draftBooks,
                                icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6" />,
                                color: 'accent',
                                description: 'Naskah dalam Status Draft',
                            },
                            {
                                title: 'Sedang Diproses',
                                value: inProgressBooks,
                                icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
                                color: 'destructive',
                                description: 'Naskah yang Sedang dalam Proses',
                            },
                            {
                                title: 'Terbit',
                                value: publishedBooks,
                                icon: <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
                                color: 'secondary',
                                description: 'Naskah yang Sudah Diterbitkan',
                            },
                        ]}
                    />
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Naskah</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ListNaskah books={books} onDelete={handleDelete} onSearch={handleSearch} />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus buku "{selectedBook?.judul_buku}"? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeDeleteDialog}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
