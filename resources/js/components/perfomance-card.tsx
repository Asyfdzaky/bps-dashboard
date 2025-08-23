'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import * as React from 'react';

type StatsCardProps = {
    title: string;
    value: string | number;
    change?: string | number;
    period?: string;
    positive?: boolean;
    icon?: React.ReactNode;
    className?: string;
};

export function StatsCard({ title, value, change, period = '', positive = true, icon, className = '' }: StatsCardProps) {
    return (
        <Card className={`w-full ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>

            <CardContent>
                <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>

                <p className={`flex items-center text-xs ${positive ? 'text-green-500' : 'text-red-500'}`}>
                    {positive ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
                    <span className="font-medium">{change}</span>
                    {period ? <span className="ml-1 text-muted-foreground">{period}</span> : null}
                </p>
            </CardContent>
        </Card>
    );
}
