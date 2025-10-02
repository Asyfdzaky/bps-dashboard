import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

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
    // Lebar label kiri (nama) disamakan untuk semua item agar garis progress selalu sejajar
    // Tambahkan animasi entry: progress bar akan ngefill dari 0 ke persentase saat komponen mount
    const ProgressItem = ({ item, index }: { item: ProgressSummaryItem; index: number }) => {
        const [fill, setFill] = React.useState(0);
        const percentage = showPercentage && calculatedTotal > 0 
            ? (item.count / calculatedTotal) * 100 
            : item.percentage ?? 0;

        useEffect(() => {
            // Timeout agar animasi smooth saat entry
            const timeout = setTimeout(() => {
                setFill(percentage);
            }, 100 + index * 60); // sedikit delay antar item biar lebih smooth
            return () => clearTimeout(timeout);
        }, [percentage, index]);

        return (
            <div key={index} className="flex items-center gap-3">
                <div className="w-[140px] min-w-[100px] max-w-[180px]">
                    <p className="text-sm font-medium break-words truncate">{item.name}</p>
                </div>
                <div className="flex-1 flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-primary h-2 rounded-full transition-all duration-700"
                            style={{ width: `${fill}%` }}
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
    description?: string;
    className?: string;
}

export function KPICard({
    title,
    value,
    icon,
    color = "primary",
    description,
    className
}: KPICardProps) {
    const colorClasses = {
        primary: "text-primary bg-primary/10",
        secondary: "text-secondary bg-secondary/10",
        accent: "text-accent bg-accent/10",
        destructive: "text-destructive bg-destructive/10",
    };

    return (
        <div className={cn("relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm p-4", className)}>
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mb-2">{title}</p>
                    <h3 className={cn("text-xl sm:text-2xl lg:text-3xl font-bold", {
                        "text-primary": color === "primary",
                        "text-secondary": color === "secondary",
                        "text-accent": color === "accent",
                        "text-destructive": color === "destructive",
                    })}>
                        {value}
                    </h3>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {description}
                        </p>
                    )}
                </div>
                <div className={cn("flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center font-bold rounded-full flex-shrink-0", colorClasses[color])}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// Komponen untuk KPI Grid
interface KPIGridProps {
    items: Array<{
        title: string;
        value: number;
        icon: React.ReactNode;
        color?: "primary" | "secondary" | "accent" | "destructive";
        description?: string;
    }>;
    className?: string;
}

export function KPIGrid({ items, className }: KPIGridProps) {
    return (
        <div className={cn(
  "grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]",
  className
)}>
            {items.map((item, index) => (
                <KPICard
                    key={index}
                    title={item.title}
                    value={item.value}
                    icon={item.icon}
                    color={item.color}
                    description={item.description}
                />
            ))}
        </div>
    );
}