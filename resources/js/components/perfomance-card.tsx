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
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function StatsCard({ title, value, description, icon, className, iconClassName, trend }: StatsCardProps) {
    return (
        <Card className={cn('h-full bg-white', className)}>
            <CardContent className="p-6">
                <div className="flex h-full flex-col justify-between">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-3xl font-bold text-gray-900">{value}</span>
                        {icon && <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', iconClassName)}>{icon}</div>}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{title}</p>
                        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
                        {trend && (
                            <div className="mt-2 flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-sm text-green-700">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span>{trend.value}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
