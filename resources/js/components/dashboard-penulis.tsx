import { SummaryStats } from '@/components/summary-cards';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import clsx from 'clsx';
import { Check, CheckCircle2, Eye, FileText, XCircle } from 'lucide-react';
import * as React from 'react';
import { Badge } from './ui/badge';

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
    id: string | number;
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

    const openDialog = (a: ManuscriptActivity) => {
        setSelected(a);
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
        // optional: reset selected when closed
        // setSelected(null);
    };

    return (
        <div className="space-y-6 p-5">
            <SummaryStats total={total} draft={draft} progres={progres} publish={publish} delta={delta} />

            <Card className="rounded-2xl">
                <CardContent className="p-4 sm:p-6">
                    <h3 className="mb-4 text-base font-semibold tracking-tight">Aktivitas & Progres Naskah</h3>

                    {activities.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Belum ada aktivitas.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-1">
                            {activities.map((a) => {
                                return (
                                    <button key={a.id} type="button" onClick={() => openDialog(a)} className="text-left">
                                        <div className="rounded-xl border p-4 transition-colors hover:bg-muted/40">
                                            <div className="mb-2 font-medium">{a.title}</div>
                                            <div className="text-xs">
                                                <Badge variant="outline" className={statusBadgeClass(a.status)}>
                                                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                                                </Badge>
                                            </div>
                                            {a.updatedAt ? <div className="mt-2 text-xs text-muted-foreground">Diperbarui: {a.updatedAt}</div> : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
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

    return (
        <div className="mt-2">
            <div className="relative pl-12">
                {/* 1 konektor vertikal terhubung semua step (lebih tebal) */}
                <div className={clsx('absolute top-0 bottom-0 left-4 w-1.5', isCanceled ? 'bg-red-200' : 'bg-border')} />
                {/* garis progres sampai step aktif */}
                {!isCanceled && (
                    <div className="absolute top-0 left-4 w-1.5 bg-primary transition-[height] duration-300" style={{ height: `${progressPct}%` }} />
                )}

                <ol className="space-y-7" aria-label="Timeline status naskah">
                    {steps.map((s, idx) => {
                        const isCompleted = !!s.completed && !isCanceled;
                        const isCurrent = !!s.current && !isCanceled;
                        const isFuture = !isCompleted && !isCurrent && !isCanceled;
                        const Icon = iconByStep(s.name);

                        return (
                            <li key={`${s.name}-${idx}`} className="relative">
                                {/* Dot + icon (lebih besar) */}
                                <div
                                    className={clsx(
                                        'absolute top-0 left-4 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2',
                                        isCanceled && s.name.toLowerCase() === 'canceled' && 'border-red-600 bg-red-600 text-white',
                                        !isCanceled && isCompleted && 'border-green-600 bg-green-600 text-white',
                                        !isCanceled && isCurrent && 'border-primary bg-primary text-primary-foreground',
                                        !isCanceled && isFuture && 'border-border bg-background text-muted-foreground',
                                    )}
                                    aria-current={isCurrent ? 'step' : undefined}
                                >
                                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                </div>

                                {/* Label + sub-info (lebih besar) */}
                                <div
                                    className={clsx(
                                        'ml-8',
                                        isCanceled && s.name.toLowerCase() === 'canceled' && 'text-red-700',
                                        !isCanceled && (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground',
                                    )}
                                >
                                    <div className="text-base leading-snug font-medium">{s.name}</div>

                                    {isCompleted && <div className="text-sm font-medium text-green-700">Sudah selesai</div>}
                                    {!isCanceled && isCurrent && !isCompleted && <div className="text-sm font-medium text-blue-700">On Progress</div>}
                                    {!isCanceled && !isCurrent && !isCompleted && s.name.toLowerCase() === 'review' && (
                                        <div className="text-sm font-medium text-blue-700">On Progress</div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
            {updatedAt ? <div className="mt-4 text-sm text-muted-foreground">Diperbarui: {updatedAt}</div> : null}
        </div>
    );
}
