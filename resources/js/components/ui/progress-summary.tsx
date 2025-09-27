import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    
    // Hitung total jika tidak disediakan
    const calculatedTotal = total ?? items.reduce((sum, item) => sum + item.count, 0);
    
    // Ambil items sesuai maxItems
    const displayItems = items.slice(0, maxItems);
    const remainingCount = items.length - maxItems;

    // Komponen untuk menampilkan progress item
    const ProgressItem = ({ item, index }: { item: ProgressSummaryItem; index: number }) => {
        const percentage = showPercentage && calculatedTotal > 0 
            ? (item.count / calculatedTotal) * 100 
            : item.percentage ?? 0;
            
        return (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium break-words">{item.name}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 sm:w-24 bg-muted rounded-full h-2">
                        <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                        {item.count}
                    </Badge>
                </div>
            </div>
        );
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayItems.map((item, index) => (
                        <ProgressItem key={index} item={item} index={index} />
                    ))}
                    {remainingCount > 0 && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <button 
                                    className="text-sm text-muted-foreground text-center pt-2 w-full hover:text-primary cursor-pointer transition-colors"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    +{remainingCount} tahapan lainnya
                                </button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{title} - Lengkap</DialogTitle>
                                    <DialogDescription>{description}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 mt-4">
                                    {items.map((item, index) => (
                                        <ProgressItem key={index} item={item} index={index} />
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
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
    color?: "primary" | "secondary" | "accent" | "destructive";
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
        secondary: "text-secondary bg-secondary/10",
        accent: "text-accent bg-accent/10",
        destructive: "text-destructive bg-destructive/10",
    };

    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
                        <h3 className={cn("text-xl sm:text-2xl lg:text-3xl font-bold", {
                            "text-primary": color === "primary",
                            "text-secondary": color === "secondary", 
                            "text-accent": color === "accent",
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
        color?: "primary" | "secondary" | "accent" | "destructive";
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