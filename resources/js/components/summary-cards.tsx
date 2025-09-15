import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BadgeCheck, BookOpen, FileEdit, Loader2 } from 'lucide-react';

type SummaryItem = {
    key: 'total' | 'draft' | 'progres' | 'publish';
    label: string;
    value: number;
    icon: React.ElementType;
    colorClass: string;
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
        {
            key: 'total',
            label: 'Total Naskah',
            value: total,
            icon: BookOpen,
            colorClass: 'text-primary bg-primary/10 border-primary/20', // Using primary color (Space Cadet)
        },
        {
            key: 'draft',
            label: 'Draft',
            value: draft,
            icon: FileEdit,
            colorClass: 'text-muted-foreground bg-muted border-muted-foreground/20', // Using muted colors
        },
        {
            key: 'progres',
            label: 'Dalam Proses',
            value: progres,
            icon: Loader2,
            colorClass: 'text-secondary bg-secondary/10 border-secondary/30 dark:text-secondary dark:bg-secondary/20', // Using secondary color (Golden Yellow)
        },
        {
            key: 'publish',
            label: 'Sudah Dipublikasi',
            value: publish,
            icon: BadgeCheck,
            colorClass: 'text-chart-1 bg-chart-1/10 border-chart-1/20', // Using chart-1 color for success/completion
        },
    ];

    return (
        <Card className="bg-secondary">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item, index) => {
                        return (
                            <div
                                key={item.key}
                                className={cn(
                                    'relative flex items-center gap-4 rounded-lg border bg-card p-4',
                                    // Add subtle divider for larger screens using border color
                                    index < items.length - 1 &&
                                        'lg:after:absolute lg:after:top-1/2 lg:after:-right-3 lg:after:h-8 lg:after:w-px lg:after:-translate-y-1/2 lg:after:bg-border',
                                )}
                            >
                                {/* Icon container */}
                                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg border', item.colorClass)}>
                                    <item.icon className="h-6 w-6" />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <p className="mb-1 text-sm font-medium text-muted-foreground">{item.label}</p>
                                    <p className="text-2xl leading-tight font-bold text-foreground">{formatNumber(item.value)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
