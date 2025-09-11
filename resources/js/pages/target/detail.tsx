import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { BookCopy, Calendar, TrendingUp, ArrowLeft, Save, Edit3 } from 'lucide-react';
import { useState } from 'react';

type MonthlyTarget = {
    target_id?: string;
    bulan: number;
    bulan_nama: string;
    jumlah_target: number;
    realisasi: number;
    persentase_tercapai: number;
};

type PageProps = {
    tahun: number;
    penerbit_id: number;
    kategori: string;
    nama_penerbit: string;
    monthlyTargets: MonthlyTarget[];
    targetTahunan?: number;
    isEditMode?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Analisis Target Penerbitan', href: '/target' },
];

export default function TargetDetailPage({ tahun, penerbit_id, kategori, nama_penerbit, monthlyTargets, targetTahunan, isEditMode = false }: PageProps) {
    const [editMode, setEditMode] = useState(isEditMode);
    const [targets, setTargets] = useState<MonthlyTarget[]>(monthlyTargets);

    const { data, setData, put, processing, errors } = useForm({
        target_tahunan: targetTahunan || 0,
        targets: monthlyTargets.map(target => ({
            bulan: target.bulan,
            jumlah_target: target.jumlah_target,
        }))
    });

    const updateTarget = (index: number, value: string | number) => {
        const numericValue = typeof value === 'string' ? (value === '' ? 0 : parseInt(value)) : value;
        const actualValue = isNaN(numericValue) ? 0 : numericValue;
        
        const newTargets = [...targets];
        newTargets[index] = { ...newTargets[index], jumlah_target: actualValue };
        setTargets(newTargets);
        
        // Update form data
        const newFormTargets = [...data.targets];
        newFormTargets[index] = { ...newFormTargets[index], jumlah_target: actualValue };
        setData('targets', newFormTargets);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/target/${tahun}/${penerbit_id}/${kategori}`, {
            onSuccess: () => {
                setEditMode(false);
            }
        });
    };

    const totalTarget = targets.reduce((sum, target) => sum + target.jumlah_target, 0);
    const totalRealisasi = targets.reduce((sum, target) => sum + target.realisasi, 0);
    const overallPercentage = totalTarget > 0 ? (totalRealisasi / totalTarget) * 100 : 0;

    // Update breadcrumbs dynamically
    const dynamicBreadcrumbs = [
        ...breadcrumbs,
        { 
            title: `${editMode ? 'Edit' : 'Detail'} Target ${kategori === 'target_terbit' ? 'Terbit' : 'Akuisisi'} ${tahun} - ${nama_penerbit}`, 
            href: `/target/${tahun}/${penerbit_id}/${kategori}/${editMode ? 'edit' : 'detail'}`,
            icon: ArrowLeft
        }
    ];

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`${editMode ? 'Edit' : 'Detail'} Target ${kategori === 'target_terbit' ? 'Terbit' : 'Akuisisi'} ${tahun} - ${nama_penerbit}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">
                            Target {kategori === 'target_terbit' ? 'Terbit' : 'Akuisisi'} {tahun} - {nama_penerbit}
                        </h1>
                        <p className="text-muted-foreground">
                            {editMode 
                                ? `Edit target ${kategori === 'target_terbit' ? 'penerbitan' : 'akuisisi'} bulanan` 
                                : `Detail target dan realisasi ${kategori === 'target_terbit' ? 'penerbitan' : 'akuisisi'} bulanan`
                            }
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!editMode ? (
                            <Button onClick={() => setEditMode(true)}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit Target
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => {
                                    setEditMode(false);
                                    setTargets(monthlyTargets); // Reset to original data
                                }}>
                                    Batal
                                </Button>
                                <Button onClick={handleSubmit} disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Target {kategori === 'target_terbit' ? 'Terbit' : 'Akuisisi'} Tahunan
                            </CardTitle>
                            <BookCopy className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            {editMode ? (
                                <div className="space-y-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={data.target_tahunan === 0 ? '' : data.target_tahunan}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const numericValue = value === '' ? 0 : parseInt(value) || 0;
                                            setData('target_tahunan', numericValue);
                                        }}
                                        className="text-lg font-bold"
                                        placeholder="Masukkan target tahunan"
                                    />
                                    <p className="text-xs text-muted-foreground">target utama</p>
                                    {errors.target_tahunan && <p className="text-xs text-destructive">{errors.target_tahunan}</p>}
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-primary">{targetTahunan?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-muted-foreground">target utama</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Target Bulanan</CardTitle>
                            <Calendar className="h-5 w-5" style={{ color: 'hsl(var(--chart-2))' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-2))' }}>{totalTarget.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">total per bulan</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Realisasi</CardTitle>
                            <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--chart-5))' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-5))' }}>{totalRealisasi.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">buku terealisasi</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Persentase Tercapai</CardTitle>
                            <Calendar className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${
                                overallPercentage >= 100 ? 'text-green-600' : 
                                overallPercentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {overallPercentage.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">dari target bulanan</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Targets */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Target {kategori === 'target_terbit' ? 'Terbit' : 'Akuisisi'} Bulanan {tahun}
                        </CardTitle>
                        <CardDescription>
                            {editMode 
                                ? `Edit target ${kategori === 'target_terbit' ? 'penerbitan' : 'akuisisi'} untuk setiap bulan` 
                                : `Detail target dan realisasi ${kategori === 'target_terbit' ? 'penerbitan' : 'akuisisi'} per bulan`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Monthly Targets 2 Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Bulan 1-6 */}
                                <div className="space-y-3">
                                    {targets.slice(0, 6).map((target, index) => (
                                        <div key={target.bulan} className="flex items-center justify-between py-3 px-4 bg-card border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-foreground">{target.bulan_nama}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {!editMode && (
                                                    <>
                                                        <div className="text-right">
                                                            <div className="text-xs text-muted-foreground">Realisasi</div>
                                                            <div className="text-sm font-semibold text-primary">{target.realisasi.toLocaleString()}</div>
                                                        </div>
                                                        
                                                        <div className="w-16">
                                                            <div className="w-full bg-muted rounded-full h-1.5 mb-1">
                                                                <div
                                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                                        target.persentase_tercapai >= 100 ? 'bg-green-500' :
                                                                        target.persentase_tercapai >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`}
                                                                    style={{
                                                                        width: `${Math.min(target.persentase_tercapai, 100)}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <div className={`text-xs text-center font-medium ${
                                                                target.persentase_tercapai >= 100 ? 'text-green-600' :
                                                                target.persentase_tercapai >= 75 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                                {target.persentase_tercapai.toFixed(0)}%
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                
                                                <div className="w-16">
                                                    {editMode ? (
                                                        <div>
                                                            <Input
                                                                id={`target_${target.bulan}`}
                                                                type="number"
                                                                min="0"
                                                                value={data.targets[index]?.jumlah_target === 0 ? '' : data.targets[index]?.jumlah_target ?? ''}
                                                                onChange={(e) => updateTarget(index, e.target.value)}
                                                                className="h-8 text-center text-sm"
                                                                placeholder="0"
                                                            />
                                                            {errors[`targets.${index}.jumlah_target`] && 
                                                                <p className="text-xs text-destructive mt-1 text-center">{errors[`targets.${index}.jumlah_target`]}</p>
                                                            }
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <div className="text-xs text-muted-foreground">Target</div>
                                                            <div className="text-base font-bold text-foreground">{target.jumlah_target.toLocaleString()}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Column - Bulan 7-12 */}
                                <div className="space-y-3">
                                    {targets.slice(6, 12).map((target, index) => (
                                        <div key={target.bulan} className="flex items-center justify-between py-3 px-4 bg-card border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-foreground">{target.bulan_nama}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {!editMode && (
                                                    <>
                                                        <div className="text-right">
                                                            <div className="text-xs text-muted-foreground">Realisasi</div>
                                                            <div className="text-sm font-semibold text-primary">{target.realisasi.toLocaleString()}</div>
                                                        </div>
                                                        
                                                        <div className="w-16">
                                                            <div className="w-full bg-muted rounded-full h-1.5 mb-1">
                                                                <div
                                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                                        target.persentase_tercapai >= 100 ? 'bg-green-500' :
                                                                        target.persentase_tercapai >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`}
                                                                    style={{
                                                                        width: `${Math.min(target.persentase_tercapai, 100)}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <div className={`text-xs text-center font-medium ${
                                                                target.persentase_tercapai >= 100 ? 'text-green-600' :
                                                                target.persentase_tercapai >= 75 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                                {target.persentase_tercapai.toFixed(0)}%
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                
                                                <div className="w-16">
                                                    {editMode ? (
                                                        <div>
                                                            <Input
                                                                id={`target_${target.bulan}`}
                                                                type="number"
                                                                min="0"
                                                                value={data.targets[index + 6]?.jumlah_target === 0 ? '' : data.targets[index + 6]?.jumlah_target ?? ''}
                                                                onChange={(e) => updateTarget(index + 6, e.target.value)}
                                                                className="h-8 text-center text-sm"
                                                                placeholder="0"
                                                            />
                                                            {errors[`targets.${index + 6}.jumlah_target`] && 
                                                                <p className="text-xs text-destructive mt-1 text-center">{errors[`targets.${index + 6}.jumlah_target`]}</p>
                                                            }
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <div className="text-xs text-muted-foreground">Target</div>
                                                            <div className="text-base font-bold text-foreground">{target.jumlah_target.toLocaleString()}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {editMode && (
                                <div className="flex justify-end mt-4">
                                    <Button onClick={handleSubmit} disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

