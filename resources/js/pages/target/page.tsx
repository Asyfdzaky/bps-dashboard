import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KPIGrid } from '@/components/ui/progress-summary';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { BookCopy, TrendingUp, Calendar, Award, BarChart3, Plus, Eye, Edit, Trash2, Search} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useCallback, useMemo } from 'react';

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


export default function TargetPage({ 
    metrics, 
    acquisitionData, 
    monthlyProgressData,
    yearlyTargetData,
    filters,
    userPublisher
}: PageProps) {
    const [selectedMonth, setSelectedMonth] = useState(filters.selectedMonth.toString());
    const [selectedYear, setSelectedYear] = useState(filters.selectedYear.toString());
    const [selectedKategori, setSelectedKategori] = useState(filters.selectedKategori);
    const [isLoading, setIsLoading] = useState(false);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<{tahun: number, penerbit_id: number, nama_penerbit: string} | null>(null);

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


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analisis Target Penerbitan" />
            <div>
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                            Analisis {selectedKategori === 'target_terbit' ? 'Target Terbit' : 'Target Akuisisi'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Perbandingan target dengan realisasi {selectedKategori === 'target_terbit' ? 'penerbitan' : 'akuisisi naskah'}
                        </p>
                    </div>
                    
                    {/* Global Filter and Add Button */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                        <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Kategori:</span>
                            <Select value={selectedKategori} onValueChange={(value) => handleFilterChange('kategori', value)}>
                                    <SelectTrigger className="w-full sm:w-40 bg-background border-input">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="target_terbit">Target Terbit</SelectItem>
                                    <SelectItem value="target_akuisisi">Target Akuisisi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isLoading ? (
                                <Button disabled className="w-full sm:w-auto bg-primary/50 text-primary-foreground cursor-not-allowed">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                                Loading...
                            </Button>
                        ) : (
                                <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Link href="/target/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Add Target</span>
                                        <span className="sm:hidden">Tambah</span>
                                </Link>
                            </Button>
                        )}
                        </div>
                    </div>
                </div>


                <div className="space-y-6 lg:space-y-8">
                    {/* Metrik Utama menggunakan KPIGrid */}
                    <KPIGrid 
                        items={[
                            {
                                title: "Progres Tahunan",
                                value: metrics.progresTahunan,
                                icon: <BookCopy className="h-5 w-5" />,
                                color: "primary",
                                description: "dari target tahunan"
                            },
                            {
                                title: "Pencapaian vs Target (YTD)",
                                value: metrics.pencapaianYTD,
                                icon: <TrendingUp className="h-5 w-5" />,
                                color: "primary",
                                description: `dari ${metrics.targetYTD} target`
                            },
                            {
                                title: "Rata-rata Buku/Bulan",
                                value: metrics.avgBooksPerMonth,
                                icon: <Calendar className="h-5 w-5" />,
                                color: "primary",
                                description: "realisasi per bulan"
                            }
                        ]}
                        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    />

                    {/* Target Tahunan Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <BookCopy className="h-5 w-5 text-primary" />
                                        <span className="hidden sm:inline">
                                        {selectedKategori === 'target_terbit' ? 'Target Terbit Tahunan' : 'Target Akuisisi Tahunan'}
                                        </span>
                                        <span className="sm:hidden">
                                            Target {selectedKategori === 'target_terbit' ? 'Terbit' : 'Akuisisi'}
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Ringkasan {selectedKategori === 'target_terbit' ? 'target terbit' : 'target akuisisi'} dan realisasi per tahun
                                    </CardDescription>
                                </div>
                                
                                {/* Table Filter Controls */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                                    {/* Search - Hide for publisher role */}
                                    {(!userPublisher) && (
                                    <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Cari:</span>
                                        <Input
                                            placeholder="Nama penerbit..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                className="w-full sm:w-48"
                                        />
                                            <Button onClick={handleSearch} size="sm" variant="outline" className="flex-shrink-0">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    )}
                                    
                                    {/* Year Filter */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Tahun:</span>
                                        <Select value={yearFilter} onValueChange={(value) => {
                                            setYearFilter(value);
                                            setCurrentPage(1); // Reset to first page when filtering
                                        }}>
                                            <SelectTrigger className="w-full sm:w-32">
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
                                    {/* Mobile Card View */}
                                    <div className="block lg:hidden space-y-3">
                                        {paginatedData.map((target) => (
                                            <div key={`${target.tahun}-${target.penerbit_id}`} className="border rounded-lg p-4 bg-card">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-foreground">{target.nama_penerbit}</h4>
                                                        <p className="text-sm text-muted-foreground">Tahun {target.tahun}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                                                            <Link href={`/target/${target.tahun}/${target.penerbit_id}/${target.kategori}/detail`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
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
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Target Tahunan</p>
                                                        <p className="font-medium text-primary">
                                                            {target.target_tahunan > 0 ? target.target_tahunan.toLocaleString() : '-'} buku
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Target Bulanan</p>
                                                        <p className="font-medium" style={{ color: 'hsl(var(--chart-2))' }}>
                                                            {target.total_target_bulanan > 0 ? target.total_target_bulanan.toLocaleString() : '-'} buku
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Terpenuhi</p>
                                                        <p className="font-medium" style={{ color: 'hsl(var(--chart-5))' }}>
                                                            {target.total_realisasi.toLocaleString()} buku
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Bulan Aktif</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            {Math.min(target.jumlah_bulan_ada_target, 12)}/12 bulan
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium text-sm ${
                                                            target.persentase_tercapai >= 100
                                                                ? 'text-green-600'
                                                                : target.persentase_tercapai >= 75
                                                                    ? 'text-yellow-600'
                                                                    : 'text-red-600'
                                                        }`}>
                                                            {target.persentase_tercapai.toFixed(1)}%
                                                        </span>
                                                        <div className="flex-1 bg-muted rounded-full h-2">
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden lg:block overflow-x-auto">
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
                                    </div>
                                    
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="text-sm text-muted-foreground text-center sm:text-left">
                                                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
                                            </div>
                                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="px-3"
                                                >
                                                    <span className="hidden sm:inline">Previous</span>
                                                    <span className="sm:hidden">‹</span>
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
                                                                className="w-8 h-8 p-0 sm:w-10 sm:h-10"
                                                                onClick={() => handlePageChange(pageNum)}
                                                            >
                                                                <span className="text-xs sm:text-sm">{pageNum}</span>
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3"
                                                >
                                                    <span className="hidden sm:inline">Next</span>
                                                    <span className="sm:hidden">›</span>
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
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                        <span className="hidden sm:inline">Target Akuisisi</span>
                                        <span className="sm:hidden">Target</span>
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Perbandingan target dengan realisasi per bulan
                                    </CardDescription>
                                </div>
                                
                                {/* Chart Filter */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Bulan:</span>
                                        <Select value={selectedMonth} onValueChange={(value) => handleFilterChange('month', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-full sm:w-32 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Tahun:</span>
                                        <Select value={selectedYear} onValueChange={(value) => handleFilterChange('year', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-full sm:w-24 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                {filteredAcquisitionData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={filteredAcquisitionData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.3} />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                                label={{ value: 'Jumlah', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--muted-foreground)' } }}
                                            />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `${value} buku`,
                                                    name
                                                ]}
                                                labelStyle={{ color: 'var(--foreground)' }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="target_akuisisi"
                                                fill="var(--chart-2)"
                                                name="Target Akuisisi"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="realisasi_terbit"
                                                fill="var(--chart-5)"
                                                name="Realisasi Terbit"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="naskah_masuk"
                                                fill="var(--muted-foreground)"
                                                name="Naskah Masuk"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="naskah_ditolak"
                                                fill="var(--destructive)"
                                                name="Naskah Ditolak"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-12">
                                        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-medium text-muted-foreground">Belum ada data akuisisi</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Data akan muncul setelah ada target dan realisasi
                                        </p>
                                    </div>
                                )}
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
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <Award className="h-5 w-5 text-primary" />
                                        <span className="hidden sm:inline">Progress vs Target Bulanan</span>
                                        <span className="sm:hidden">Progress vs Target</span>
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Perbandingan pencapaian dengan target bulanan
                                    </CardDescription>
                                </div>
                                
                                {/* Chart Filter */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Bulan:</span>
                                        <Select value={selectedMonth} onValueChange={(value) => handleFilterChange('month', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-full sm:w-32 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Tahun:</span>
                                        <Select value={selectedYear} onValueChange={(value) => handleFilterChange('year', value)} disabled={isChartLoading}>
                                            <SelectTrigger className={`w-full sm:w-24 bg-background border-input ${isChartLoading ? 'opacity-50' : ''}`}>
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
                                {filteredMonthlyProgressData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={filteredMonthlyProgressData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.3} />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                                label={{ value: 'Jumlah Buku', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--muted-foreground)' } }}
                                            />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `${value} buku`,
                                                    name
                                                ]}
                                                labelStyle={{ color: 'var(--foreground)' }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="selesai"
                                                fill="var(--chart-2)"
                                                name="Selesai"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="target"
                                                fill="var(--chart-5)"
                                                name="Target"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                <div className="text-center py-12">
                                        <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-medium text-muted-foreground">Belum ada data progress</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                            Data akan muncul setelah ada target dan realisasi
                                    </p>
                                </div>
                                )}
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
                    <DialogContent className="w-[95vw] max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg">Konfirmasi Hapus Target</DialogTitle>
                            <DialogDescription className="text-sm">
                                Apakah Anda yakin ingin menghapus semua target untuk tahun {deleteTarget?.tahun} - {deleteTarget?.nama_penerbit}?
                                <br />
                                <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="w-full sm:w-auto">
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm} className="w-full sm:w-auto">
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
