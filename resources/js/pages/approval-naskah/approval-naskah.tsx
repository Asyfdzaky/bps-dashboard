import { ApprovalDataTable } from '@/components/approval-data-table';
import { KPIGrid } from '@/components/ui/progress-summary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Eye, FileText, XCircle, Clock } from 'lucide-react';
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
        title: 'Approval Naskah',
        href: '/approval-naskah',
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
                {/* KPI Cards */}
                <KPIGrid
                    items={[
                        {
                            title: "Draft",
                            value: stats.draft,
                            icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6" />,
                            color: "chart-2",
                        },
                        {
                            title: "Sedang Review",
                            value: stats.pending,
                            icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
                            color: "chart-3",
                        },
                        {
                            title: "Ditolak",
                            value: stats.rejected,
                            icon: <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
                            color: "destructive",
                        },
                        {
                            title: "Total Aktif",
                            value: stats.total,
                            icon: <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
                            color: "primary",
                        },
                    ]}
                />

                {/* Data Table dengan Filter Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Naskah untuk Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ApprovalDataTable 
                            columns={columns} 
                            data={filteredManuscripts} 
                            searchableColumn="judul_naskah" 
                            onSearch={handleSearch}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            onResetFilters={handleReset}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
