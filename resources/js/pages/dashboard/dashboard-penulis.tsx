import DashboardPenulis from '@/components/dashboard-penulis';
import AppHeaderLayout from '@/layouts/app-user-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Penulis',
        href: '/dashboard',
    },
];

type ManuscriptStatus = 'draft' | 'review' | 'approved' | 'canceled';

type PenulisProps = {
    stats: {
        total: number;
        draft: number;
        progres: number;
        publish: number;
        delta?: Partial<Record<'total' | 'draft' | 'progres' | 'publish', number>>;
    };
    activities: Array<{
        naskah_id: string;
        title: string;
        status: ManuscriptStatus;
        updatedAt?: string;
    }>;
    user: {
        nama_lengkap: string;
        email: string;
    };
};

export default function DashboardPenulisPage() {
    const { stats, activities, user } = usePage<PenulisProps>().props;

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Penulis" />

            <div className="w-full px-3 py-1.6">
                {/* Welcome Header */}
                <div className="rounded-lg bg-primary p-6 text-white">
                    <h1 className="mb-2 text-2xl font-bold">Selamat datang, {user.nama_lengkap}! 👋</h1>
                    <p className="text-blue-100">Kelola dan pantau progress naskah Anda dengan mudah</p>
                </div>

                <DashboardPenulis
                    total={stats.total}
                    draft={stats.draft}
                    progres={stats.progres}
                    publish={stats.publish}
                    delta={stats.delta}
                    activities={activities}
                />
            </div>
        </AppHeaderLayout>
    );
}
