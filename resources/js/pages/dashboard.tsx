import { StatsCard } from '@/components/perfomance-card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronDown, Search, Trophy } from 'lucide-react';

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
                        title="Target Tahun ini"
                        value={100}
                        change="+12.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    />
                    <StatsCard
                        title="Target Tahun ini"
                        value={100}
                        change="+12.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    />
                    <StatsCard
                        title="Target Tahun ini"
                        value={100}
                        change="+12.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    />
                    <StatsCard
                        title="Target Tahun ini"
                        value={100}
                        change="+12.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    />
                    <StatsCard
                        title="Target Tahun ini"
                        value={100}
                        change="+12.00%"
                        period="this week"
                        positive={true}
                        icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    />
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Penerbit</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>1</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>1</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>1</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>1</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
