import { DataTable } from '@/components/table-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Eye, FileText, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Manuscript {
    naskah_id: string;
    judul_naskah: string;
    genre: string;
    status: 'draft' | 'review' | 'cancelled' | 'approved';
    created_at: string;
    author: {
        user_id: string;
        nama_lengkap: string;
        email: string;
    };
    target_publishers: Array<{
        prioritas: number;
        publisher: {
            penerbit_id: string;
            nama_penerbit: string;
        };
    }>;
}

interface Stats {
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

interface Props {
    manuscripts: Manuscript[];
    stats: Stats;
    filters: {
        status: string;
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Naskah',
        href: '/manajemen-naskah',
    },
    {
        title: 'Approval Naskah',
        href: '/approval',
    },
];

function getStatusBadge(status: string) {
    switch (status) {
        case 'draft':
            return (
                <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                    Draft
                </Badge>
            );
        case 'pending':
            return (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">
                    Sedang Review
                </Badge>
            );
        case 'approved':
            return (
                <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800">
                    Disetujui
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800">
                    Ditolak
                </Badge>
            );
        case 'review':
            return (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">
                    Sedang Review
                </Badge>
            );
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

export default function ApprovalNaskah({ manuscripts, stats }: Props) {
    // State untuk filter status
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter data berdasarkan status dan search
    const filteredManuscripts = useMemo(() => {
        let filtered = manuscripts;

        // Filter berdasarkan status
        if (statusFilter !== 'all') {
            filtered = filtered.filter((manuscript) => manuscript.status === statusFilter);
        }

        // Filter berdasarkan search term (dari DataTable)
        if (searchTerm) {
            filtered = filtered.filter(
                (manuscript) =>
                    manuscript.judul_naskah.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    manuscript.author.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    manuscript.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    manuscript.target_publishers.some((target) => target.publisher.nama_penerbit.toLowerCase().includes(searchTerm.toLowerCase())),
            );
        }

        return filtered;
    }, [manuscripts, statusFilter, searchTerm]);

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };

    // Handle search dari DataTable
    const handleSearch = (searchValue: string) => {
        setSearchTerm(searchValue);
    };

    const columns: ColumnDef<Manuscript>[] = [
        {
            accessorKey: 'judul_naskah',
            header: 'Judul Naskah',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.getValue('judul_naskah')}</div>
                    <div className="text-sm text-gray-500">{row.original.genre}</div>
                </div>
            ),
        },
        {
            accessorKey: 'author.nama_lengkap',
            header: 'Penulis',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.author.nama_lengkap}</div>
                    <div className="text-sm text-gray-500">{row.original.author.email}</div>
                </div>
            ),
        },
        {
            accessorKey: 'target_publishers',
            header: 'Target Penerbit',
            cell: ({ row }) => {
                const targets = row.original.target_publishers;
                if (!targets || targets.length === 0) return '-';

                return (
                    <div className="space-y-1">
                        {targets.slice(0, 2).map((target) => (
                            <div key={target.prioritas} className="text-sm">
                                <span className="font-medium">{target.publisher.nama_penerbit}</span>
                                <Badge variant="outline" className="ml-1 text-xs">
                                    P{target.prioritas}
                                </Badge>
                            </div>
                        ))}
                        {targets.length > 2 && <div className="text-xs text-gray-500">+{targets.length - 2} lainnya</div>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => getStatusBadge(row.getValue('status')),
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Kirim',
            cell: ({ row }) => {
                const date = new Date(row.getValue('created_at'));
                return (
                    <div className="text-sm">
                        {date.toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`approval/${row.original.naskah_id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            Detail
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approval Naskah" />

            <div className="m-8 space-y-6">
                {/* Stats Cards - Tampilkan stats dari data yang difilter */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Draft</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.draft}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Sedang Review</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <div className="rounded-full bg-yellow-100 p-2">
                                    <Eye className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ditolak</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                                <div className="rounded-full bg-red-100 p-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Aktif</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.total}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Controls - Hanya Status Filter */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">Filter Status:</label>
                                <div className="w-48">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="review">Sedang Review</SelectItem>
                                            <SelectItem value="canceled">Ditolak</SelectItem>
                                            <SelectItem value="approved">Disetujui</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table - Search dari sini */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Naskah untuk Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={filteredManuscripts} searchableColumn="judul_naskah" onSearch={handleSearch} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
