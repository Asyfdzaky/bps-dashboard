import DashboardPenulis from '@/components/dashboard-penulis';
import ListNaskahDeadline from '@/components/list-naskah-deadline';
import ListNaskahTerkini from '@/components/list-naskah-terkini';
import { StatsCard } from '@/components/perfomance-card';
import StatusBukuChart from '@/components/pie-chart';
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
                    <div className="w-full px-4 py-4">
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold">Dashboard Manajemen Penerbitan Buku</h1>
                        </div>
                        {/* Mobile dan Tablet Layout */}
                        <div className="block lg:hidden">
                            {/* Stats Cards - Mobile: 1 kolom, Tablet: 2 kolom */}
                            <div className="mb-4 grid gap-4 sm:grid-cols-2">
                                <StatsCard
                                    className="col-span-1"
                                    title="Target Cetak"
                                    value={TargetTahunan}
                                    description="Target Cetak Tahun Ini"
                                    icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                                    iconClassName="bg-yellow-100"
                                />
                                <StatsCard
                                    className="col-span-1"
                                    title="Buku Published"
                                    value={Published}
                                    description="Judul Buku"
                                    icon={<BookOpen className="h-6 w-6 text-green-500" />}
                                    iconClassName="bg-green-100"
                                />
                                <StatsCard
                                    className="col-span-1"
                                    title="Sedang Dikerjakan"
                                    value={SedangDikerjakan}
                                    description="Judul Buku"
                                    icon={<FileText className="h-6 w-6 text-blue-500" />}
                                    iconClassName="bg-blue-100"
                                />
                                <StatsCard
                                    className="col-span-1"
                                    title="Mendekati deadline"
                                    value={MendekatiDeadline}
                                    description="Judul Buku"
                                    icon={<Clock className="h-6 w-6 text-gray-500" />}
                                    iconClassName="bg-gray-100"
                                />
                            </div>

                            {/* Content Stack - Vertikal untuk mobile/tablet */}
                            <div className="space-y-4">
                                <div className="w-full">
                                    <ListNaskahDeadline books={books} title="Daftar Naskah Buku Deadline" />
                                </div>
                                <div className="w-full rounded-lg bg-foreground p-4">
                                    <StatusBukuChart data={ChartData} />
                                </div>
                                <div className="w-full">
                                    <ListNaskahTerkini books={books} title="Naskah Terkini" />
                                </div>
                            </div>
                        </div>

                        {/* Desktop Layout - Tetap seperti semula */}
                        <div className="hidden w-full gap-4 lg:grid lg:grid-cols-12">
                            <div className="flex h-full w-full flex-col gap-4 lg:col-span-8">
                                <div className="grid h-full w-full grid-cols-4 gap-4">
                                    <StatsCard
                                        className="row-span-1 sm:col-span-2"
                                        title="Target Cetak"
                                        value={TargetTahunan}
                                        description="Target Cetak Tahun Ini"
                                        icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                                        iconClassName="bg-yellow-100"
                                    />
                                    <StatsCard
                                        className="row-span-1 sm:col-span-2"
                                        title="Buku Published"
                                        value={Published}
                                        description="Judul Buku"
                                        icon={<BookOpen className="h-6 w-6 text-green-500" />}
                                        iconClassName="bg-green-100"
                                    />

                                    <StatsCard
                                        className="row-span-1 sm:col-span-2"
                                        title="Sedang Dikerjakan"
                                        value={SedangDikerjakan}
                                        description="Judul Buku"
                                        icon={<FileText className="h-6 w-6 text-blue-500" />}
                                        iconClassName="bg-blue-100"
                                    />

                                    <StatsCard
                                        className="row-span-1 sm:col-span-2"
                                        title="Mendekati deadline"
                                        value={MendekatiDeadline}
                                        description="Judul Buku"
                                        icon={<Clock className="h-6 w-6 text-gray-500" />}
                                        iconClassName="bg-gray-100"
                                    />
                                </div>
                                <div className="h-full w-full">
                                    <ListNaskahTerkini books={books} title="Naskah Terkini" />
                                </div>
                            </div>
                            <div className="flex h-full w-full flex-col gap-4 lg:col-span-4">
                                <div className="h-full w-full">
                                    <ListNaskahDeadline books={books} title="Daftar Naskah Buku Deadline" />
                                </div>
                                <div className="h-full w-full rounded-lg border bg-background p-4">
                                    <StatusBukuChart data={ChartData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
