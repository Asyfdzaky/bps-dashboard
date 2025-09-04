import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Analitik', href: '/analitik' }];

type Metrics = {
    totalBooks: number;
    publishedBooks: number;
    processedBooks: number;
    avgProductionTime: number;
    fastestProduction: number;
    slowestProduction: number;
    overduePercentage: number;
};

type TaskPerformance = {
    nama_tugas: string;
    urutan: number;
    avg_days: number;
};

type TeamWorkload = {
    nama_lengkap: string;
    total_tasks: number;
    completed_tasks: number;
};

type TeamProductivity = {
    nama_lengkap: string;
    total_books: number;
    completed_tasks: number;
    avg_task_time: number;
};

type PageProps = {
    metrics: Metrics;
    taskPerformance: TaskPerformance[];
    teamWorkload: TeamWorkload[];
    teamProductivity: TeamProductivity[];
};

export default function Analitik({ metrics, taskPerformance, teamWorkload, teamProductivity }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analitik Kinerja Tim" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Analitik Kinerja Tim</h1>
                    <p className="mt-2 text-gray-600">Dashboard untuk memantau produktivitas dan kinerja tim produksi</p>
                </div>

                {/* Kartu Metrik Produksi */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Buku</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalBooks}</div>
                            <p className="text-xs text-muted-foreground">Semua buku dalam sistem</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Buku Terbit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.publishedBooks}</div>
                            <p className="text-xs text-muted-foreground">Buku yang sudah terbit</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rata-rata Waktu Produksi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.avgProductionTime} hari</div>
                            <p className="text-xs text-muted-foreground">Waktu rata-rata dari draft ke terbit</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Keterlambatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.overduePercentage}%</div>
                            <p className="text-xs text-muted-foreground">Persentase buku terlambat</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Grafik Kinerja */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Grafik Waktu Pengerjaan Rata-rata per Tugas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Waktu Pengerjaan Rata-rata per Tugas</CardTitle>
                            <CardDescription>Rata-rata waktu penyelesaian setiap tugas (hari)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={taskPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="nama_tugas" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="avg_days" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Grafik Beban Kerja Tim */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Beban Kerja Tim</CardTitle>
                            <CardDescription>Jumlah tugas yang ditangani setiap anggota tim</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={teamWorkload}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="nama_lengkap" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total_tasks" fill="#82ca9d" />
                                    <Bar dataKey="completed_tasks" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabel Produktivitas Tim */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tabel Produktivitas Tim</CardTitle>
                        <CardDescription>Detail kinerja setiap anggota tim</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Anggota</TableHead>
                                    <TableHead>Jumlah Buku Dikerjakan</TableHead>
                                    <TableHead>Tugas Selesai</TableHead>
                                    <TableHead>Rata-rata Waktu per Tugas (hari)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teamProductivity.map((member, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{member.nama_lengkap}</TableCell>
                                        <TableCell>{member.total_books}</TableCell>
                                        <TableCell>{member.completed_tasks}</TableCell>
                                        {/* <TableCell>{member.avg_task_time ? `${member.avg_task_time.toFixed(1)} hari` : 'N/A'}</TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
