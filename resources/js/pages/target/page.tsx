import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { BookCopy, TrendingUp, Calendar, Award, BarChart3, Plus, Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import ApexCharts from 'apexcharts';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Analisis Target Penerbitan', href: '/target' }];

type Metrics = {
    progresTahunan: number;
    pencapaianYTD: number;
    targetYTD: number;
    avgBooksPerMonth: number;
};

type AcquisitionData = {
    year: number;
    month: number;
    monthName: string;
    target_akuisisi: number;
    realisasi_terbit: number;
    naskah_masuk: number;
    naskah_ditolak: number;
};

type MonthlyProgressData = {
    year: number;
    month: number;
    monthName: string;
    target: number;
    selesai: number;
};

type FilterOption = {
    value: number;
    label: string;
};

type KategoriOption = {
    value: string;
    label: string;
};

type YearlyTargetData = {
    tahun: number;
    penerbit_id: number;
    kategori: string;
    nama_penerbit: string;
    target_tahunan: number;
    total_target_bulanan: number;
    total_realisasi: number;
    persentase_tercapai: number;
    jumlah_bulan_ada_target: number;
};

// Remove PaginationData type since we're using client-side filtering

type PageProps = {
    metrics: Metrics;
    acquisitionData: AcquisitionData[];
    monthlyProgressData: MonthlyProgressData[];
    yearlyTargetData: YearlyTargetData[];
    filters: {
        months: FilterOption[];
        years: FilterOption[];
        selectedMonth: number;
        selectedYear: number;
        selectedKategori: string;
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
    yearlyTargetData,
    filters
}: PageProps) {
    const acquisitionChartRef = useRef<HTMLDivElement>(null);
    const progressChartRef = useRef<HTMLDivElement>(null);
    
    const [selectedMonth, setSelectedMonth] = useState(filters.selectedMonth.toString());
    const [selectedYear, setSelectedYear] = useState(filters.selectedYear.toString());
    const [selectedKategori, setSelectedKategori] = useState(filters.selectedKategori);
    const [isLoading, setIsLoading] = useState(false);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<{tahun: number, penerbit_id: number, nama_penerbit: string} | null>(null);
    const acquisitionChartInstance = useRef<ApexCharts | null>(null);
    const progressChartInstance = useRef<ApexCharts | null>(null);

    const handleFilterChange = useCallback((type: 'month' | 'year' | 'kategori', value: string) => {
        if (type === 'kategori') {
            setIsLoading(true);
            setSelectedKategori(value);
            
            // Reload page for kategori change (server-side filtering)
            router.get('/target', {
                kategori: value,
            }, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false)
            });
        } else {
            // Client-side filtering for month and year (affects charts only)
            setIsChartLoading(true);
            
            if (type === 'month') {
                setSelectedMonth(value);
            } else if (type === 'year') {
                setSelectedYear(value);
            }
            
            // Simulate loading delay for smooth transition
            setTimeout(() => {
                setIsChartLoading(false);
            }, 300);
        }
    }, []);

    // Client-side filtering functions
    const filteredData = useMemo(() => {
        let filtered = yearlyTargetData;
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(target => 
                target.nama_penerbit.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by year
        if (yearFilter !== 'all') {
            filtered = filtered.filter(target => target.tahun.toString() === yearFilter);
        }
        
        return filtered;
    }, [yearlyTargetData, searchTerm, yearFilter]);

    // Client-side filtering for chart data
    const filteredAcquisitionData = useMemo(() => {
        const selectedYearNum = parseInt(selectedYear);
        const selectedMonthNum = parseInt(selectedMonth);
        
        // Filter data to show 4 months ending at selected month/year
        const baseDate = new Date(selectedYearNum, selectedMonthNum - 1, 1);
        const filteredData = [];
        
        for (let i = 3; i >= 0; i--) {
            const targetDate = new Date(baseDate);
            targetDate.setMonth(targetDate.getMonth() - i);
            
            const targetYear = targetDate.getFullYear();
            const targetMonth = targetDate.getMonth() + 1;
            const targetMonthName = targetDate.toLocaleDateString('en-US', { month: 'short' });
            
            // Find matching data
            const matchingData = acquisitionData.find(item => 
                item.year === targetYear && item.month === targetMonth
            );
            
            if (matchingData) {
                filteredData.push({
                    month: targetMonthName,
                    target_akuisisi: matchingData.target_akuisisi,
                    realisasi_terbit: matchingData.realisasi_terbit,
                    naskah_masuk: matchingData.naskah_masuk,
                    naskah_ditolak: matchingData.naskah_ditolak,
                });
            } else {
                // Add empty data if no matching data found
                filteredData.push({
                    month: targetMonthName,
                    target_akuisisi: 0,
                    realisasi_terbit: 0,
                    naskah_masuk: 0,
                    naskah_ditolak: 0,
                });
            }
        }
        
        return filteredData;
    }, [acquisitionData, selectedYear, selectedMonth]);

    const filteredMonthlyProgressData = useMemo(() => {
        const selectedYearNum = parseInt(selectedYear);
        const selectedMonthNum = parseInt(selectedMonth);
        
        // Filter data to show 4 months ending at selected month/year
        const baseDate = new Date(selectedYearNum, selectedMonthNum - 1, 1);
        const filteredData = [];
        
        for (let i = 3; i >= 0; i--) {
            const targetDate = new Date(baseDate);
            targetDate.setMonth(targetDate.getMonth() - i);
            
            const targetYear = targetDate.getFullYear();
            const targetMonth = targetDate.getMonth() + 1;
            const targetMonthName = targetDate.toLocaleDateString('en-US', { month: 'short' });
            
            // Find matching data
            const matchingData = monthlyProgressData.find(item => 
                item.year === targetYear && item.month === targetMonth
            );
            
            if (matchingData) {
                filteredData.push({
                    month: targetMonthName,
                    target: matchingData.target,
                    selesai: matchingData.selesai,
                });
            } else {
                // Add empty data if no matching data found
                filteredData.push({
                    month: targetMonthName,
                    target: 0,
                    selesai: 0,
                });
            }
        }
        
        return filteredData;
    }, [monthlyProgressData, selectedYear, selectedMonth]);

    // Client-side pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleSearch = useCallback(() => {
        setCurrentPage(1); // Reset to first page on search
    }, []);

    // Reset current page when search term or year filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, yearFilter]);

    const handleDeleteConfirm = () => {
        if (deleteTarget) {
            router.delete(`/target/${deleteTarget.tahun}/${deleteTarget.penerbit_id}`, {
                onSuccess: () => {
                    setDeleteTarget(null);
                },
                onError: () => {
                    setDeleteTarget(null);
                }
            });
        }
    };

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
        if (acquisitionChartRef.current && filteredAcquisitionData.length > 0) {
            
            // Filter series yang memiliki data (bukan semua 0)
            const allSeries = [
                {
                    name: 'Target Akuisisi',
                    data: filteredAcquisitionData.map(item => item.target_akuisisi),
                    color: chartColors.chart2
                },
                {
                    name: 'Realisasi Terbit',
                    data: filteredAcquisitionData.map(item => item.realisasi_terbit),
                    color: chartColors.chart5
                },
                {
                    name: 'Naskah Masuk',
                    data: filteredAcquisitionData.map(item => item.naskah_masuk),
                    color: chartColors.muted
                },
                {
                    name: 'Naskah Ditolak',
                    data: filteredAcquisitionData.map(item => item.naskah_ditolak),
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
                    categories: filteredAcquisitionData.map(item => item.month),
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
        if (progressChartRef.current && filteredMonthlyProgressData.length > 0) {
            
            // Filter series yang memiliki data (bukan semua 0)
            const allProgressSeries = [
                {
                    name: 'Selesai',
                    data: filteredMonthlyProgressData.map(item => item.selesai),
                    color: chartColors.chart2
                },
                {
                    name: 'Target',
                    data: filteredMonthlyProgressData.map(item => item.target),
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
                    categories: filteredMonthlyProgressData.map(item => item.month),
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
    }, [filteredAcquisitionData, filteredMonthlyProgressData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analisis Target Penerbitan" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Analisis {selectedKategori === 'target_terbit' ? 'Target Terbit' : 'Target Akuisisi'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Perbandingan target dengan realisasi {selectedKategori === 'target_terbit' ? 'penerbitan' : 'akuisisi naskah'}
                        </p>
                    </div>
                    
                    {/* Global Filter and Add Button */}
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Kategori:</span>
                            <Select value={selectedKategori} onValueChange={(value) => handleFilterChange('kategori', value)}>
                                <SelectTrigger className="w-40 bg-background border-input">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="target_terbit">Target Terbit</SelectItem>
                                    <SelectItem value="target_akuisisi">Target Akuisisi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isLoading ? (
                            <Button disabled className="bg-primary/50 text-primary-foreground cursor-not-allowed">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                                Loading...
                            </Button>
                        ) : (
                            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Link href="/target/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Target
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>


                <div className="space-y-8">
                    {/* Metrik Utama */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Progres Tahunan</CardTitle>
                                <BookCopy className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{metrics.progresTahunan}%</div>
                                <p className="text-xs text-muted-foreground">dari target tahunan</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pencapaian vs Target (YTD)</CardTitle>
                                <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--chart-5))' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: 'hsl(var(--chart-5))' }}>{metrics.pencapaianYTD}</div>
                                <p className="text-xs text-muted-foreground">dari {metrics.targetYTD} target</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Buku/Bulan</CardTitle>
                                <Calendar className="h-5 w-5" style={{ color: 'hsl(var(--chart-2))' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: 'hsl(var(--chart-2))' }}>{metrics.avgBooksPerMonth}</div>
                                <p className="text-xs text-muted-foreground">realisasi per bulan</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Target Tahunan Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookCopy className="h-5 w-5 text-primary" />
                                        {selectedKategori === 'target_terbit' ? 'Target Terbit Tahunan' : 'Target Akuisisi Tahunan'}
                                    </CardTitle>
                                    <CardDescription>
                                        Ringkasan {selectedKategori === 'target_terbit' ? 'target terbit' : 'target akuisisi'} dan realisasi per tahun
                                    </CardDescription>
                                </div>
                                
                                {/* Table Filter Controls */}
                                <div className="flex items-center gap-4">
                                    {/* Search */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Cari:</span>
                                        <Input
                                            placeholder="Nama penerbit..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-48"
                                        />
                                        <Button onClick={handleSearch} size="sm" variant="outline">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    
                                    {/* Year Filter */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Tahun:</span>
                                        <Select value={yearFilter} onValueChange={(value) => {
                                            setYearFilter(value);
                                            setCurrentPage(1); // Reset to first page when filtering
                                        }}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Semua Tahun" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Tahun</SelectItem>
                                                {filters.years.map((year) => (
                                                    <SelectItem key={year.value} value={year.value.toString()}>
                                                        {year.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {paginatedData && paginatedData.length > 0 ? (
                                <div className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tahun</TableHead>
                                                <TableHead>Penerbit</TableHead>
                                                <TableHead>Target Tahunan</TableHead>
                                                <TableHead>Target Bulanan</TableHead>
                                                <TableHead>Terpenuhi</TableHead>
                                                <TableHead>Persentase</TableHead>
                                                <TableHead>Bulan Aktif</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedData.map((target) => (
                                                <TableRow key={`${target.tahun}-${target.penerbit_id}`}>
                                                    <TableCell className="font-medium text-primary">
                                                        {target.tahun}
                                                    </TableCell>
                                                    <TableCell>{target.nama_penerbit}</TableCell>
                                                    <TableCell>
                                                        <span className="font-medium text-primary">
                                                            {target.target_tahunan > 0 ? target.target_tahunan.toLocaleString() : '-'} 
                                                            {target.target_tahunan > 0 && ' buku'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium" style={{ color: 'hsl(var(--chart-2))' }}>
                                                            {target.total_target_bulanan > 0 ? target.total_target_bulanan.toLocaleString() : '-'}
                                                            {target.total_target_bulanan > 0 && ' buku'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium" style={{ color: 'hsl(var(--chart-5))' }}>
                                                            {target.total_realisasi.toLocaleString()} buku
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span 
                                                                className={`font-medium text-sm ${
                                                                    target.persentase_tercapai >= 100 
                                                                        ? 'text-green-600' 
                                                                        : target.persentase_tercapai >= 75 
                                                                            ? 'text-yellow-600' 
                                                                            : 'text-red-600'
                                                                }`}
                                                            >
                                                                {target.persentase_tercapai.toFixed(1)}%
                                                            </span>
                                                            <div className="w-16 bg-muted rounded-full h-2">
                                                                <div 
                                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                                        target.persentase_tercapai >= 100 
                                                                            ? 'bg-green-500' 
                                                                            : target.persentase_tercapai >= 75 
                                                                                ? 'bg-yellow-500' 
                                                                                : 'bg-red-500'
                                                                    }`}
                                                                    style={{ 
                                                                        width: `${Math.min(target.persentase_tercapai, 100)}%` 
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {Math.min(target.jumlah_bulan_ada_target, 12)}/12 bulan
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="h-8 w-8 p-0"
                                                                asChild
                                                            >
                                                                <Link href={`/target/${target.tahun}/${target.penerbit_id}/${target.kategori}/detail`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="h-8 w-8 p-0"
                                                                asChild
                                                            >
                                                                <Link href={`/target/${target.tahun}/${target.penerbit_id}/${target.kategori}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                                onClick={() => setDeleteTarget({
                                                                    tahun: target.tahun,
                                                                    penerbit_id: target.penerbit_id,
                                                                    nama_penerbit: target.nama_penerbit
                                                                })}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                
                                                {/* Page Numbers */}
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNum;
                                                        if (totalPages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (currentPage <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (currentPage >= totalPages - 2) {
                                                            pageNum = totalPages - 4 + i;
                                                        } else {
                                                            pageNum = currentPage - 2 + i;
                                                        }
                                                        
                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                                size="sm"
                                                                className="w-8 h-8 p-0"
                                                                onClick={() => handlePageChange(pageNum)}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BookCopy className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-medium text-muted-foreground">Belum ada target tahunan</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Mulai dengan menambahkan target penerbitan untuk tahun ini
                                    </p>
                                    <Button className="mt-4" asChild>
                                        <Link href="/target/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Target
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chart Target Akuisisi */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Target Akuisisi
                                    </CardTitle>
                                    <CardDescription>Perbandingan target dengan realisasi per bulan</CardDescription>
                                </div>
                                
                                {/* Chart Filter */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Bulan:</span>
                                        <Select value={selectedMonth} onValueChange={(value) => handleFilterChange('month', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-32 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Tahun:</span>
                                        <Select value={selectedYear} onValueChange={(value) => handleFilterChange('year', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-24 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div ref={acquisitionChartRef}></div>
                                {isChartLoading && (
                                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            <span className="text-sm font-medium text-foreground">Memuat chart...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart Progress vs Target Bulanan */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Progress vs Target Bulanan
                                    </CardTitle>
                                    <CardDescription>Perbandingan pencapaian dengan target bulanan</CardDescription>
                                </div>
                                
                                {/* Chart Filter */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Bulan:</span>
                                        <Select value={selectedMonth} onValueChange={(value) => handleFilterChange('month', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-32 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Tahun:</span>
                                        <Select value={selectedYear} onValueChange={(value) => handleFilterChange('year', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-24 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div ref={progressChartRef}></div>
                                {isChartLoading && (
                                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            <span className="text-sm font-medium text-foreground">Memuat chart...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart Status Naskah */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookCopy className="h-5 w-5" />
                                        Status Naskah
                                    </CardTitle>
                                    <CardDescription>Status naskah yang masuk per bulan</CardDescription>
                                </div>
                                
                                {/* Chart Filter */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Bulan:</span>
                                        <Select value={selectedMonth} onValueChange={(value) => handleFilterChange('month', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-32 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Tahun:</span>
                                        <Select value={selectedYear} onValueChange={(value) => handleFilterChange('year', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-24 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div className="text-center py-12">
                                    <BookCopy className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-medium text-muted-foreground">Chart Status Naskah</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Chart ini akan menampilkan status naskah (diterima/ditolak) per bulan
                                    </p>
                                </div>
                                {isChartLoading && (
                                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            <span className="text-sm font-medium text-foreground">Memuat chart...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus Target</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus semua target untuk tahun {deleteTarget?.tahun} - {deleteTarget?.nama_penerbit}?
                                <br />
                                <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Target
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
