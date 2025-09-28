import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Book } from '@/types/books';
import { Link } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { DataTable } from './table-data';
import { Checkbox } from './ui/checkbox';

interface ListBukuProps {
    books: Book[];
    title?: string;
    showFilters?: boolean;
    onEdit?: (book: Book) => void;
    onDelete?: (book: Book) => void;

    onSearch?: (q: string) => void;
}

export default function ListBuku({ books, onDelete, onSearch }: ListBukuProps) {
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
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
            ),
            enableSorting: false,
            enableHiding: false,
        },

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
                return (
                    <div className="flex justify-center">
                        <Badge variant={getStatusBadgeVariant(row.original.status_keseluruhan)}>
                            {getStatusText(row.original.status_keseluruhan)}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/manajemen-naskah/${row.original.buku_id}?from=naskah`}>
                                    <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/manajemen-naskah/${row.original.buku_id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete?.(row.original)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                    perPage: 5,
                    total: books.length,
                }}
                onSearch={onSearch}
            />
        </div>
    );
}
