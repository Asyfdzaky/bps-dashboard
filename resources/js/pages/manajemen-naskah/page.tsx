import ListNaskah from '@/components/list-naskah';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Book } from '@/types/books';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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

    // Calculate statistics
    const totalBooks = books.length;
    const draftBooks = books.filter((book) => book.status_keseluruhan === 'draft').length;
    const inProgressBooks = books.filter((book) => ['editing', 'review'].includes(book.status_keseluruhan)).length;
    const publishedBooks = books.filter((book) => book.status_keseluruhan === 'published').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Naskah" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Naskah</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola semua naskah buku dalam sistem</p>
                    </div>
                    <Link href="/manajemen-naskah/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah Naskah
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Naskah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalBooks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{draftBooks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inProgressBooks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dipublikasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{publishedBooks}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Naskah</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ListNaskah books={books} onDelete={handleDelete} />
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
