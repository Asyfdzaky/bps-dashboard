import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KPIGrid } from '@/components/ui/progress-summary';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpen, CheckCircle, AlertTriangle, Users, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Analitik Penerbit', href: '/analitik' }];

type Metrics = {
    totalBooks: number;
    completedBooks: number;
    inProgressBooks: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    overdueRate: number;
    activeMembers: number;
};

type BookStatusDistribution = {
    name: string;
    value: number;
    percentage: number;
};

type MonthlyProductivity = {
    month: string;
    books: number;
    manuscripts: number;
};

type StagePerformance = {
    nama_tugas: string;
    urutan: number;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
};

type GenreDistribution = {
    name: string;
    value: number;
    percentage: number;
};

type TopAuthor = {
    author_id: string;
    nama_lengkap: string;
    books_published: number;
    manuscripts_count: number;
};

type PageProps = {
    metrics: Metrics;
    bookStatusDistribution: BookStatusDistribution[];
    monthlyProductivity: MonthlyProductivity[];
    stagePerformance: StagePerformance[];
    genreDistribution: GenreDistribution[];
    topAuthors: TopAuthor[];
};


export default function AnalitikPenerbit({
    metrics,
    bookStatusDistribution,
    monthlyProductivity,
    stagePerformance,
    genreDistribution,
    topAuthors
}: PageProps) {


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analitik Penerbit" />
            <div>
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Analitik Penerbit</h1>
                    <p className="mt-1 text-sm text-gray-600">Dashboard khusus untuk memantau performa penerbitan Anda</p>
                </div>
                    <div className="space-y-8">
                        {/* Metrik Utama menggunakan KPIGrid */}
                        <KPIGrid
                            items={[
                                {
                                    title: "Total Buku",
                                    value: metrics.totalBooks,
                                    icon: <BookOpen className="h-5 w-5" />,
                                    color: "primary",
                                    description: `${metrics.completedBooks} selesai • ${metrics.inProgressBooks} proses`
                                },
                                {
                                    title: "Tingkat Penyelesaian",
                                    value: metrics.completionRate,
                                    icon: <CheckCircle className="h-5 w-5" />,
                                    color: "primary",
                                    description: `${metrics.completedTasks} dari ${metrics.totalTasks} tugas`
                                },
                                {
                                    title: "Tugas Terlambat",
                                    value: metrics.overdueTasks,
                                    icon: <AlertTriangle className="h-5 w-5" />,
                                    color: "primary",
                                    description: `${metrics.overdueRate}% dari total tugas`
                                },
                                {
                                    title: "Tim Aktif",
                                    value: metrics.activeMembers,
                                    icon: <Users className="h-5 w-5" />,
                                    color: "primary",
                                    description: "Anggota dengan tugas aktif"
                                }
                            ]}
                            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                        />

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Status Distribusi Buku */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <PieChartIcon className="h-4 w-4" />
                                        </div>
                                        Distribusi Status Buku
                                    </CardTitle>
                                    <CardDescription>Persentase status buku dalam sistem</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={bookStatusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={120}
                                                dataKey="value"
                                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                labelLine={false}
                                            >
                                                {bookStatusDistribution.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={`var(--chart-${index + 1})`}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => [`${value} buku`, 'Jumlah']} />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value) => value}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Genre Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <BarChart3 className="h-4 w-4" />
                                        </div>
                                        Distribusi Genre
                                    </CardTitle>
                                    <CardDescription>Genre buku yang diterbitkan</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={genreDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={120}
                                                dataKey="value"
                                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                labelLine={false}
                                            >
                                                {genreDistribution.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={`var(--chart-${index + 1})`}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => [`${value} buku`, 'Jumlah']} />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value) => value}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Row 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Monthly Productivity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        Produktivitas Bulanan
                                    </CardTitle>
                                    <CardDescription>Buku dan naskah yang diproses per bulan</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart data={monthlyProductivity}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.3} />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                            />
                                            <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `${value} ${name === 'books' ? 'buku' : 'naskah'}`,
                                                    name === 'books' ? 'Buku Selesai' : 'Naskah Masuk'
                                                ]}
                                                labelStyle={{ color: 'var(--foreground)' }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="books"
                                                stackId="1"
                                                stroke="var(--chart-2)"
                                                fill="var(--chart-2)"
                                                fillOpacity={0.6}
                                                name="books"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="manuscripts"
                                                stackId="1"
                                                stroke="var(--chart-3)"
                                                fill="var(--chart-3)"
                                                fillOpacity={0.6}
                                                name="manuscripts"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Top Authors */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        Penulis Terproduktif
                                    </CardTitle>
                                    <CardDescription>Penulis dengan buku terbanyak yang diterbitkan</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topAuthors.slice(0, 5).map((author, index) => (
                                            <div key={author.author_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{author.nama_lengkap}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {author.manuscripts_count} naskah • {author.books_published} buku
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">
                                                    {author.books_published} buku
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Task Performance by Stage */}
                        {stagePerformance.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        Kinerja per Tahap Produksi
                                    </CardTitle>
                                    <CardDescription>Tingkat penyelesaian tugas per tahap</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={stagePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.3} />
                                            <XAxis
                                                dataKey="nama_tugas"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                                label={{ value: 'Tingkat Penyelesaian (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--muted-foreground)' } }}
                                            />
                                            <Tooltip
                                                formatter={(value) => [
                                                    `${value}%`,
                                                    'Tingkat Penyelesaian'
                                                ]}
                                                labelStyle={{ color: 'var(--foreground)' }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Bar
                                                dataKey="completion_rate"
                                                fill="var(--chart-2)"
                                                name="Tingkat Penyelesaian"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                    </div>
            </div>
        </AppLayout>
    );
}
