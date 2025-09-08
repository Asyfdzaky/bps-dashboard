import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BadgeCheck, BookOpen, FileEdit, Loader2 } from 'lucide-react';

type SummaryItem = {
    key: 'total' | 'draft' | 'progres' | 'publish';
    label: string;
    value: number;
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
}: {
    total: number;
    draft: number;
    progres: number;
    publish: number;
    delta?: Partial<Record<'total' | 'draft' | 'progres' | 'publish', number>>;
}) {
    const items: SummaryItem[] = [
        { key: 'total', label: 'Total Naskah', value: total, icon: BookOpen },
        { key: 'draft', label: 'Draft', value: draft, icon: FileEdit },
        { key: 'progres', label: 'Dalam Proses', value: progres, icon: Loader2 },
        { key: 'publish', label: 'Sudah Dipublikasi', value: publish, icon: BadgeCheck },
    ];

    return (
        <Card className="rounded-2xl">
            <CardContent className="p-2 sm:p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((it) => {
                        return (
                            <div
                                key={it.key}
                                className={cn(
                                    'relative flex items-center justify-between rounded-xl bg-card p-4',
                                    // pemisah vertikal di layout > sm (seperti screenshot)
                                    'lg:[&:not(:last-child)]:after:absolute lg:[&:not(:last-child)]:after:top-4 lg:[&:not(:last-child)]:after:right-0 lg:[&:not(:last-child)]:after:h-[calc(100%-2rem)] lg:[&:not(:last-child)]:after:w-px lg:[&:not(:last-child)]:after:bg-border',
                                )}
                            >
                                {/* left block */}
                                <div>
                                    <div className="text-sm text-muted-foreground">{it.label}</div>
                                    <div className="mt-1 text-2xl font-semibold tracking-tight">{formatNumber(it.value)}</div>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"></div>
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
