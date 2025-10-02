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
            progres: number;
            publish: number;
            delta?: Partial<Record<'total' | 'draft' | 'progres' | 'publish', number>>;
        };
        activities: Array<{
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
            title: 'Target Cetak',
            value: TargetTahunan,
            icon: <Trophy className="h-5 w-5 lg:h-6 lg:w-6" />,
            color: 'primary' as const,
            description: 'Target Cetak Buku per Tahun',
        },
        {
            title: 'Buku Published',
            value: Published,
            icon: <BookOpen className="h-5 w-5 lg:h-6 lg:w-6" />,
            color: 'primary' as const,
            description: 'Jumlah Buku yang Sudah Diterbitkan',
        },
        {
            title: 'Sedang Dikerjakan',
            value: SedangDikerjakan,
            icon: <FileText className="h-5 w-5 lg:h-6 lg:w-6" />,
            color: 'primary' as const,
            description: 'Naskah yang Sedang dalam Proses',
        },
        {
            title: 'Mendekati Deadline',
            value: MendekatiDeadline,
            icon: <Clock className="h-5 w-5 lg:h-6 lg:w-6" />,
            color: 'primary' as const,
            description: 'Naskah yang Mendekati Batas Waktu',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {penulis ? (
                <DashboardPenulis
                    total={penulis.stats.total}
                    draft={penulis.stats.draft}
                    progres={penulis.stats.progres}
                    publish={penulis.stats.publish}
                    delta={penulis.stats.delta}
                    activities={penulis.activities}
                />
            ) : (
                <>
                    <Head title="Dashboard Manajemen Penerbitan Buku" />

                    {/* Main Container with optimized spacing */}
                    <div className="min-h-screen">
                        <div className="mx-auto">
                            {/* Header Section - Reduced margin */}
                            <div className="mb-6">
                                <div className="flex flex-col gap-2">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Manajemen Penerbitan Buku</h1>
                                    <p className="mt-1 text-sm text-gray-600">Pantau progress penerbitan dan kelola naskah dengan mudah</p>
                                </div>
                                </div>
                            </div>

                            {/* Main Layout Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                                {/* Left Column - KPI + Naskah Terkini */}
                                <div className="lg:col-span-8">
                                    {/* KPI Section - Reduced margins */}
                                    <div className="mb-6">
                                        <div className="mb-4">
                                            <h2 className="text-base font-bold">Statistik Utama</h2>
                                        </div>
                                        <KPIGrid items={kpiItems} className="grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-4" />
                                    </div>

                                    {/* Naskah Terkini Section - Moved up with reduced spacing */}
                                    <div>
                                        <h2 className="text-base font-bold mb-2">Naskah Terkini</h2>
                                        <div className="border rounded-lg">
                                        <ListNaskahTerkini books={books} />
                                        </div>
                                       
                                    </div>
                                </div>

                                {/* Right Column - Deadline + Chart */}
                                <div className="lg:col-span-4">
                                    {/* Deadline Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 py-0.5">
                                            <span className="text-base font-bold">Naskah Mendekati Deadline</span>
                                        </div>
                                        <div className="mt-3">
                                            <ListNaskahDeadline books={books} />
                                        </div>
                                    </div>

                                    {/* Chart Section */}
                                    <div>
                                        <div className="mb-4">
                                            <h3 className="text-base font-bold">Status Buku</h3>
                                        </div>
                                        <Card className="border">
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
