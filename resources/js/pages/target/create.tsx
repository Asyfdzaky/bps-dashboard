import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Save, Calendar, BookCopy } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Added axios import

type Publisher = {
    penerbit_id: number;
    nama_penerbit: string;
    deskripsi_segmen?: string;
};

type PageProps = {
    publishers: Publisher[];
    userPublisher?: Publisher;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Analisis Target Penerbitan', href: '/target' },
    { title: 'Tambah Target', href: '/target/create' },
];

// Generate months
const availableMonths = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

export default function CreateTargetPage({ publishers, userPublisher }: PageProps) {
    const initialMonthlyTargets = availableMonths.map(month => ({
        bulan: month.value,
        jumlah_target: 0,
    }));

    const { data, setData, post, processing, errors } = useForm({
        penerbit_id: userPublisher ? userPublisher.penerbit_id.toString() : '',
        tahun: '',
        kategori: 'target_terbit',
        jumlah_target_tahunan: 0,
        monthly_targets: initialMonthlyTargets,
    });

    const [availableYearsForPublisher, setAvailableYearsForPublisher] = useState<number[]>([]);
    const [yearlyTargetDisplay, setYearlyTargetDisplay] = useState<string>('0');
    const [monthlyTargetsDisplay, setMonthlyTargetsDisplay] = useState<string[]>(
        new Array(12).fill('0')
    );

    // Fetch available years when publisher changes
    useEffect(() => {
        if (data.penerbit_id) {
            const fetchYears = async () => {
                try {
                    const response = await axios.get(`/target/available-years?penerbit_id=${data.penerbit_id}`);
                    const fetchedYears = response.data.availableYears;
                    setAvailableYearsForPublisher(fetchedYears);
                    if (!data.tahun && fetchedYears.length > 0) {
                        setData('tahun', fetchedYears[0].toString());
                    } else if (!fetchedYears.includes(parseInt(data.tahun))) {
                        // Reset tahun if current selected year is no longer available
                        setData('tahun', fetchedYears.length > 0 ? fetchedYears[0].toString() : '');
                    }
                } catch (error) {
                    console.error('Error fetching available years:', error);
                    setAvailableYearsForPublisher([]);
                    setData('tahun', '');
                }
            };
            fetchYears();
        } else {
            setAvailableYearsForPublisher([]);
            setData('tahun', '');
        }
    }, [data.penerbit_id]);

    const handleYearlyTargetChange = (value: string) => {
        // Remove leading zeros and handle empty string
        const cleanValue = value.replace(/^0+/, '') || '0';
        setYearlyTargetDisplay(cleanValue);
        setData('jumlah_target_tahunan', parseInt(cleanValue) || 0);
    };

    const handleMonthlyTargetChange = (index: number, value: string) => {
        // Remove leading zeros and handle empty string
        const cleanValue = value.replace(/^0+/, '') || '0';
        const newDisplayValues = [...monthlyTargetsDisplay];
        newDisplayValues[index] = cleanValue;
        setMonthlyTargetsDisplay(newDisplayValues);
        
        const newMonthlyTargets = [...data.monthly_targets];
        newMonthlyTargets[index] = { ...newMonthlyTargets[index], jumlah_target: parseInt(cleanValue) || 0 };
        setData('monthly_targets', newMonthlyTargets);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/target');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Target Penerbitan" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tambah Target Penerbitan</h1>
                    <p className="text-muted-foreground">Tetapkan target penerbitan untuk penerbit</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Target Penerbitan Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookCopy className="h-5 w-5" />
                                Data Target
                            </CardTitle>
                            <CardDescription>Pilih penerbit dan tahun untuk menetapkan target</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {userPublisher ? (
                                    <div>
                                        <Label>Penerbit</Label>
                                        <Input value={userPublisher.nama_penerbit} disabled className="font-medium" />
                                    </div>
                                ) : (
                                    <div>
                                        <Label htmlFor="penerbit_id">Penerbit *</Label>
                                        <Select
                                            value={data.penerbit_id}
                                            onValueChange={(value) => setData('penerbit_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih penerbit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {publishers.map((publisher) => (
                                                    <SelectItem
                                                        key={publisher.penerbit_id}
                                                        value={publisher.penerbit_id.toString()}
                                                    >
                                                        {publisher.nama_penerbit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.penerbit_id && <p className="text-sm text-red-500 mt-1">{errors.penerbit_id}</p>}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="tahun">Tahun *</Label>
                                    <Select
                                        value={data.tahun}
                                        onValueChange={(value) => setData('tahun', value)}
                                        disabled={!data.penerbit_id || availableYearsForPublisher.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tahun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableYearsForPublisher.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.tahun && <p className="text-sm text-red-500 mt-1">{errors.tahun}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                <div>
                                    <Label htmlFor="kategori">Kategori Target *</Label>
                                    <Select
                                        value={data.kategori}
                                        onValueChange={(value) => setData('kategori', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="target_terbit">Target Terbit</SelectItem>
                                            <SelectItem value="target_akuisisi">Target Akuisisi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.kategori && <p className="text-sm text-red-500 mt-1">{errors.kategori}</p>}
                                </div>
                                
                                <div>
                                    <Label htmlFor="jumlah_target_tahunan">Target Tahunan *</Label>
                                    <Input
                                        id="jumlah_target_tahunan"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={yearlyTargetDisplay}
                                        onChange={(e) => handleYearlyTargetChange(e.target.value)}
                                        placeholder="Masukkan jumlah target tahunan"
                                    />
                                    {errors.jumlah_target_tahunan && <p className="text-sm text-red-500 mt-1">{errors.jumlah_target_tahunan}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Targets Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {data.kategori === 'target_terbit' ? 'Target Terbit Bulanan' : 'Target Akuisisi Bulanan'}
                            </CardTitle>
                            <CardDescription>
                                Tetapkan target {data.kategori === 'target_terbit' ? 'penerbitan' : 'akuisisi naskah'} untuk setiap bulan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Quarter 1 */}
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></div>
                                        Kuartal 1 (Jan - Mar)
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {data.monthly_targets.slice(0, 3).map((monthTarget, index) => (
                                            <div key={monthTarget.bulan} className="bg-gradient-to-br from-card to-muted/20 rounded-xl p-4 border hover:shadow-md transition-all duration-200" style={{ borderColor: 'hsl(var(--chart-1) / 0.3)' }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-semibold text-foreground">
                                                        {availableMonths.find(m => m.value === monthTarget.bulan)?.label}
                                                    </h5>
                                                    <BookCopy className="h-4 w-4" style={{ color: 'hsl(var(--chart-1))' }} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium" style={{ color: 'hsl(var(--chart-1))' }}>
                                                        Target {data.kategori === 'target_terbit' ? 'Buku' : 'Naskah'}
                                                    </Label>
                                                    <Input
                                                        id={`monthly_target_${monthTarget.bulan}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={monthlyTargetsDisplay[index]}
                                                        onChange={(e) => handleMonthlyTargetChange(index, e.target.value)}
                                                        className="h-10 bg-background border-input focus:border-ring focus:ring-ring/20"
                                                        placeholder="0"
                                                    />
                                                    {errors[`monthly_targets.${index}.jumlah_target`] && 
                                                        <p className="text-xs text-destructive font-medium">{errors[`monthly_targets.${index}.jumlah_target`]}</p>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quarter 2 */}
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }}></div>
                                        Kuartal 2 (Apr - Jun)
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {data.monthly_targets.slice(3, 6).map((monthTarget, index) => (
                                            <div key={monthTarget.bulan} className="bg-gradient-to-br from-card to-muted/20 rounded-xl p-4 border hover:shadow-md transition-all duration-200" style={{ borderColor: 'hsl(var(--chart-2) / 0.3)' }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-semibold text-foreground">
                                                        {availableMonths.find(m => m.value === monthTarget.bulan)?.label}
                                                    </h5>
                                                    <BookCopy className="h-4 w-4" style={{ color: 'hsl(var(--chart-2))' }} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium" style={{ color: 'hsl(var(--chart-2))' }}>
                                                        Target {data.kategori === 'target_terbit' ? 'Buku' : 'Naskah'}
                                                    </Label>
                                                    <Input
                                                        id={`monthly_target_${monthTarget.bulan}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={monthlyTargetsDisplay[index + 3]}
                                                        onChange={(e) => handleMonthlyTargetChange(index + 3, e.target.value)}
                                                        className="h-10 bg-background border-input focus:border-ring focus:ring-ring/20"
                                                        placeholder="0"
                                                    />
                                                    {errors[`monthly_targets.${index + 3}.jumlah_target`] && 
                                                        <p className="text-xs text-destructive font-medium">{errors[`monthly_targets.${index + 3}.jumlah_target`]}</p>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quarter 3 */}
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }}></div>
                                        Kuartal 3 (Jul - Sep)
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {data.monthly_targets.slice(6, 9).map((monthTarget, index) => (
                                            <div key={monthTarget.bulan} className="bg-gradient-to-br from-card to-muted/20 rounded-xl p-4 border hover:shadow-md transition-all duration-200" style={{ borderColor: 'hsl(var(--chart-3) / 0.3)' }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-semibold text-foreground">
                                                        {availableMonths.find(m => m.value === monthTarget.bulan)?.label}
                                                    </h5>
                                                    <BookCopy className="h-4 w-4" style={{ color: 'hsl(var(--chart-3))' }} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium" style={{ color: 'hsl(var(--chart-3))' }}>
                                                        Target {data.kategori === 'target_terbit' ? 'Buku' : 'Naskah'}
                                                    </Label>
                                                    <Input
                                                        id={`monthly_target_${monthTarget.bulan}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={monthlyTargetsDisplay[index + 6]}
                                                        onChange={(e) => handleMonthlyTargetChange(index + 6, e.target.value)}
                                                        className="h-10 bg-background border-input focus:border-ring focus:ring-ring/20"
                                                        placeholder="0"
                                                    />
                                                    {errors[`monthly_targets.${index + 6}.jumlah_target`] && 
                                                        <p className="text-xs text-destructive font-medium">{errors[`monthly_targets.${index + 6}.jumlah_target`]}</p>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quarter 4 */}
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-4))' }}></div>
                                        Kuartal 4 (Okt - Des)
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {data.monthly_targets.slice(9, 12).map((monthTarget, index) => (
                                            <div key={monthTarget.bulan} className="bg-gradient-to-br from-card to-muted/20 rounded-xl p-4 border hover:shadow-md transition-all duration-200" style={{ borderColor: 'hsl(var(--chart-4) / 0.3)' }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-semibold text-foreground">
                                                        {availableMonths.find(m => m.value === monthTarget.bulan)?.label}
                                                    </h5>
                                                    <BookCopy className="h-4 w-4" style={{ color: 'hsl(var(--chart-4))' }} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium" style={{ color: 'hsl(var(--chart-4))' }}>
                                                        Target {data.kategori === 'target_terbit' ? 'Buku' : 'Naskah'}
                                                    </Label>
                                                    <Input
                                                        id={`monthly_target_${monthTarget.bulan}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={monthlyTargetsDisplay[index + 9]}
                                                        onChange={(e) => handleMonthlyTargetChange(index + 9, e.target.value)}
                                                        className="h-10 bg-background border-input focus:border-ring focus:ring-ring/20"
                                                        placeholder="0"
                                                    />
                                                    {errors[`monthly_targets.${index + 9}.jumlah_target`] && 
                                                        <p className="text-xs text-destructive font-medium">{errors[`monthly_targets.${index + 9}.jumlah_target`]}</p>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.penerbit_id || !data.tahun}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Target'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
