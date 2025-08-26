import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book } from '@/types/books';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { DataTable } from './table-data';

interface ListBukuProps {
    books: Book[];
    title?: string;
    showFilters?: boolean;
}

export default function ListBuku({ books }: ListBukuProps) {
    const getStatusColor = (status: Book['status_keseluruhan']) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'draft':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'review':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'editing':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status: Book['status_keseluruhan']) => {
        switch (status) {
            case 'published':
                return 'Dipublikasi';
            case 'draft':
                return 'Draft';
            case 'review':
                return 'Dalam Review';
            case 'editing':
                return 'Sedang Edit';
            case 'cancelled':
                return 'Dibatalkan';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };
    const columns: ColumnDef<Book>[] = [
        {
            accessorKey: 'judul_buku',
            header: 'Judul Buku',
            cell: ({ row }) => {
                return <div>{row.original.judul_buku}</div>;
            },
        },

        {
            accessorKey: 'penulis',
            header: 'Penulis',
            cell: ({ row }) => {
                return <div>{row.original.manuscript?.author?.nama_lengkap}</div>;
            },
        },
        {
            accessorKey: 'pic',
            header: 'PIC',
            cell: ({ row }) => {
                return <div>{row.original.pic?.nama_lengkap}</div>;
            },
        },
        {
            accessorKey: 'penerbit',
            header: 'Penerbit',
            cell: ({ row }) => {
                return <div>{row.original.publisher?.nama_penerbit}</div>;
            },
        },
        {
            accessorKey: 'tanggal_target_naik_cetak',
            header: 'Target Cetak',
            cell: ({ row }) => {
                return <div>{row.original.tanggal_target_naik_cetak ? formatDate(row.original.tanggal_target_naik_cetak) : 'N/A'}</div>;
            },
        },
        {
            accessorKey: 'status_keseluruhan',
            header: 'Status',
            cell: ({ row }) => {
                return <Badge className={getStatusColor(row.original.status_keseluruhan)}>{getStatusText(row.original.status_keseluruhan)}</Badge>;
            },
        },
        {
            accessorKey: 'actions',
            header: 'Aksi',
            cell: () => {
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="w-full">
            <DataTable
                columns={columns}
                data={books}
                searchableColumn="judul_buku"
                pagination={{
                    page: 1,
                    perPage: 10,
                    total: books.length,
                }}
                // onSearch={onSearch}
                // onSort={onSort}
                // onPageChange={onPageChange}
            />
        </div>
    );
}
