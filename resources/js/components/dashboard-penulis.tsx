import { SummaryStats } from '@/components/summary-cards';
import { DataTable } from '@/components/table-data';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

type SummaryDelta = Partial<Record<'total' | 'draft' | 'progres' | 'publish', number>>;

type ManuscriptStatus = 'draft' | 'review' | 'approved' | 'canceled';

function statusBadgeClass(status: ManuscriptStatus) {
    switch (status) {
        case 'approved':
            return 'border-green-200 bg-green-100 text-green-800';
        case 'review':
            return 'border-blue-200 bg-blue-100 text-blue-800';
        case 'draft':
            return 'border-gray-200 bg-gray-100 text-gray-800';
        case 'canceled':
            return 'border-red-200 bg-red-100 text-red-800';
        default:
            return 'border-muted bg-muted text-foreground';
    }
}

type ManuscriptActivity = {
    naskah_id?: string | number; // Make id optional to avoid conflict with Manuscript type
    title: string;
    status: ManuscriptStatus; // 'draft' | 'review' | 'approved' | 'canceled'
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
    // Add useEffect to filter activities when search query or activities change
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
            header: 'Judul Naskah',
            cell: ({ row }) => <div className="flex items-center p-1 font-medium">{row.getValue('title')}</div>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as ManuscriptStatus;
                return (
                    <div className="flex items-center">
                        <Badge variant="outline" className={statusBadgeClass(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'updatedAt',
            header: 'Terakhir Diperbarui',
            cell: ({ row }) => {
                const updatedAt = row.getValue('updatedAt') as string;
                return (
                    <div className="flex items-center">
                        {updatedAt ? (
                            <div className="text-sm text-muted-foreground">{updatedAt}</div>
                        ) : (
                            <div className="text-sm text-muted-foreground">-</div>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const manuscript = row.original;
                return (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/kirim-naskah/${manuscript.naskah_id}`}>Lihat Detail</Link>
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="space-y-6 p-5">
            <SummaryStats total={total} draft={draft} progres={progres} publish={publish} delta={delta} />

            <Card className="rounded-2xl">
                <CardContent className="p-4 sm:p-6">
                    <h3 className="mb-4 text-base font-semibold tracking-tight">Aktivitas & Progres Naskah</h3>

                    {activities.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Belum ada aktivitas.</div>
                    ) : (
                        <DataTable columns={columns} data={filteredActivities} searchableColumn="judul naskah" onSearch={handleSearch} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
