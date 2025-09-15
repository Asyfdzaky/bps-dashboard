import { SummaryStats } from '@/components/summary-cards';
import { DataTable } from '@/components/table-data';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import * as React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

type SummaryDelta = Partial<Record<'total' | 'draft' | 'progres' | 'publish', number>>;

type ManuscriptStatus = 'draft' | 'review' | 'approved' | 'canceled';

function statusBadgeClass(status: ManuscriptStatus) {
    switch (status) {
        case 'approved':
            return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
        case 'review':
            return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        case 'draft':
            return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
        case 'canceled':
            return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
}

function getStatusLabel(status: ManuscriptStatus) {
    switch (status) {
        case 'approved':
            return 'Disetujui';
        case 'review':
            return 'Dalam Review';
        case 'draft':
            return 'Draft';
        case 'canceled':
            return 'Dibatalkan';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

type ManuscriptActivity = {
    naskah_id?: string | number;
    title: string;
    status: ManuscriptStatus;
    updatedAt?: string;
};

export default function DashboardPenulis({
    total = 0,
    draft = 0,
    progres = 0,
    publish = 0,
    delta,
    activities = [],
}: {
    total: number;
    draft: number;
    progres: number;
    publish: number;
    delta?: SummaryDelta;
    activities?: ManuscriptActivity[];
}) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filteredActivities, setFilteredActivities] = React.useState<ManuscriptActivity[]>(activities);

    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredActivities(activities);
        } else {
            const filtered = activities.filter((activity) => activity.title.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilteredActivities(filtered);
        }
    }, [searchQuery, activities]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    // Define columns for the data table
    const columns: ColumnDef<ManuscriptActivity>[] = [
        {
            accessorKey: 'title',
            header: ({ column }) => <div className="text-left font-semibold text-gray-700">Judul Naskah</div>,
            cell: ({ row }) => (
                <div className="max-w-[300px]">
                    <p className="truncate font-medium text-gray-900" title={row.getValue('title')}>
                        {row.getValue('title')}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <div className="text-center font-semibold text-gray-700">Status</div>,
            cell: ({ row }) => {
                const status = row.getValue('status') as ManuscriptStatus;
                return (
                    <div className="flex justify-center">
                        <Badge variant="outline" className={`${statusBadgeClass(status)} rounded-full border px-3 py-1 text-xs font-medium`}>
                            {getStatusLabel(status)}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'updatedAt',
            header: ({ column }) => <div className="text-center font-semibold text-gray-700">Terakhir Diperbarui</div>,
            cell: ({ row }) => {
                const updatedAt = row.getValue('updatedAt') as string;
                return (
                    <div className="text-center">
                        {updatedAt ? <span className="text-sm text-gray-600">{updatedAt}</span> : <span className="text-sm text-gray-400">-</span>}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: ({ column }) => <div className="text-center font-semibold text-gray-700">Aksi</div>,
            cell: ({ row }) => {
                const manuscript = row.original;
                return (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 border-gray-200 bg-white px-3 text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                        >
                            <Link href={`/kirim-naskah/${manuscript.naskah_id}`} className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span className="text-xs font-medium">Detail</span>
                            </Link>
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="w-full space-y-8 px-4 py-6">
            <SummaryStats total={total} draft={draft} progres={progres} publish={publish} delta={delta} />

            <Card>
                <CardContent className="p-6">
                    <div className="mb-6">
                        <h3 className="mb-1 text-xl font-bold text-gray-900">Aktivitas & Progres Naskah</h3>
                        <p className="text-sm text-gray-600">Kelola dan pantau status naskah Anda</p>
                    </div>

                    {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-12">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Eye className="h-8 w-8 text-gray-400" />
                            </div>
                            <h4 className="mb-2 text-lg font-semibold text-gray-900">Belum ada aktivitas</h4>
                            <p className="max-w-sm text-center text-sm text-gray-600">
                                Aktivitas naskah Anda akan muncul di sini setelah Anda mulai mengirim atau mengedit naskah.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50/50">
                            <DataTable columns={columns} data={filteredActivities} searchableColumn="judul naskah" onSearch={handleSearch} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
