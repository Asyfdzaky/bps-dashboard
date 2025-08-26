import ListBuku from '@/components/list-buku';
import { StatsCard } from '@/components/perfomance-card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Book } from '@/types/books';
import { Head, usePage } from '@inertiajs/react';
import { ChevronDown, Search, Trophy } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { books = [] } = usePage<{ books: Book[] }>().props;
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <span>Semua Status</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Semua Status</DropdownMenuItem>
                            <DropdownMenuItem>Diterima</DropdownMenuItem>
                            <DropdownMenuItem>Ditolak</DropdownMenuItem>
                            <DropdownMenuItem>Dalam Proses</DropdownMenuItem>
                            <DropdownMenuItem>Selesai</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <span>Semua Penerbit</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Semua Penerbit</DropdownMenuItem>
                            <DropdownMenuItem>Penerbit 1</DropdownMenuItem>
                            <DropdownMenuItem>Penerbit 2</DropdownMenuItem>
                            <DropdownMenuItem>Penerbit 3</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="grid auto-rows-min gap-2 md:grid-cols-5">
                    <StatsCard
                        title="Total Buku"
                        value={books?.length || 0}
                        change="+12.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    />
                    <StatsCard
                        title="Buku Published"
                        value={books?.filter((b) => b.status_keseluruhan === 'published').length || 0}
                        change="+8.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-green-500" />}
                    />
                    <StatsCard
                        title="Dalam Review"
                        value={books?.filter((b) => b.status_keseluruhan === 'review').length || 0}
                        change="+5.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-blue-500" />}
                    />
                    <StatsCard
                        title="Dalam Editing"
                        value={books?.filter((b) => b.status_keseluruhan === 'editing').length || 0}
                        change="+3.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-orange-500" />}
                    />
                    <StatsCard
                        title="Draft"
                        value={books?.filter((b) => b.status_keseluruhan === 'draft').length || 0}
                        change="+2.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-gray-500" />}
                    />
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-bold">Daftar Buku Terkini</h2>
                            <ListBuku books={books || []} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
