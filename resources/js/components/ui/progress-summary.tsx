import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProgressSummaryItem {
    name: string;
    count: number;
    percentage?: number;
}

interface ProgressSummaryProps {
    title?: string;
    description?: string;
    items: ProgressSummaryItem[];
    total?: number;
    maxItems?: number;
    showPercentage?: boolean;
    className?: string;
}

export function ProgressSummary({
    title = "Ringkasan Per Tahapan",
    description = "Jumlah naskah di setiap tahapan penerbitan",
    items,
    total,
    maxItems = 6,
    showPercentage = true,
    className,
}: ProgressSummaryProps) {
    // Hitung total jika tidak disediakan
    const calculatedTotal = total ?? items.reduce((sum, item) => sum + item.count, 0);
    
    // Ambil items sesuai maxItems
    const displayItems = items.slice(0, maxItems);
    const remainingCount = items.length - maxItems;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayItems.map((item, index) => {
                        const percentage = showPercentage && calculatedTotal > 0 
                            ? (item.count / calculatedTotal) * 100 
                            : item.percentage ?? 0;
                            
                        return (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex flex-1 items-center gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-muted rounded-full h-2">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {item.count}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {remainingCount > 0 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                            +{remainingCount} tahapan lainnya
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Komponen untuk KPI Cards yang juga reusable
interface KPICardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: "primary" | "chart-2" | "chart-3" | "destructive";
    className?: string;
}

export function KPICard({ 
    title, 
    value, 
    icon, 
    color = "primary",
    className 
}: KPICardProps) {
    const colorClasses = {
        primary: "text-primary bg-primary/10",
        "chart-2": "text-chart-2 bg-chart-2/10",
        "chart-3": "text-chart-3 bg-chart-3/10",
        destructive: "text-destructive bg-destructive/10",
    };

    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
                        <h3 className={cn("text-xl sm:text-2xl lg:text-3xl font-bold", {
                            "text-primary": color === "primary",
                            "text-chart-2": color === "chart-2", 
                            "text-chart-3": color === "chart-3",
                            "text-destructive": color === "destructive",
                        })}>
                            {value}
                        </h3>
                    </div>
                    <div className={cn("flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full flex-shrink-0", colorClasses[color])}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Komponen untuk KPI Grid
interface KPIGridProps {
    items: Array<{
        title: string;
        value: number;
        icon: React.ReactNode;
        color?: "primary" | "chart-2" | "chart-3" | "destructive";
    }>;
    className?: string;
}

export function KPIGrid({ items, className }: KPIGridProps) {
    return (
        <div className={cn("grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4", className)}>
            {items.map((item, index) => (
                <KPICard
                    key={index}
                    title={item.title}
                    value={item.value}
                    icon={item.icon}
                    color={item.color}
                />
            ))}
        </div>
    );
}
