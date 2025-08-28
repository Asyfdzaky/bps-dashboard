import ListNaskahDeadline from '@/components/list-naskah-deadline';
import ListNaskahTerkini from '@/components/list-naskah-terkini';
import { StatsCard } from '@/components/perfomance-card';
import StatusBukuChart from '@/components/pie-chart';
import { Card, CardContent } from '@/components/ui/card';
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

  

    

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Manajemen Penerbitan Buku" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">Dashboard Manajemen Penerbitan Buku</h1>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        {/* ===== Stats top ===== */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatsCard
                                className="row-span-2 sm:col-span-2"
                                title="Target Cetak"
                                value={TargetTahunan}
                                description="Target Cetak Tahun Ini"
                                icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                                trend={{ value: 11, isPositive: true }}
                                iconClassName="bg-yellow-100"
                            />

                            <StatsCard
                                className="sm:col-span-2"
                                title="Buku Published"
                                value={Published}
                                description="Judul Buku"
                                icon={<BookOpen className="h-6 w-6 text-green-500" />}
                                iconClassName="bg-green-100"
                            />

                            <StatsCard
                                title="Sedang Dikerjakan"
                                value={SedangDikerjakan}
                                description="Judul Buku"
                                icon={<FileText className="h-6 w-6 text-blue-500" />}
                                iconClassName="bg-blue-100"
                            />

                            <StatsCard
                                title="Mendekati deadline"
                                value={MendekatiDeadline}
                                description="Judul Buku"
                                icon={<Clock className="h-6 w-6 text-gray-500" />}
                                iconClassName="bg-gray-100"
                            />
                        </div>
                        {/* RIGHT (sidebar) */}
                        <section>
                            <ListNaskahTerkini books={books} title="Naskah Terkini" />
                        </section>
                    </div>

                    {/* ===== Main grid: left content + right sidebar ===== */}
                    <aside className="space-y-6 self-start lg:sticky lg:top-4 lg:col-span-4 lg:row-span-2">
                        {/* LEFT */}
                        <ListNaskahDeadline books={books} title="Daftar Naskah Buku Terkini" />
                        <Card className="bg-white">
                            <CardContent>
                                <StatusBukuChart data={ChartData} />
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>

            
        </AppLayout>
    );
}
