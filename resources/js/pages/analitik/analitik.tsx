import { Badge } from '@/components/ui/badge';
import { KPIGrid, ProgressSummary } from '@/components/ui/progress-summary';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingUp, Clock, Users, CheckCircle, AlertTriangle, BookOpen, Target, Award, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Analitik Kinerja Tim', href: '/analitik' }];

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
    tasks: number;
    books: number;
};


type TopPerformer = {
    user_id: string;
    nama_lengkap: string;
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
    avg_completion_days: number;
    books_involved: number;
    completion_rate: number;
    efficiency_score: number;
};

type WorkloadDistribution = {
    nama_lengkap: string;
    active_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
};

type DeadlinePerformance = {
    on_time: number;
    late: number;
    upcoming: number;
    overdue: number;
};

type PageProps = {
    metrics: Metrics;
    bookStatusDistribution: BookStatusDistribution[];
    monthlyProductivity: MonthlyProductivity[];
    topPerformers: TopPerformer[];
    workloadDistribution: WorkloadDistribution[];
    deadlinePerformance: DeadlinePerformance;
};


export default function Analitik({ 
    metrics, 
    bookStatusDistribution, 
    monthlyProductivity, 
    topPerformers, 
    workloadDistribution, 
    deadlinePerformance 
}: PageProps) {


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analitik Kinerja Tim" />
            <div>
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Analitik Kinerja Tim</h1>
                    <p className="mt-1 text-sm text-gray-600">Dashboard komprehensif untuk memantau produktivitas dan kinerja tim produksi</p>
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
                    <div className="bg-card border rounded-lg p-4">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Target className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Distribusi Status Buku</h3>
                                    <p className="text-sm text-muted-foreground">Persentase status buku dalam sistem</p>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={bookStatusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    dataKey="value"
                                    label={({ percentage }) => `${percentage}%`}
                                    labelLine={false}
                                >
                                    {bookStatusDistribution.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`var(--chart-${index + 1})`}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} buku`, '']} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => value}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Produktivitas Bulanan */}
                    <div className="bg-card border rounded-lg p-4">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Produktivitas 6 Bulan Terakhir</h3>
                                    <p className="text-sm text-muted-foreground">Tugas dan buku yang diselesaikan per bulan</p>
                                </div>
                            </div>
                        </div>
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
                                        `${value} ${name === 'tasks' ? 'tugas' : 'buku'}`,
                                        name === 'tasks' ? 'Tugas Selesai' : 'Buku Selesai'
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
                                    dataKey="tasks"
                                    stackId="1"
                                    stroke="var(--chart-3)"
                                    fill="var(--chart-3)"
                                    fillOpacity={0.6}
                                    name="tasks"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="books"
                                    stackId="1"
                                    stroke="var(--chart-1)"
                                    fill="var(--chart-1)"
                                    fillOpacity={0.6}
                                    name="books"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Performers */}
                    <div className="bg-card border rounded-lg p-4">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Award className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Top Performers</h3>
                                    <p className="text-sm text-muted-foreground">Anggota tim dengan kinerja terbaik</p>
                                </div>
                            </div>
                        </div>
                            <div className="space-y-4">
                                {topPerformers.slice(0, 5).map((performer, index) => (
                                    <div key={performer.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{performer.nama_lengkap}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {performer.total_tasks} tugas • {performer.books_involved} buku
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={performer.completion_rate >= 80 ? "default" : "secondary"}>
                                                {performer.completion_rate}%
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {performer.avg_completion_days} hari avg
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    </div>

                    {/* Distribusi Beban Kerja */}
                    <div className="bg-card border rounded-lg">
                        <div className="p-4 pb-0">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Activity className="h-4 w-4" />
                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Distribusi Beban Kerja Aktif</h3>
                                    <p className="text-sm text-muted-foreground">Tugas aktif per anggota tim</p>
                            </div>
                            </div>
                        </div>
                        <div className="px-4 pb-4">
                            <ProgressSummary
                                items={workloadDistribution.slice(0, 8).map((member) => {
                                    const totalTasks = member.active_tasks + member.completed_tasks;
                                    const completionRate = totalTasks > 0 ? Math.round((member.completed_tasks / totalTasks) * 100) : 0;

                                    return {
                                        name: member.nama_lengkap,
                                        count: member.active_tasks,
                                        percentage: completionRate,
                                        description: `${member.completed_tasks} selesai${member.overdue_tasks > 0 ? ` • ${member.overdue_tasks} terlambat` : ''}`
                                    };
                                })}
                                total={workloadDistribution.reduce((sum, member) => sum + member.active_tasks, 0)}
                                maxItems={8}
                                showPercentage={true}
                                className="border-0 shadow-none bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Deadline Performance Summary - KPIGrid */}
                <KPIGrid
                    items={[
                        {
                            title: "Tepat Waktu",
                            value: deadlinePerformance.on_time,
                            icon: <CheckCircle className="h-5 w-5" />,
                            color: "secondary",
                            description: "Tugas selesai sesuai deadline"
                        },
                        {
                            title: "Mendekati Deadline",
                            value: deadlinePerformance.upcoming,
                            icon: <Clock className="h-5 w-5" />,
                            color: "secondary",
                            description: "Tugas dengan deadline dalam 7 hari"
                        },
                        {
                            title: "Terlambat",
                            value: deadlinePerformance.late,
                            icon: <AlertTriangle className="h-5 w-5" />,
                            color: "secondary",
                            description: "Tugas selesai melewati deadline"
                        },
                        {
                            title: "Lewat Deadline",
                            value: deadlinePerformance.overdue,
                            icon: <AlertTriangle className="h-5 w-5" />,
                            color: "secondary",
                            description: "Tugas yang sudah melewati deadline"
                        }
                    ]}
                    className="grid-cols-1 md:grid-cols-4"
                />
                </div>
            </div>
        </AppLayout>
    );
}
