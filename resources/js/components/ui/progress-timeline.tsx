import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle, Calendar, Eye, ChevronDown, ChevronRight } from "lucide-react";

interface ProgressItem {
    id: string;
    title: string;
    category?: string;
    status: "completed" | "in_progress" | "pending" | "overdue";
    assignedTo?: Array<{
        id: string;
        name: string;
        avatar?: string;
        initials?: string;
    }>;
    addedBy?: {
        name: string;
        avatar?: string;
        time: string;
    };
    dueDate?: string;
    description?: string;
}

interface ProgressTimelineProps {
    title?: string;
    description?: string;
    items: ProgressItem[];
    showDate?: boolean;
    showAddedBy?: boolean;
    className?: string;
}

const statusConfig = {
    completed: {
        label: "Selesai",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
    },
    in_progress: {
        label: "Dalam Proses",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
    },
    pending: {
        label: "Menunggu",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
    },
    overdue: {
        label: "Terlambat",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle,
    },
};

export function ProgressTimeline({
    title = "Progress Timeline",
    description,
    items,
    showDate = true,
    showAddedBy = true,
    className,
}: ProgressTimelineProps) {
    const currentDate = new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            {description && (
                                <CardDescription className="mt-1">
                                    {description}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    {showDate && (
                        <div className="text-sm text-muted-foreground">
                            {currentDate}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.length > 0 ? (
                        <>
                            {showAddedBy && items[0]?.addedBy && (
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Ditambahkan pada {items[0].addedBy.time} oleh
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={items[0].addedBy.avatar} />
                                                <AvatarFallback className="text-xs">
                                                    {items[0].addedBy.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{items[0].addedBy.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 h-px bg-border ml-4" />
                                </div>
                            )}
                            
                            <div className="space-y-3">
                                {items.map((item) => {
                                    const statusInfo = statusConfig[item.status];
                                    const StatusIcon = statusInfo.icon;
                                    
                                    return (
                                        <div key={item.id} className="group">
                                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-medium text-foreground">
                                                            {item.title}
                                                        </h4>
                                                        {item.category && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center  gap-4">
                                                        {item.assignedTo && item.assignedTo.length > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex -space-x-1">
                                                                    {item.assignedTo.slice(0, 3).map((person) => (
                                                                        <Avatar key={person.id} className="h-6 w-6 border-2 border-background">
                                                                            <AvatarImage src={person.avatar} />
                                                                            <AvatarFallback className="text-xs">
                                                                                {person.initials || person.name.split(' ').map(n => n[0]).join('')}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    ))}
                                                                    {item.assignedTo.length > 3 && (
                                                                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                                                            <span className="text-xs font-medium">
                                                                                +{item.assignedTo.length - 3}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        <Badge 
                                                            variant="outline" 
                                                            className={cn("text-xs", statusInfo.color)}
                                                        >
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                        
                                                        {item.dueDate && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                {item.dueDate}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Lihat
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                Tidak ada progress tersedia
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Progress akan muncul di sini setelah ditambahkan
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Komponen untuk menampilkan progress per stage dengan collapsible
interface StageProgressProps {
    stageName: string;
    items: ProgressItem[];
    showStageHeader?: boolean;
    defaultOpen?: boolean;
    className?: string;
}

export function StageProgress({ 
    stageName, 
    items, 
    showStageHeader = true,
    defaultOpen = true,
    className 
}: StageProgressProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    
    return (
        <div className={cn("space-y-3 sm:space-y-4", className)}>
            {showStageHeader && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    {/* Header dengan notification style */}
                    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                        <CollapsibleTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="w-full justify-between p-3 sm:p-4 h-auto hover:bg-muted/50 transition-all duration-200 rounded-lg"
                            >
                                <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                                    <div className="w-2 h-2 bg-chart-2 rounded-full flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm sm:text-base font-medium text-foreground truncate">
                                            {stageName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                {items.length} item{items.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    <div className="hidden sm:block text-right">
                                        <div className="text-xs text-muted-foreground">Hari Ini</div>
                                        <div className="text-xs text-muted-foreground/60">Minggu</div>
                                    </div>
                                    <div className="transition-transform duration-300 ease-in-out">
                                        {isOpen ? (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            </Button>
                        </CollapsibleTrigger>
                        
                                                                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                            <div className="border-t border-border">
                                <div className="p-3 sm:p-4 space-y-3">
                                    {items.map((item, index) => {
                                        const statusInfo = statusConfig[item.status];
                                        
                                        return (
                                            <div key={item.id} className="group">
                                                <div className="flex items-start sm:items-center justify-between hover:bg-muted/50 rounded-lg p-3 transition-colors duration-200 gap-3">
                                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                        {/* Nomor urut */}
                                                        <div className="flex-shrink-0 mt-1 sm:mt-0">
                                                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col gap-2 mb-2">
                                                                <h4 className="font-medium text-foreground text-sm truncate">
                                                                    {item.title}
                                                                </h4>
                                                                
                                                                {/* Info dalam satu baris */}
                                                                <div className="flex items-center gap-3 flex-wrap text-xs">
                                                                    {item.category && (
                                                                        <span className="text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                                                            {item.category}
                                                                        </span>
                                                                    )}
                                                                    
                                                                    {item.assignedTo && item.assignedTo.length > 0 && (
                                                                        <span className="text-muted-foreground">
                                                                            PIC: {item.assignedTo[0].name}
                                                                            {item.assignedTo.length > 1 && ` +${item.assignedTo.length - 1} lainnya`}
                                                                        </span>
                                                                    )}
                                                                    
                                                                    <span className={cn(
                                                                        "px-2 py-1 rounded-md font-medium",
                                                                        {
                                                                            "bg-chart-3/10 text-chart-3": item.status === "completed",
                                                                            "bg-chart-2/10 text-chart-2": item.status === "in_progress",
                                                                            "bg-muted text-muted-foreground": item.status === "pending", 
                                                                            "bg-destructive/10 text-destructive": item.status === "overdue"
                                                                        }
                                                                    )}>
                                                                        {statusInfo.label}
                                                                    </span>
                                                                    
                                                                    {item.dueDate && (
                                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                                            <Calendar className="w-3 h-3" />
                                                                            {item.dueDate}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action button */}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="text-xs px-2 sm:px-3 py-1 h-7 flex-shrink-0"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        <span className="hidden sm:inline">Detail</span>
                                                        <span className="sm:hidden">Lihat</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            )}
        </div>
    );
}
