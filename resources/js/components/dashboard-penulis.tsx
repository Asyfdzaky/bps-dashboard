import { SummaryStats } from '@/components/summary-cards';
import { DataTable } from '@/components/table-data';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { Check, CheckCircle2, Eye, FileText, XCircle } from 'lucide-react';
import * as React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

type SummaryDelta = Partial<Record<'total' | 'draft' | 'progres' | 'publish', number>>;

type ManuscriptStatus = 'draft' | 'review' | 'approved' | 'canceled';

function buildStatusSteps(status: ManuscriptStatus) {
    const base = [
        { name: 'Draft', key: 'draft' as const },
        { name: 'Review', key: 'review' as const },
        { name: 'Approved', key: 'approved' as const },
    ];
    // Tentukan index current berdasar status
    const order = ['draft', 'review', 'approved'] as const;
    const isCanceled = status === 'canceled';
    const currentIndex = isCanceled ? -1 : order.indexOf(status as (typeof order)[number]);

    const steps = isCanceled
        ? [
              ...base.map((s) => ({
                  name: s.name,
                  completed: false,
                  current: false,
              })),
              { name: 'Canceled', completed: true, current: true },
          ]
        : base.map((s, idx) => ({
              name: s.name,
              completed: idx < currentIndex,
              current: idx === currentIndex,
          }));

    return { steps, currentIndex: isCanceled ? base.length : currentIndex };
}

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
    id?: string | number; // Make id optional to avoid conflict with Manuscript type
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
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<ManuscriptActivity | null>(null);
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

    const openDialog = (a: ManuscriptActivity) => {
        setSelected(a);
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
        setSelected(null);
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
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDialog(manuscript)}>
                            Status
                        </Button>

                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/kirim-naskah/${manuscript.id}`}>Lihat Detail</Link>
                        </Button>
                    </div>
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

            <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeDialog())}>
                <DialogContent className="lg:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selected?.title ?? 'Detail Naskah'}</DialogTitle>
                        {selected?.status ? (
                            <DialogDescription>
                                Status saat ini: {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                            </DialogDescription>
                        ) : null}
                    </DialogHeader>

                    {/* Timeline vertikal single-line dengan dots */}
                    {selected ? <VerticalStatusTimeline status={selected.status} updatedAt={selected.updatedAt} /> : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function VerticalStatusTimeline({ status, updatedAt }: { status: ManuscriptStatus; updatedAt?: string }) {
    const { steps } = buildStatusSteps(status);
    const isCanceled = status === 'canceled';

    // posisi progres sampai step aktif
    const currentIndex = Math.max(
        steps.findIndex((s) => s.current),
        steps.map((s, i) => (s.completed ? i : -1)).reduce((a, b) => Math.max(a, b), -1),
    );
    const progressPct = currentIndex <= 0 ? 0 : (currentIndex / Math.max(steps.length - 1, 1)) * 100;

    const iconByStep = (name: string) => {
        const key = name.toLowerCase();
        if (key === 'draft') return FileText;
        if (key === 'review') return Eye;
        if (key === 'approved') return CheckCircle2;
        if (key === 'canceled') return XCircle;
        return FileText;
    };

    const getStatusText = (step: any, idx: number) => {
        if (isCanceled && step.name.toLowerCase() === 'canceled') {
            return 'Dibatalkan';
        }
        if (step.completed) {
            return 'Selesai';
        }
        if (step.current) {
            return 'Sedang berlangsung';
        }
        return 'Menunggu';
    };

    const getStatusDescription = (step: any) => {
        const key = step.name.toLowerCase();
        if (key === 'draft') return 'Naskah sedang ditulis dan disiapkan';
        if (key === 'review') return 'Naskah sedang ditinjau oleh editor';
        if (key === 'approved') return 'Naskah telah disetujui untuk publikasi';
        if (key === 'canceled') return 'Proses dihentikan';
        return '';
    };

    return (
        <div className="mt-4">
            <div className="relative">
                {/* Single continuous line */}
                <div className="absolute top-4 bottom-4 left-4 w-0.5 -translate-x-1/2 bg-gray-300" />

                {/* Progress overlay line */}
                <div
                    className={clsx(
                        'absolute top-4 left-4 w-0.5 -translate-x-1/2 transition-all duration-500',
                        isCanceled ? 'bg-red-400' : 'bg-blue-400',
                    )}
                    style={{
                        height: `${Math.min(progressPct, 100)}%`,
                    }}
                />

                <ol className="space-y-6" aria-label="Timeline status naskah">
                    {steps.map((step, idx) => {
                        const isCompleted = !!step.completed && !isCanceled;
                        const isCurrent = !!step.current && !isCanceled;
                        const isFuture = !isCompleted && !isCurrent && !isCanceled;
                        const isCanceledStep = isCanceled && step.name.toLowerCase() === 'canceled';
                        const Icon = iconByStep(step.name);

                        return (
                            <li key={`${step.name}-${idx}`} className="relative flex items-start space-x-4">
                                {/* Icon circle */}
                                <div
                                    className={clsx(
                                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2',
                                        isCanceledStep && 'border-red-500 bg-red-500 text-white',
                                        !isCanceled && isCompleted && 'border-green-500 bg-green-500 text-white',
                                        !isCanceled && isCurrent && 'border-blue-500 bg-blue-500 text-white',
                                        !isCanceled && isFuture && 'border-gray-300 bg-white text-gray-400',
                                    )}
                                    aria-current={isCurrent ? 'step' : undefined}
                                >
                                    {isCompleted && !isCanceledStep ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1 pb-6">
                                    <div className="flex items-center justify-between">
                                        <h4
                                            className={clsx(
                                                'text-lg font-semibold',
                                                isCanceledStep && 'text-red-700',
                                                !isCanceled && (isCompleted || isCurrent) ? 'text-gray-900' : 'text-gray-500',
                                            )}
                                        >
                                            {step.name}
                                        </h4>
                                        <span
                                            className={clsx(
                                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                isCanceledStep && 'bg-red-100 text-red-800',
                                                !isCanceled && isCompleted && 'bg-green-100 text-green-800',
                                                !isCanceled && isCurrent && 'bg-blue-100 text-blue-800',
                                                !isCanceled && isFuture && 'bg-gray-100 text-gray-600',
                                            )}
                                        >
                                            {getStatusText(step, idx)}
                                        </span>
                                    </div>

                                    <p
                                        className={clsx(
                                            'mt-1 text-sm',
                                            isCanceledStep && 'text-red-600',
                                            !isCanceled && (isCompleted || isCurrent) ? 'text-gray-600' : 'text-gray-400',
                                        )}
                                    >
                                        {getStatusDescription(step)}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {updatedAt && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Terakhir diperbarui: {updatedAt}
                    </div>
                </div>
            )}
        </div>
    );
}
