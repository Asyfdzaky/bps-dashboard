import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingUp, Clock, Users, CheckCircle, AlertTriangle, BookOpen, Target, Award, Activity } from 'lucide-react';
import ApexCharts from 'apexcharts';
import { useEffect, useRef } from 'react';

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

type StagePerformance = {
    nama_tugas: string;
    urutan: number;
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
    completion_rate: number;
    overdue_rate: number;
    avg_completion_days: number;
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
    stagePerformance: StagePerformance[];
    topPerformers: TopPerformer[];
    workloadDistribution: WorkloadDistribution[];
    deadlinePerformance: DeadlinePerformance;
};

// Custom colors berdasarkan app.css CSS variables
const chartColors = {
    primary: 'hsl(224, 62%, 25%)', // oklch(28.9% 0.064 268.04) converted to HSL
    secondary: 'hsl(48, 96%, 65%)', // oklch(85% 0.15 85) converted to HSL
    chart1: 'hsl(14, 82%, 58%)', // oklch(0.646 0.222 41.116) 
    chart2: 'hsl(196, 59%, 50%)', // oklch(0.6 0.118 184.704)
    chart3: 'hsl(225, 30%, 39%)', // oklch(0.398 0.07 227.392)
    chart4: 'hsl(42, 75%, 66%)', // oklch(0.828 0.189 84.429)
    chart5: 'hsl(33, 80%, 62%)', // oklch(0.769 0.188 70.08)
    destructive: 'hsl(10, 73%, 57%)', // oklch(0.577 0.245 27.325)
    success: 'hsl(142, 71%, 45%)',
    warning: 'hsl(38, 92%, 50%)',
    muted: 'hsl(0, 0%, 56%)', // oklch(0.556 0 0)
};

export default function Analitik({ 
    metrics, 
    bookStatusDistribution, 
    monthlyProductivity, 
    stagePerformance, 
    topPerformers, 
    workloadDistribution, 
    deadlinePerformance 
}: PageProps) {
    const pieChartRef = useRef<HTMLDivElement>(null);
    const areaChartRef = useRef<HTMLDivElement>(null);
    const barChartRef = useRef<HTMLDivElement>(null);
    const workloadChartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Pie Chart untuk Distribusi Status Buku
        if (pieChartRef.current) {
            pieChartRef.current.innerHTML = '';
            
            const pieOptions = {
                series: bookStatusDistribution.map(item => item.value),
                chart: {
                    type: 'pie' as const,
                    height: 350,
                    fontFamily: 'Instrument Sans, ui-sans-serif',
                    toolbar: {
                        show: false
                    }
                },
                labels: bookStatusDistribution.map(item => item.name),
                colors: [chartColors.chart1, chartColors.chart4, chartColors.chart3],
                legend: {
                    position: 'bottom' as const,
                    fontSize: '14px',
                    labels: {
                        colors: chartColors.muted
                    }
                },
                dataLabels: {
                    enabled: true,
                    formatter: function(val: number) {
                        return Math.round(val) + '%';
                    },
                    style: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                        colors: ['#fff']
                    }
                },
                tooltip: {
                    y: {
                        formatter: function(val: number) {
                            return val + ' buku';
                        }
                    }
                }
            };
            
            const pieChart = new ApexCharts(pieChartRef.current, pieOptions);
            pieChart.render();
        }

        // Area Chart untuk Produktivitas Bulanan
        if (areaChartRef.current && monthlyProductivity.length > 0) {
            // Clear any existing chart first
            areaChartRef.current.innerHTML = '';
            
            const areaOptions = {
                series: [
                    {
                        name: 'Tugas Selesai',
                        data: monthlyProductivity.map(item => item.tasks),
                        color: chartColors.chart2
                    },
                    {
                        name: 'Buku Selesai',
                        data: monthlyProductivity.map(item => item.books),
                        color: chartColors.chart3
                    }
                ],
                chart: {
                    type: 'area' as const,
                    height: 350,
                    fontFamily: 'Instrument Sans, ui-sans-serif',
                    stacked: true,
                    toolbar: {
                        show: false
                    },
                    zoom: {
                        enabled: false
                    }
                },
                colors: [chartColors.chart2, chartColors.chart3],
                xaxis: {
                    categories: monthlyProductivity.map(item => item.month),
                    labels: {
                        style: {
                            fontSize: '12px',
                            colors: chartColors.muted
                        }
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            fontSize: '12px',
                            colors: chartColors.muted
                        }
                    }
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.3,
                        stops: [0, 90, 100]
                    }
                },
                legend: {
                    position: 'top' as const,
                    fontSize: '14px',
                    labels: {
                        colors: chartColors.muted
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                tooltip: {
                    y: {
                        formatter: function(val: number) {
                            return val.toString();
                        }
                    }
                }
            };
            
            const areaChart = new ApexCharts(areaChartRef.current, areaOptions);
            areaChart.render();
        }

        // Bar Chart untuk Kinerja per Tahap
        if (barChartRef.current) {
            barChartRef.current.innerHTML = '';
            
            const barOptions = {
                series: [
                    {
                        name: 'Tingkat Selesai (%)',
                        data: stagePerformance.map(item => item.completion_rate),
                        color: chartColors.chart2
                    },
                    {
                        name: 'Rata-rata Hari',
                        data: stagePerformance.map(item => item.avg_completion_days),
                        color: chartColors.chart4
                    }
                ],
                chart: {
                    type: 'bar' as const,
                    height: 400,
                    fontFamily: 'Instrument Sans, ui-sans-serif',
                    toolbar: {
                        show: false
                    }
                },
                colors: [chartColors.chart2, chartColors.chart4],
                xaxis: {
                    categories: stagePerformance.map(item => item.nama_tugas),
                    labels: {
                        style: {
                            fontSize: '11px',
                            colors: chartColors.muted
                        },
                        rotate: -45,
                        maxHeight: 120
                    }
                },
                yaxis: [
                    {
                        title: {
                            text: 'Tingkat Selesai (%)',
                            style: {
                                fontSize: '12px',
                                color: chartColors.muted
                            }
                        },
                        labels: {
                            style: {
                                fontSize: '12px',
                                colors: chartColors.muted
                            }
                        }
                    },
                    {
                        opposite: true,
                        title: {
                            text: 'Rata-rata Hari',
                            style: {
                                fontSize: '12px',
                                color: chartColors.muted
                            }
                        },
                        labels: {
                            style: {
                                fontSize: '12px',
                                colors: chartColors.muted
                            }
                        }
                    }
                ],
                legend: {
                    position: 'top' as const,
                    fontSize: '14px',
                    labels: {
                        colors: chartColors.muted
                    }
                },
                dataLabels: {
                    enabled: false
                }
            };
            
            const barChart = new ApexCharts(barChartRef.current, barOptions);
            barChart.render();
        }

        // Horizontal Bar Chart untuk Beban Kerja
        if (workloadChartRef.current && workloadDistribution.length > 0) {
            workloadChartRef.current.innerHTML = '';
            
            const workloadData = workloadDistribution.slice(0, 6); // Limit to 6 for better readability
            const workloadOptions = {
                series: [
                    {
                        name: 'Tugas Aktif',
                        data: workloadData.map(item => ({
                            x: item.nama_lengkap,
                            y: item.active_tasks
                        }))
                    },
                    {
                        name: 'Terlambat',
                        data: workloadData.map(item => ({
                            x: item.nama_lengkap,
                            y: item.overdue_tasks
                        }))
                    }
                ],
                chart: {
                    type: 'bar' as const,
                    height: 350,
                    fontFamily: 'Instrument Sans, ui-sans-serif',
                    toolbar: {
                        show: false
                    }
                },
                colors: [chartColors.chart1, chartColors.destructive],
                plotOptions: {
                    bar: {
                        horizontal: true,
                        barHeight: '65%',
                        dataLabels: {
                            position: 'top'
                        }
                    }
                },
                xaxis: {
                    type: 'numeric',
                    labels: {
                        style: {
                            fontSize: '12px',
                            colors: chartColors.muted
                        }
                    },
                    title: {
                        text: 'Jumlah Tugas',
                        style: {
                            fontSize: '12px',
                            color: chartColors.muted
                        }
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            fontSize: '11px',
                            colors: chartColors.muted
                        }
                    }
                },
                legend: {
                    position: 'top' as const,
                    fontSize: '14px',
                    labels: {
                        colors: chartColors.muted
                    }
                },
                dataLabels: {
                    enabled: false,
                },
                tooltip: {
                    y: {
                        formatter: function(val: number) {
                            return val + ' tugas';
                        }
                    }
                },
                grid: {
                    borderColor: chartColors.muted + '30'
                }
            };
            
            const workloadChart = new ApexCharts(workloadChartRef.current, workloadOptions);
            workloadChart.render();
        }

        // Cleanup function
        return () => {
            const charts = document.querySelectorAll('.apexcharts-canvas');
            charts.forEach(chart => {
                const parent = chart.parentElement;
                if (parent) {
                    parent.innerHTML = '';
                }
            });
        };
    }, [bookStatusDistribution, monthlyProductivity, stagePerformance, workloadDistribution]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analitik Kinerja Tim" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Analitik Kinerja Tim</h1>
                    <p className="mt-1 text-sm text-gray-600">Dashboard komprehensif untuk memantau produktivitas dan kinerja tim produksi</p>
                </div>

                <div className="space-y-8">
                    {/* Metrik Utama - Clean tanpa background */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Buku</CardTitle>
                                <BookOpen className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{metrics.totalBooks}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span>{metrics.completedBooks} selesai</span>
                                    <span>•</span>
                                    <span>{metrics.inProgressBooks} proses</span>
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
                                <CheckCircle className="h-5 w-5" style={{ color: chartColors.success }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: chartColors.success }}>{metrics.completionRate}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.completedTasks} dari {metrics.totalTasks} tugas
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tugas Terlambat</CardTitle>
                                <AlertTriangle className="h-5 w-5" style={{ color: chartColors.warning }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: chartColors.warning }}>{metrics.overdueTasks}</div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.overdueRate}% dari total tugas
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tim Aktif</CardTitle>
                                <Users className="h-5 w-5" style={{ color: chartColors.chart5 }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: chartColors.chart5 }}>{metrics.activeMembers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Anggota dengan tugas aktif
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Status Distribusi Buku */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Distribusi Status Buku
                            </CardTitle>
                            <CardDescription>Persentase status buku dalam sistem</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div ref={pieChartRef}></div>
                        </CardContent>
                    </Card>

                    {/* Produktivitas Bulanan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Produktivitas 6 Bulan Terakhir
                            </CardTitle>
                            <CardDescription>Tugas dan buku yang diselesaikan per bulan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div ref={areaChartRef}></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Kinerja per Tahap */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Kinerja per Tahap Produksi
                        </CardTitle>
                        <CardDescription>Analisis tingkat penyelesaian dan waktu per tahap</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div ref={barChartRef}></div>
                    </CardContent>
                </Card>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Top Performers
                            </CardTitle>
                            <CardDescription>Anggota tim dengan kinerja terbaik</CardDescription>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>

                    {/* Distribusi Beban Kerja */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Distribusi Beban Kerja Aktif
                            </CardTitle>
                            <CardDescription>Tugas aktif per anggota tim</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div ref={workloadChartRef}></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Deadline Performance Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Ringkasan Kinerja Deadline
                        </CardTitle>
                        <CardDescription>Distribusi kinerja berdasarkan tenggat waktu</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-lg border">
                                <CheckCircle className="h-8 w-8 mx-auto mb-2" style={{ color: chartColors.success }} />
                                <div className="text-2xl font-bold" style={{ color: chartColors.success }}>{deadlinePerformance.on_time}</div>
                                <p className="text-sm text-muted-foreground">Tepat Waktu</p>
                            </div>
                            <div className="text-center p-4 rounded-lg border">
                                <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: chartColors.warning }} />
                                <div className="text-2xl font-bold" style={{ color: chartColors.warning }}>{deadlinePerformance.upcoming}</div>
                                <p className="text-sm text-muted-foreground">Mendekati Deadline</p>
                            </div>
                            <div className="text-center p-4 rounded-lg border">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2" style={{ color: chartColors.chart4 }} />
                                <div className="text-2xl font-bold" style={{ color: chartColors.chart4 }}>{deadlinePerformance.late}</div>
                                <p className="text-sm text-muted-foreground">Terlambat</p>
                            </div>
                            <div className="text-center p-4 rounded-lg border">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2" style={{ color: chartColors.destructive }} />
                                <div className="text-2xl font-bold" style={{ color: chartColors.destructive }}>{deadlinePerformance.overdue}</div>
                                <p className="text-sm text-muted-foreground">Lewat Deadline</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                </div>
            </div>
        </AppLayout>
    );
}
