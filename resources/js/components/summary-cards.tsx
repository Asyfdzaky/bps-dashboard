import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BadgeCheck, BookOpen, FileEdit, Loader2 } from 'lucide-react';

type SummaryItem = {
    key: 'total' | 'draft' | 'progres' | 'publish';
    label: string;
    value: number;
    sublabel?: string;
    delta?: number; // persen (+/-)
    icon: React.ElementType;
};

function formatNumber(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

export function SummaryStats({
    total,
    draft,
    progres,
    publish,
    // opsional: perubahan persentase
    delta = { total: 0, draft: 0, progres: 0, publish: 0 } as Record<string, number>,
}: {
    total: number;
    draft: number;
    progres: number;
    publish: number;
    delta?: Partial<Record<'total' | 'draft' | 'progres' | 'publish', number>>;
}) {
    const items: SummaryItem[] = [
        { key: 'total', label: 'Total Naskah', value: total, sublabel: 'semua entri', delta: delta.total, icon: BookOpen },
        { key: 'draft', label: 'Draft', value: draft, sublabel: 'belum diajukan', delta: delta.draft, icon: FileEdit },
        { key: 'progres', label: 'Dalam Proses', value: progres, sublabel: 'sedang dikerjakan', delta: delta.progres, icon: Loader2 },
        { key: 'publish', label: 'Sudah Dipublikasi', value: publish, sublabel: 'rilis', delta: delta.publish, icon: BadgeCheck },
    ];

    return (
        <Card className="rounded-2xl">
            <CardContent className="px-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((it) => {
                        const DeltaPill = () =>
                            typeof it.delta === 'number' ? (
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-[11px] font-medium',
                                        it.delta > 0 && 'bg-emerald-100 text-emerald-700',
                                        it.delta < 0 && 'bg-red-100 text-red-700',
                                        it.delta === 0 && 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {it.delta > 0 ? `+${it.delta}%` : `${it.delta}%`}
                                </span>
                            ) : null;

                        return (
                            <div
                                key={it.key}
                                className={cn(
                                    'relative flex items-center justify-between rounded-xl bg-card px-4',
                                    // pemisah vertikal di layout > sm (seperti screenshot)
                                    'lg:[&:not(:last-child)]:after:absolute lg:[&:not(:last-child)]:after:top-4 lg:[&:not(:last-child)]:after:right-0 lg:[&:not(:last-child)]:after:h-[calc(100%-2rem)] lg:[&:not(:last-child)]:after:w-px lg:[&:not(:last-child)]:after:bg-border',
                                )}
                            >
                                {/* left block */}
                                <div>
                                    <div className="text-sm text-muted-foreground">{it.label}</div>
                                    <div className="mt-1 text-2xl font-semibold tracking-tight">{formatNumber(it.value)}</div>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{it.sublabel}</span>
                                        <DeltaPill />
                                    </div>
                                </div>

                                {/* right icon */}
                                <div className="ml-4 shrink-0 rounded-xl border bg-secondary p-2">
                                    <it.icon className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
