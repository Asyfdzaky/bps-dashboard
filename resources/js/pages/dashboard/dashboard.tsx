import DashboardPenulis from '@/components/dashboard-penulis';
import ListNaskahDeadline from '@/components/list-naskah-deadline';
import ListNaskahTerkini from '@/components/list-naskah-terkini';
import StatusBukuChart from '@/components/pie-chart';
import { Card, CardContent } from '@/components/ui/card';
import { KPIGrid } from '@/components/ui/progress-summary';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Book } from '@/types/books';
import { Head, usePage } from '@inertiajs/react';
import { BookOpen, Clock, FileText, Trophy } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type ManuscriptStatus = 'draft' | 'review' | 'approved' | 'canceled';

type PenulisProps = {
    penulis?: {
        stats: {
            total: number;
            draft: number;
            progres: number; // <- selaras dengan controller
            publish: number;
            delta?: Partial<Record<'total' | 'draft' | 'progres' | 'publish', number>>;
        };
        activities: Array<{
            // <- selaras dengan controller
            id: string | number;
            title: string;
            status: ManuscriptStatus;
            updatedAt?: string;
        }>;
    };
};

export default function Dashboard() {
    const {
        books = [],
        TargetTahunan,
        SedangDikerjakan,
        MendekatiDeadline,
        Published,
        ChartData,
    } = usePage<{
        books: Book[];
        TargetTahunan: number;
        SedangDikerjakan: number;
        MendekatiDeadline: number;
        Published: number;
        ChartData: { [key: string]: number };
    }>().props;
    const { penulis } = usePage<PenulisProps>().props;

    // KPI data for the grid dengan warna sesuai theme
    const kpiItems = [
        {
            title: "Target Cetak",
            value: TargetTahunan,
            icon: <Trophy className="h-5 w-5 lg:h-6 lg:w-6" />,
            color: "chart-3" as const, // Golden yellow untuk target
        },
        {
            title: "Buku Published",
            value: Published,
            icon: <BookOpen className="h-5 w-5 lg:h-6 lg:w-6" />,
            color: "primary" as const, // Space Cadet blue untuk published
        },
        {
            title: "Sedang Dikerjakan",
            value: SedangDikerjakan,
            icon: <FileText className="h-5 w-5 lg:h-6 lg:w-6" />,
            color: "chart-2" as const, // Teal untuk progress
        },
        {
            title: "Mendekati Deadline",
            value: MendekatiDeadline,
            icon: <Clock className="h-5 w-5 lg:h-6 lg:w-6" />,
            color: "destructive" as const, // Red untuk urgent
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {penulis ? (
                <DashboardPenulis
                    total={penulis.stats.total}
                    draft={penulis.stats.draft}
                    progres={penulis.stats.progres} // <- sebelumnya .review
                    publish={penulis.stats.publish}
                    delta={penulis.stats.delta}
                    activities={penulis.activities} // <- sebelumnya tidak diteruskan
                />
            ) : (
                <>
                    <Head title="Dashboard Manajemen Penerbitan Buku" />
                    
                    {/* Main Container with better spacing */}
                    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                            {/* Header Section */}
                            <div className="mb-8 lg:mb-12">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                                        Dashboard Manajemen Penerbitan Buku
                                    </h1>
                                    <p className="text-muted-foreground text-sm lg:text-base">
                                        Pantau progress penerbitan dan kelola naskah dengan mudah
                                    </p>
                                </div>
                            </div>

                            {/* KPI Section - Always full width */}
                            <div className="mb-8 lg:mb-12">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-foreground mb-2">Statistik Utama</h2>
                                    <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                                </div>
                                <KPIGrid items={kpiItems} className="grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" />
                            </div>

                            {/* Content Grid - Responsive Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                                {/* Main Content Area */}
                                <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                                    <div>
                                        <div className="mb-4">
                                            <h2 className="text-xl font-semibold text-foreground mb-2">Naskah Terkini</h2>
                                            <div className="h-1 w-16 bg-gradient-to-r from-chart-2 to-chart-3 rounded-full"></div>
                                        </div>
                                        <ListNaskahTerkini books={books} title="" />
                                    </div>
                                </div>

                                {/* Sidebar Content */}
                                <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                                    {/* Deadline Section */}
                                    <div>
                                        <div className="mb-4">
                                            <h2 className="text-xl font-semibold text-foreground mb-2">Deadline Terdekat</h2>
                                            <div className="h-1 w-16 bg-gradient-to-r from-destructive to-orange-500 rounded-full"></div>
                                        </div>
                                        <ListNaskahDeadline books={books} title="" />
                                    </div>

                                    {/* Chart Section */}
                                    <div>
                                        <div className="mb-4">
                                            <h2 className="text-xl font-semibold text-foreground mb-2">Status Buku</h2>
                                            <div className="h-1 w-16 bg-gradient-to-r from-chart-1 to-chart-4 rounded-full"></div>
                                        </div>
                                        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                                            <CardContent className="p-6">
                                                <StatusBukuChart data={ChartData} />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
