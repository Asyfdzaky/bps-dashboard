import { DataTable } from '@/components/table-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Eye, Filter, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Manuscript {
    naskah_id: string;
    judul_naskah: string;
    genre: string;
    status: 'draft' | 'review' | 'approved' | 'canceled';
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
        href: '/manajemen-naskah/approval',
    },
];

function getStatusBadge(status: string) {
    switch (status) {
        case 'review':
            return (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">
                    Menunggu Review
                </Badge>
            );
        case 'approved':
            return (
                <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800">
                    Disetujui
                </Badge>
            );
        case 'canceled':
            return (
                <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800">
                    Ditolak
                </Badge>
            );
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

export default function ApprovalNaskah({ manuscripts, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    const handleFilter = () => {
        router.get(
            '/manajemen-naskah/approval',
            {
                search,
                status,
            },
            {
                preserveState: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('review');
        router.get('/manajemen-naskah/approval');
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
                        <Link href={`/manajemen-naskah/approval/${row.original.naskah_id}`}>
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
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Menunggu Review</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <div className="rounded-full bg-yellow-100 p-2">
                                    <Filter className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Disetujui</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
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
                                    <p className="text-sm font-medium text-gray-600">Total Naskah</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-2">
                                    <Eye className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <Input
                                    placeholder="Cari berdasarkan judul atau penulis..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="review">Menunggu Review</SelectItem>
                                        <SelectItem value="approved">Disetujui</SelectItem>
                                        <SelectItem value="canceled">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Naskah untuk Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={manuscripts} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
