import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Camera, Mail, Upload, User, X } from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    user,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    user: {
        nama_lengkap: string;
        email: string;
        foto_profil_url?: string;
    };
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nama_lengkap: user.nama_lengkap || '',
        email: user.email || '',
        foto_profil: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Use direct post method for updates
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPreviewImage(null);
                // Don't reset completely, just the file
                setData('foto_profil', null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Silakan pilih file gambar');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file harus kurang dari 2MB');
                return;
            }

            setData('foto_profil', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const removePreviewImage = () => {
        setPreviewImage(null);
        setData('foto_profil', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getAvatarUrl = () => {
        if (previewImage) return previewImage;
        if (user.foto_profil_url) return `/storage/${user.foto_profil_url}`;
        return null;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Profile Header */}
                    <div className="text-center">
                        <div className="relative inline-block">
                            <Avatar
                                className="h-24 w-24 cursor-pointer transition-all hover:ring-4 hover:ring-primary/20"
                                onClick={handleAvatarClick}
                            >
                                <AvatarImage src={getAvatarUrl() || undefined} />
                                <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                                    {getInitials(data.nama_lengkap || 'User')}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full shadow-md"
                                onClick={handleAvatarClick}
                                type="button"
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>

                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                        {previewImage && (
                            <div className="mt-2">
                                <Button size="sm" variant="outline" onClick={removePreviewImage} type="button" className="text-xs">
                                    <X className="mr-1 h-3 w-3" />
                                    Hapus foto baru
                                </Button>
                            </div>
                        )}

                        <p className="mt-2 text-sm text-muted-foreground">Klik avatar untuk mengubah foto profil</p>
                    </div>

                    <Separator />

                    {/* Profile Information Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informasi Profil
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">Perbarui informasi personal dan pengaturan profil Anda</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_lengkap" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Nama Lengkap
                                        </Label>
                                        <Input
                                            id="nama_lengkap"
                                            value={data.nama_lengkap}
                                            onChange={(e) => setData('nama_lengkap', e.target.value)}
                                            className={errors.nama_lengkap ? 'border-destructive focus-visible:ring-destructive' : ''}
                                            required
                                            autoComplete="name"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                        <InputError message={errors.nama_lengkap} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Alamat Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                                            required
                                            autoComplete="username"
                                            placeholder="Masukkan alamat email"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                {/* Email Verification Notice */}
                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-3">
                                                <Mail className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-amber-800 dark:text-amber-200">Verifikasi email diperlukan</h4>
                                                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                                        Alamat email Anda belum diverifikasi.{' '}
                                                        <Link
                                                            href={route('verification.send')}
                                                            method="post"
                                                            as="button"
                                                            className="font-medium underline hover:no-underline"
                                                        >
                                                            Klik di sini untuk mengirim ulang email verifikasi.
                                                        </Link>
                                                    </p>

                                                    {status === 'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                            Link verifikasi baru telah dikirim ke alamat email Anda.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Photo Upload Instructions */}
                                {data.foto_profil && (
                                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                                        Foto profil baru dipilih: <span className="font-medium">{data.foto_profil.name}</span>
                                                    </p>
                                                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                                        Simpan perubahan untuk memperbarui foto profil Anda
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* File Upload Error */}
                                {errors.foto_profil && (
                                    <Card className="border-destructive/20 bg-destructive/5">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                <X className="h-5 w-5 text-destructive" />
                                                <div>
                                                    <p className="text-sm font-medium text-destructive">Error upload foto</p>
                                                    <InputError message={errors.foto_profil} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Submit Button */}
                                <div className="flex items-center gap-4 pt-4">
                                    <Button type="submit" disabled={processing} className="min-w-32">
                                        {processing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Menyimpan...
                                            </div>
                                        ) : (
                                            'Simpan Perubahan'
                                        )}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out duration-300"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in-out duration-300"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                                            </div>
                                            Profil berhasil diperbarui
                                        </div>
                                    </Transition>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Account Deletion Section */}
                    <Card className="border-destructive/20">
                        <CardHeader>
                            <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
                            <p className="text-sm text-muted-foreground">Tindakan yang tidak dapat dibatalkan dan bersifat destruktif</p>
                        </CardHeader>
                        <CardContent>
                            <DeleteUser />
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
