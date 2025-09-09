import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import * as React from 'react';

type Step = 1 | 2 | 3 | 4;

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kirim Naskah', href: '/kirim-naskah' }];

// small helpers
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const digitsOnly = (v: string) => v.replace(/\D/g, '');
const isPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

export default function KirimNaskahPage() {
    const [step, setStep] = React.useState<Step>(1);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [confirmOpen, setConfirmOpen] = React.useState(false); // <— NEW: confirm dialog state

    const { data, setData, post, processing, reset } = useForm({
        // Step 1
        penerbit_id: '',
        penerbit_id_2: '',
        // Step 2
        judul_naskah: '',
        sinopsis: '',
        kategori: '',
        kata_kunci: '',
        tebal_naskah: '',
        target_pembaca_primer: '',
        target_pembaca_sekunder: '',
        segmen_pembaca: '',
        selling_point: '',
        bonus_addon: '',
        kelebihan_dibanding_tema_sejenis: '',
        potensi_alih_media: '',
        file_pdf: null as File | null,
        // Step 3
        nama_penulis_1: '',
        nama_penulis_2: '',
        nik_penulis: '',
        alamat: '',
        no_hp: '',
        email: '',
        pendidikan: '',
        kegiatan_aktif: '',
        karya_tulis_media: '',
        judul_buku_lain: '',
        // Step 4
        rencana_promosi: '',
        rencana_penjualan: '',
        media_sosial: '',
        jejaring: '',
    });

    const { publishers = [], flash } = usePage<{
        publishers: Array<{ penerbit_id: number | string; nama_penerbit: string }>;
        flash?: { success?: string };
    }>().props;

    const [successOpen, setSuccessOpen] = React.useState(false);
    React.useEffect(() => {
        if (flash?.success) setSuccessOpen(true);
    }, [flash?.success]);

    // ============ VALIDATION ============
    function validateStep(s: Step) {
        const e: Record<string, string> = {};

        if (s === 1) {
            const selCount = [data.penerbit_id, data.penerbit_id_2].filter(Boolean).length;
            if (!data.penerbit_id) e.penerbit_id = 'Pilih minimal 1 penerbit.';
            if (selCount > 2) e.penerbit_id = 'Maksimal 2 penerbit.';
        }

        if (s === 2) {
            if (!data.judul_naskah) e.judul_naskah = 'Judul naskah wajib diisi.';
            if (!data.sinopsis) e.sinopsis = 'Sinopsis wajib diisi.';
            if (!data.kategori) e.kategori = 'Kategori/Genre wajib diisi.';
            if (!data.segmen_pembaca) e.segmen_pembaca = 'Segmen pembaca wajib dipilih.';
            if (!data.file_pdf) {
                e.file_pdf = 'File PDF wajib diunggah.';
            } else {
                const f = data.file_pdf;
                if (!isPdf(f)) e.file_pdf = 'File harus PDF.';
                if (f.size > MAX_PDF_SIZE) e.file_pdf = 'Ukuran maksimal 50 MB.';
            }
        }

        if (s === 3) {
            if (!data.nama_penulis_1) e.nama_penulis_1 = 'Nama penulis wajib diisi.';
            if (!data.nik_penulis) {
                e.nik_penulis = 'NIK penulis wajib diisi.';
            } else {
                const nik = digitsOnly(data.nik_penulis);
                if (nik.length !== 16) e.nik_penulis = 'NIK harus 16 digit.';
            }
            if (!data.no_hp) {
                e.no_hp = 'Nomor HP wajib diisi.';
            } else {
                const hp = digitsOnly(data.no_hp);
                if (hp.length < 9) e.no_hp = 'Nomor HP tidak valid.';
            }
            if (!data.email) {
                e.email = 'Email wajib diisi.';
            } else if (!isEmail(data.email)) {
                e.email = 'Format email tidak valid.';
            }
        }

        if (s === 4) {
            if (!data.rencana_promosi) e.rencana_promosi = 'Rencana promosi wajib diisi.';
        }

        setErrors((prev) => ({ ...prev, ...e }));
        return Object.keys(e).length === 0;
    }

    // validate all steps before final submit
    function validateAll() {
        setErrors({}); // reset before re-collecting
        const ok1 = validateStep(1);
        const ok2 = validateStep(2);
        const ok3 = validateStep(3);
        const ok4 = validateStep(4);
        return ok1 && ok2 && ok3 && ok4;
    }

    // ============ SUBMIT FLOW ============
    function doSubmit() {
        // final guard (should already be valid)
        if (!validateAll()) return;
        post(route('kirim-naskah.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSuccessOpen(true);
            },
        });
        setConfirmOpen(false);
    }

    // when user clicks final button → validate all, then show confirm dialog
    function handleClickKirim() {
        if (!validateAll()) {
            // jump to the first step that has error for better UX
            const stepHasError = (st: Step) => {
                const keys = Object.keys(errors);
                if (st === 1) return keys.some((k) => ['penerbit_id'].includes(k));
                if (st === 2) return keys.some((k) => ['judul_naskah', 'sinopsis', 'kategori', 'segmen_pembaca', 'file_pdf'].includes(k));
                if (st === 3) return keys.some((k) => ['nama_penulis_1', 'nik_penulis', 'no_hp', 'email'].includes(k));
                if (st === 4) return keys.some((k) => ['rencana_promosi'].includes(k));
                return false;
            };
            const order: Step[] = [1, 2, 3, 4];
            for (const st of order) {
                if (stepHasError(st)) {
                    setStep(st);
                    break;
                }
            }
            return;
        }
        setConfirmOpen(true);
    }

    function handleGoDashboard() {
        setSuccessOpen(false);
        router.visit(route('dashboard'));
    }

    // Helpers for selecting up to 2 publishers as priorities 1 and 2
    const selectedPublishers = React.useMemo(() => {
        return [data.penerbit_id, data.penerbit_id_2].filter(Boolean) as string[];
    }, [data.penerbit_id, data.penerbit_id_2]);

    function priorityOf(id: string): 1 | 2 | null {
        if (data.penerbit_id === id) return 1;
        if (data.penerbit_id_2 === id) return 2;
        return null;
    }

    function togglePublisher(id: string) {
        // already selected → unselect and shift if needed
        if (data.penerbit_id === id) {
            if (data.penerbit_id_2) {
                setData('penerbit_id', data.penerbit_id_2);
                setData('penerbit_id_2', '');
            } else {
                setData('penerbit_id', '');
            }
            return;
        }
        if (data.penerbit_id_2 === id) {
            setData('penerbit_id_2', '');
            return;
        }
        // not selected → add if there's a free slot
        if (!data.penerbit_id) {
            setData('penerbit_id', id);
            return;
        }
        if (!data.penerbit_id_2) {
            setData('penerbit_id_2', id);
            return;
        }
        // both filled → ignore (keep max 2)
    }

    const isFirstStep = step === 1;

    const handleNext = () => {
        // validate current step before moving forward
        if (validateStep(step)) {
            setStep((cur) => Math.min(4, cur + 1) as Step);
        }
    };

    const handlePrev = () => !isFirstStep && setStep((cur) => Math.max(1, cur - 1) as Step);

    function Stepper() {
        const items = [
            { id: 1, name: 'Pilih Penerbit' },
            { id: 2, name: 'Unggah Naskah' },
            { id: 3, name: 'Profil Penulis' },
            { id: 4, name: 'Rencana Promosi' },
        ] as const;

        // Function to check if a step is accessible (clickable)
        const isStepAccessible = (stepId: number): boolean => {
            // Current step is always accessible
            if (stepId === step) return true;

            // Can only go to previous completed steps
            if (stepId < step) return true;

            // For future steps, check if all previous steps are valid
            for (let i = 1; i < stepId; i++) {
                // Temporarily clear errors to get clean validation
                const tempErrors = errors;
                setErrors({});
                const isValid = validateStep(i as Step);
                setErrors(tempErrors);

                if (!isValid) return false;
            }

            return true;
        };

        return (
            <div className="w-full py-2">
                <div className="flex items-center">
                    {items.map((it, idx) => {
                        const isActive = step === it.id;
                        const isDone = step > it.id;
                        const isAccessible = isStepAccessible(it.id);

                        return (
                            <div key={it.id} className="flex flex-1 items-center">
                                <button
                                    type="button"
                                    onClick={() => isAccessible && setStep(it.id as Step)}
                                    disabled={!isAccessible}
                                    className={[
                                        'flex flex-col items-center text-center transition-all',
                                        isAccessible ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50',
                                    ].join(' ')}
                                >
                                    <div
                                        className={[
                                            'flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-all',
                                            isDone
                                                ? 'border-green-600 bg-green-600 text-white'
                                                : isActive
                                                  ? 'border-blue-600 bg-blue-600 text-white'
                                                  : isAccessible
                                                    ? 'border-border bg-background text-muted-foreground hover:border-muted-foreground/70'
                                                    : 'border-muted bg-muted text-muted-foreground/50',
                                        ].join(' ')}
                                    >
                                        {isDone ? '✓' : it.id}
                                    </div>
                                    <div
                                        className={[
                                            'mt-1 text-xs transition-all',
                                            isActive
                                                ? 'font-medium text-foreground'
                                                : isAccessible
                                                  ? 'text-muted-foreground hover:text-foreground'
                                                  : 'text-muted-foreground/50',
                                        ].join(' ')}
                                    >
                                        {it.name}
                                    </div>
                                </button>
                                {idx < items.length - 1 && (
                                    <div
                                        className={['mx-2 h-[2px] flex-1 rounded transition-all', step > it.id ? 'bg-green-600' : 'bg-border'].join(
                                            ' ',
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="w-full px-4 py-4">
                {/* SUCCESS dialog (existing) */}
                <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Berhasil</AlertDialogTitle>
                            <AlertDialogDescription>{flash?.success ?? 'Naskah berhasil dikirim.'}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={handleGoDashboard}>OK</AlertDialogAction>
                            <AlertDialogAction onClick={() => setSuccessOpen(false)}>Tutup</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* CONFIRMATION dialog (NEW) */}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Kirim Naskah?</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div>
                                    Pastikan data sudah benar. Ringkasan singkat:
                                    <ul className="mt-2 list-disc pl-5">
                                        <li>
                                            <b>Judul:</b> {data.judul_naskah || '-'}
                                        </li>
                                        <li>
                                            <b>Penerbit prioritas:</b> {[data.penerbit_id, data.penerbit_id_2].filter(Boolean).length || '-'}
                                        </li>
                                        <li>
                                            <b>Segmen:</b> {data.segmen_pembaca || '-'}
                                        </li>
                                        <li>
                                            <b>Penulis:</b> {data.nama_penulis_1 || '-'}
                                        </li>
                                        <li>
                                            <b>Email:</b> {data.email || '-'}
                                        </li>
                                    </ul>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={doSubmit} disabled={processing}>
                                Ya, Kirim
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className="mb-4">
                    <h1 className="text-2xl font-bold">Kirim Naskah</h1>
                </div>

                <Card className="rounded-2xl">
                    <CardContent className="p-4 sm:p-6">
                        <div className="mb-6 flex justify-center">
                            <div className="w-full max-w-2xl">
                                <Stepper />
                            </div>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Pilih Penerbit (maksimal 2)</Label>
                                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                        {publishers.map((p) => {
                                            const id = String(p.penerbit_id);
                                            const prio = priorityOf(id);
                                            const selected = prio !== null;
                                            return (
                                                <button
                                                    type="button"
                                                    key={id}
                                                    onClick={() => togglePublisher(id)}
                                                    className={[
                                                        'rounded-xl border p-3 text-left transition',
                                                        selected
                                                            ? 'border-blue-600 ring-2 ring-blue-100'
                                                            : 'border-border hover:border-muted-foreground/50',
                                                    ].join(' ')}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium">{p.nama_penerbit}</div>
                                                        {selected && (
                                                            <span
                                                                className={[
                                                                    'ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold',
                                                                    prio === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white',
                                                                ].join(' ')}
                                                            >
                                                                {prio === 1 ? 'Prioritas 1' : 'Prioritas 2'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.penerbit_id && <p className="mt-2 text-xs text-red-600">{errors.penerbit_id}</p>}
                                    {selectedPublishers.length > 2 && <p className="mt-1 text-xs text-red-600">Maksimal 2 penerbit.</p>}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="judul">Judul Naskah</Label>
                                    <Input
                                        id="judul"
                                        className="mt-1"
                                        value={data.judul_naskah}
                                        onChange={(e) => setData('judul_naskah', e.target.value)}
                                    />
                                    {errors.judul_naskah && <p className="mt-1 text-xs text-red-600">{errors.judul_naskah}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="sinopsis">Sinopsis</Label>
                                    <Textarea
                                        id="sinopsis"
                                        className="mt-1"
                                        rows={4}
                                        value={data.sinopsis}
                                        onChange={(e) => setData('sinopsis', e.target.value)}
                                    />
                                    {errors.sinopsis && <p className="mt-1 text-xs text-red-600">{errors.sinopsis}</p>}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="kategori">Kategori/Genre Naskah</Label>
                                        <Input
                                            id="kategori"
                                            className="mt-1"
                                            value={data.kategori}
                                            onChange={(e) => setData('kategori', e.target.value)}
                                        />
                                        {errors.kategori && <p className="mt-1 text-xs text-red-600">{errors.kategori}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="kata_kunci">Kata Kunci</Label>
                                        <Input
                                            id="kata_kunci"
                                            className="mt-1"
                                            value={data.kata_kunci}
                                            onChange={(e) => setData('kata_kunci', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="tebal">Tebal Naskah</Label>
                                        <Input
                                            id="tebal"
                                            className="mt-1"
                                            value={data.tebal_naskah}
                                            onChange={(e) => setData('tebal_naskah', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="segmen">Segmen Pembaca</Label>
                                        <Select value={data.segmen_pembaca} onValueChange={(v) => setData('segmen_pembaca', v)}>
                                            <SelectTrigger id="segmen" className="mt-1">
                                                <SelectValue placeholder="-- Pilih segmen --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="semua">Semua Umur</SelectItem>
                                                <SelectItem value="remaja">Remaja</SelectItem>
                                                <SelectItem value="dewasa">Dewasa</SelectItem>
                                                <SelectItem value="anak">Anak-anak</SelectItem>
                                                <SelectItem value="orangtua">Orang Tua</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.segmen_pembaca && <p className="mt-1 text-xs text-red-600">{errors.segmen_pembaca}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="primer">Target Pembaca Primer</Label>
                                        <Input
                                            id="primer"
                                            className="mt-1"
                                            value={data.target_pembaca_primer}
                                            onChange={(e) => setData('target_pembaca_primer', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sekunder">Target Pembaca Sekunder</Label>
                                        <Input
                                            id="sekunder"
                                            className="mt-1"
                                            value={data.target_pembaca_sekunder}
                                            onChange={(e) => setData('target_pembaca_sekunder', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="selling">Selling Point</Label>
                                    <Textarea
                                        id="selling"
                                        className="mt-1"
                                        rows={3}
                                        value={data.selling_point}
                                        onChange={(e) => setData('selling_point', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="addon">Bonus/Add-on</Label>
                                        <Input
                                            id="addon"
                                            className="mt-1"
                                            value={data.bonus_addon}
                                            onChange={(e) => setData('bonus_addon', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="kelebihan">Kelebihan Dibanding Tema Sejenis</Label>
                                        <Input
                                            id="kelebihan"
                                            className="mt-1"
                                            value={data.kelebihan_dibanding_tema_sejenis}
                                            onChange={(e) => setData('kelebihan_dibanding_tema_sejenis', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="alih">Potensi Alih Media/Alih Wahana</Label>
                                    <Input
                                        id="alih"
                                        className="mt-1"
                                        value={data.potensi_alih_media}
                                        onChange={(e) => setData('potensi_alih_media', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="file">Unggah Naskah (PDF, max 50MB)</Label>
                                    <Input
                                        id="file"
                                        className="mt-1"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            setData('file_pdf', f);
                                        }}
                                    />
                                    {errors.file_pdf && <p className="mt-1 text-xs text-red-600">{errors.file_pdf}</p>}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="penulis1">Nama Penulis (1)</Label>
                                        <Input
                                            id="penulis1"
                                            className="mt-1"
                                            value={data.nama_penulis_1}
                                            onChange={(e) => setData('nama_penulis_1', e.target.value)}
                                        />
                                        {errors.nama_penulis_1 && <p className="mt-1 text-xs text-red-600">{errors.nama_penulis_1}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="penulis2">Nama Penulis (2) opsional</Label>
                                        <Input
                                            id="penulis2"
                                            className="mt-1"
                                            value={data.nama_penulis_2}
                                            onChange={(e) => setData('nama_penulis_2', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="nik">NIK Penulis</Label>
                                        <Input
                                            id="nik"
                                            className="mt-1"
                                            value={data.nik_penulis}
                                            onChange={(e) => setData('nik_penulis', e.target.value)}
                                        />
                                        {errors.nik_penulis && <p className="mt-1 text-xs text-red-600">{errors.nik_penulis}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="hp">Nomor HP</Label>
                                        <Input id="hp" className="mt-1" value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} />
                                        {errors.no_hp && <p className="mt-1 text-xs text-red-600">{errors.no_hp}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" className="mt-1" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="pendidikan">Pendidikan</Label>
                                        <Input
                                            id="pendidikan"
                                            className="mt-1"
                                            value={data.pendidikan}
                                            onChange={(e) => setData('pendidikan', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="alamat">Alamat</Label>
                                    <Textarea
                                        id="alamat"
                                        className="mt-1"
                                        rows={3}
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="kegiatan">Kegiatan yang Aktif Dilakukan</Label>
                                    <Textarea
                                        id="kegiatan"
                                        className="mt-1"
                                        rows={3}
                                        value={data.kegiatan_aktif}
                                        onChange={(e) => setData('kegiatan_aktif', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="karya">Karya Tulis (Media Online/Cetak)</Label>
                                    <Textarea
                                        id="karya"
                                        className="mt-1"
                                        rows={3}
                                        value={data.karya_tulis_media}
                                        onChange={(e) => setData('karya_tulis_media', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="judul_lain">Judul Buku Lain yang Pernah Ditulis/Diterjemahkan</Label>
                                    <Textarea
                                        id="judul_lain"
                                        className="mt-1"
                                        rows={3}
                                        value={data.judul_buku_lain}
                                        onChange={(e) => setData('judul_buku_lain', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="promo">Rencana Kegiatan Promosi</Label>
                                    <Textarea
                                        id="promo"
                                        className="mt-1"
                                        rows={6}
                                        placeholder={['Segmen:', 'Bentuk/Konten:', 'Channel/Platform:', 'Waktu pelaksanaan:'].join('\n')}
                                        value={data.rencana_promosi}
                                        onChange={(e) => setData('rencana_promosi', e.target.value)}
                                    />
                                    {errors.rencana_promosi && <p className="mt-1 text-xs text-red-600">{errors.rencana_promosi}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="jual">Rencana Kegiatan Penjualan</Label>
                                    <Textarea
                                        id="jual"
                                        className="mt-1"
                                        rows={4}
                                        placeholder="Seminar offline, webinar, workshop, dsb. Perkiraan jumlah pembelian…"
                                        value={data.rencana_penjualan}
                                        onChange={(e) => setData('rencana_penjualan', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="sosmed">Media Sosial (link + jumlah follower + engagement)</Label>
                                    <Textarea
                                        id="sosmed"
                                        className="mt-1"
                                        rows={4}
                                        placeholder="- Instagram: link, follower, engagement
  - TikTok: link, follower, engagement
  - YouTube: link, subscriber, engagement"
                                        value={data.media_sosial}
                                        onChange={(e) => setData('media_sosial', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="jejaring">Jejaring</Label>
                                    <Textarea
                                        id="jejaring"
                                        className="mt-1"
                                        rows={3}
                                        placeholder="Komunitas/organisasi/jejaring relevan yang dimiliki"
                                        value={data.jejaring}
                                        onChange={(e) => setData('jejaring', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between">
                            <Button variant="outline" onClick={handlePrev} disabled={isFirstStep || processing}>
                                Kembali
                            </Button>

                            {step < 4 ? (
                                <Button onClick={handleNext} disabled={processing}>
                                    Lanjut
                                </Button>
                            ) : (
                                <Button onClick={handleClickKirim} disabled={processing}>
                                    Kirim Naskah
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
