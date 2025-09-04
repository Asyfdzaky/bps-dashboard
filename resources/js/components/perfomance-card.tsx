'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: number;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
    iconClassName?: string;
}

export function StatsCard({ title, value, description, icon, className, iconClassName }: StatsCardProps) {
    return (
        <Card className={cn('h-full bg-white', className)}>
            <CardContent className="h-full w-full">
                <div className="flex h-full flex-col justify-between">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-3xl font-bold text-gray-900">{value}</span>
                        {icon && <div className={cn('flex items-center justify-center rounded-full', iconClassName)}>{icon}</div>}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{title}</p>
                        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
