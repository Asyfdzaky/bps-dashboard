import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Manajemen Penerbitan Buku" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Manajemen Penerbitan Buku</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Input type="text" placeholder="Cari naskah" />
                    <Button>
                        <Search />
                    </Button>
                </div>
                <div className="grid auto-rows-min gap-2 md:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Tahun ini </CardTitle>
                            <CardContent>
                                <div className="m-2 items-center">
                                    <span className="text-2xl font-bold">100</span>
                                </div>
                            </CardContent>
                            <CardDescription>Judul Buku</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Tahun ini </CardTitle>
                            <CardContent>
                                <div className="m-2 items-center">
                                    <span className="text-2xl font-bold">100</span>
                                </div>
                            </CardContent>
                            <CardDescription>Judul Buku</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Tahun ini </CardTitle>
                            <CardContent>
                                <div className="m-2 items-center">
                                    <span className="text-2xl font-bold">100</span>
                                </div>
                            </CardContent>
                            <CardDescription>Judul Buku</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Tahun ini </CardTitle>
                            <CardContent>
                                <div className="m-2 items-center">
                                    <span className="text-2xl font-bold">100</span>
                                </div>
                            </CardContent>
                            <CardDescription>Judul Buku</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Tahun ini </CardTitle>
                            <CardContent>
                                <div className="m-2 items-center">
                                    <span className="text-2xl font-bold">100</span>
                                </div>
                            </CardContent>
                            <CardDescription>Judul Buku</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
