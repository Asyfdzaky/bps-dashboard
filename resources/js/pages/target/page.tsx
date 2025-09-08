import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Target, TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react';
import ApexCharts from 'apexcharts';
import { useEffect, useRef, useState, useCallback } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Analisis Target Penerbitan', href: '/target' }];

type Metrics = {
    progresTahunan: number;
    pencapaianYTD: number;
    targetYTD: number;
    avgBooksPerMonth: number;
};

type AcquisitionData = {
    month: string;
    target_akuisisi: number;
    realisasi_terbit: number;
    naskah_masuk: number;
    naskah_ditolak: number;
};

type MonthlyProgressData = {
    month: string;
    target: number;
    selesai: number;
};

type FilterOption = {
    value: number;
    label: string;
};

type PageProps = {
    metrics: Metrics;
    acquisitionData: AcquisitionData[];
    monthlyProgressData: MonthlyProgressData[];
    filters: {
        months: FilterOption[];
        years: FilterOption[];
        selectedMonth: number;
        selectedYear: number;
    };
    userPublisher?: {
        penerbit_id: number;
        nama_penerbit: string;
        deskripsi_segmen?: string;
    };
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

export default function TargetPage({ 
    metrics, 
    acquisitionData, 
    monthlyProgressData,
    filters
}: PageProps) {
    const acquisitionChartRef = useRef<HTMLDivElement>(null);
    const progressChartRef = useRef<HTMLDivElement>(null);
    
    const [selectedMonth, setSelectedMonth] = useState(filters.selectedMonth.toString());
    const [selectedYear, setSelectedYear] = useState(filters.selectedYear.toString());
    const [isLoading, setIsLoading] = useState(false);
    const acquisitionChartInstance = useRef<ApexCharts | null>(null);
    const progressChartInstance = useRef<ApexCharts | null>(null);

    const handleFilterChange = useCallback((type: 'month' | 'year', value: string) => {
        setIsLoading(true);
        
        if (type === 'month') {
            setSelectedMonth(value);
        } else {
            setSelectedYear(value);
        }
        
        // Reload halaman dengan filter baru
        router.get('/target', {
            month: type === 'month' ? parseInt(value) : parseInt(selectedMonth),
            year: type === 'year' ? parseInt(value) : parseInt(selectedYear)
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false)
        });
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        // Destroy existing charts first
        if (acquisitionChartInstance.current) {
            acquisitionChartInstance.current.destroy();
            acquisitionChartInstance.current = null;
        }
        if (progressChartInstance.current) {
            progressChartInstance.current.destroy();
            progressChartInstance.current = null;
        }

        // Chart Target Akuisisi
        if (acquisitionChartRef.current && acquisitionData.length > 0) {
            
            // Filter series yang memiliki data (bukan semua 0)
            const allSeries = [
                {
                    name: 'Target Akuisisi',
                    data: acquisitionData.map(item => item.target_akuisisi),
                    color: chartColors.chart2
                },
                {
                    name: 'Realisasi Terbit',
                    data: acquisitionData.map(item => item.realisasi_terbit),
                    color: chartColors.chart5
                },
                {
                    name: 'Naskah Masuk',
                    data: acquisitionData.map(item => item.naskah_masuk),
                    color: chartColors.muted
                },
                {
                    name: 'Naskah Ditolak',
                    data: acquisitionData.map(item => item.naskah_ditolak),
                    color: '#000000'
                }
            ];
            
            // Hanya ambil series yang memiliki data (total > 0)
            const activeSeries = allSeries.filter(series => 
                series.data.some(value => value > 0)
            );
            
            // Hitung column width berdasarkan jumlah series aktif
            let columnWidth;
            switch(activeSeries.length) {
                case 1: columnWidth = '60%'; break;
                case 2: columnWidth = '70%'; break;
                case 3: columnWidth = '75%'; break;
                default: columnWidth = '80%'; break;
            }
            
            const acquisitionOptions = {
                series: activeSeries,
                chart: {
                    type: 'bar' as const,
                    height: 400,
                    fontFamily: 'Instrument Sans, ui-sans-serif',
                    toolbar: {
                        show: false
                    },
                    background: 'transparent'
                },
                colors: activeSeries.map(series => series.color),
                xaxis: {
                    categories: acquisitionData.map(item => item.month),
                    labels: {
                        style: {
                            fontSize: '13px',
                            colors: chartColors.muted,
                            fontWeight: 500
                        }
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            fontSize: '12px',
                            colors: chartColors.muted
                        },
                        formatter: function(val: number) {
                            return Math.round(val).toString();
                        }
                    },
                    title: {
                        text: 'Jumlah',
                        style: {
                            fontSize: '12px',
                            color: chartColors.muted
                        }
                    }
                },
                legend: {
                    position: 'bottom' as const,
                    fontSize: '14px',
                    fontWeight: 500,
                    labels: {
                        colors: chartColors.muted
                    },
                    markers: {
                        width: 8,
                        height: 8,
                        radius: 4
                    }
                },
                dataLabels: {
                    enabled: false
                },
                plotOptions: {
                    bar: {
                        borderRadius: 6,
                        columnWidth: columnWidth,
                        dataLabels: {
                            position: 'top'
                        }
                    }
                },
                grid: {
                    borderColor: chartColors.muted + '20',
                    strokeDashArray: 3,
                    xaxis: {
                        lines: {
                            show: false
                        }
                    },
                    yaxis: {
                        lines: {
                            show: true
                        }
                    }
                },
                tooltip: {
                    style: {
                        fontSize: '12px'
                    },
                    y: {
                        formatter: function(val: number) {
                            return val + ' buku';
                        }
                    }
                }
            };
            
            acquisitionChartInstance.current = new ApexCharts(acquisitionChartRef.current, acquisitionOptions);
            acquisitionChartInstance.current.render();
        }

        // Chart Progress vs Target Bulanan
        if (progressChartRef.current && monthlyProgressData.length > 0) {
            
            // Filter series yang memiliki data (bukan semua 0)
            const allProgressSeries = [
                {
                    name: 'Selesai',
                    data: monthlyProgressData.map(item => item.selesai),
                    color: chartColors.chart2
                },
                {
                    name: 'Target',
                    data: monthlyProgressData.map(item => item.target),
                    color: chartColors.chart5
                }
            ];
            
            // Hanya ambil series yang memiliki data (total > 0)
            const activeProgressSeries = allProgressSeries.filter(series => 
                series.data.some(value => value > 0)
            );
            
            // Hitung column width berdasarkan jumlah series aktif
            let progressColumnWidth;
            switch(activeProgressSeries.length) {
                case 1: progressColumnWidth = '60%'; break;
                default: progressColumnWidth = '70%'; break;
            }
            
            const progressOptions = {
                series: activeProgressSeries,
                chart: {
                    type: 'bar' as const,
                    height: 400,
                    fontFamily: 'Instrument Sans, ui-sans-serif',
                    toolbar: {
                        show: false
                    },
                    background: 'transparent'
                },
                colors: activeProgressSeries.map(series => series.color),
                xaxis: {
                    categories: monthlyProgressData.map(item => item.month),
                    labels: {
                        style: {
                            fontSize: '13px',
                            colors: chartColors.muted,
                            fontWeight: 500
                        }
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            fontSize: '12px',
                            colors: chartColors.muted
                        },
                        formatter: function(val: number) {
                            return Math.round(val).toString();
                        }
                    },
                    title: {
                        text: 'Jumlah Buku',
                        style: {
                            fontSize: '12px',
                            color: chartColors.muted
                        }
                    }
                },
                legend: {
                    position: 'bottom' as const,
                    fontSize: '14px',
                    fontWeight: 500,
                    labels: {
                        colors: chartColors.muted
                    },
                    markers: {
                        width: 8,
                        height: 8,
                        radius: 4
                    }
                },
                dataLabels: {
                    enabled: false
                },
                plotOptions: {
                    bar: {
                        borderRadius: 6,
                        columnWidth: progressColumnWidth,
                        dataLabels: {
                            position: 'top'
                        }
                    }
                },
                grid: {
                    borderColor: chartColors.muted + '20',
                    strokeDashArray: 3,
                    xaxis: {
                        lines: {
                            show: false
                        }
                    },
                    yaxis: {
                        lines: {
                            show: true
                        }
                    }
                },
                tooltip: {
                    style: {
                        fontSize: '12px'
                    },
                    y: {
                        formatter: function(val: number) {
                            return val + ' buku';
                        }
                    }
                }
            };
            
            progressChartInstance.current = new ApexCharts(progressChartRef.current, progressOptions);
            progressChartInstance.current.render();
        }

        // Cleanup function
        return () => {
            if (acquisitionChartInstance.current) {
                acquisitionChartInstance.current.destroy();
                acquisitionChartInstance.current = null;
            }
            if (progressChartInstance.current) {
                progressChartInstance.current.destroy();
                progressChartInstance.current = null;
            }
        };
    }, [acquisitionData, monthlyProgressData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analisis Target Penerbitan" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analisis Target Penerbitan</h1>
                        <p className="mt-1 text-sm text-gray-600">Perbandingan target dengan realisasi pencapaian</p>
                    </div>
                    
                    {/* Filter Dropdowns */}
                    <div className="flex gap-4 items-center">
                        <Select value={selectedMonth} onValueChange={(value) => handleFilterChange('month', value)} disabled={isLoading}>
                            <SelectTrigger className="w-36 bg-white border-gray-300">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {filters.months.map((month) => (
                                    <SelectItem key={month.value} value={month.value.toString()}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Select value={selectedYear} onValueChange={(value) => handleFilterChange('year', value)} disabled={isLoading}>
                            <SelectTrigger className="w-28 bg-white border-gray-300">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {filters.years.map((year) => (
                                    <SelectItem key={year.value} value={year.value.toString()}>
                                        {year.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                Loading...
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Metrik Utama */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Progres Tahunan</CardTitle>
                                <Target className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{metrics.progresTahunan}%</div>
                                <p className="text-xs text-muted-foreground">dari target tahunan</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pencapaian vs Target (YTD)</CardTitle>
                                <TrendingUp className="h-5 w-5" style={{ color: chartColors.chart5 }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: chartColors.chart5 }}>{metrics.pencapaianYTD}</div>
                                <p className="text-xs text-muted-foreground">dari {metrics.targetYTD} target</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Buku/Bulan</CardTitle>
                                <Calendar className="h-5 w-5" style={{ color: chartColors.chart2 }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: chartColors.chart2 }}>{metrics.avgBooksPerMonth}</div>
                                <p className="text-xs text-muted-foreground">realisasi per bulan</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart Target Akuisisi */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Target Akuisisi
                            </CardTitle>
                            <CardDescription>Perbandingan target dengan realisasi per bulan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div ref={acquisitionChartRef}></div>
                        </CardContent>
                    </Card>

                    {/* Chart Progress vs Target Bulanan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Progress vs Target Bulanan
                            </CardTitle>
                            <CardDescription>Perbandingan pencapaian dengan target bulanan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div ref={progressChartRef}></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
