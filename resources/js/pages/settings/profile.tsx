import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import AppHeaderLayout from '@/layouts/app-user-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { hasRole } from '@/types/access';
import { Camera, Edit, GraduationCap, Mail, MapPin, Phone, User, X } from 'lucide-react';
import { useRef, useState } from 'react';

// Types
interface UserProfile {
    nik?: string;
    alamat?: string;
    nomor_hp?: string;
    pendidikan?: string;
}

interface User {
    nama_lengkap: string;
    email: string;
    foto_profil_url?: string;
    profile?: UserProfile;
    roles?: Array<{ name: string }>;
}

interface ProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Profile',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status, user }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const isPenulis = hasRole(auth.user, ['penulis', 'penejemah']);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nama_lengkap: user.nama_lengkap || '',
        email: user.email || '',
        foto_profil: null as File | null,
        nik: user.profile?.nik || '',
        alamat: user.profile?.alamat || '',
        nomor_hp: user.profile?.nomor_hp || '',
        pendidikan: user.profile?.pendidikan || '',
    });

    // Utility functions
    const getInitials = (name: string): string =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    const getAvatarUrl = (): string | null => {
        if (previewImage) return previewImage;
        if (user.foto_profil_url) return `/storage/${user.foto_profil_url}`;
        return null;
    };

    // Event handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Silakan pilih file gambar');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file harus kurang dari 2MB');
            return;
        }

        setData('foto_profil', file);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const removePreviewImage = () => {
        setPreviewImage(null);
        setData('foto_profil', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPreviewImage(null);
                setShowEditDialog(false);
                setData('foto_profil', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    // Profile info items with icons
    const profileItems = [
        { icon: <User className="h-4 w-4 text-blue-600" />, label: 'Nama', value: data.nama_lengkap },
        { icon: <Mail className="h-4 w-4 text-green-600" />, label: 'Email', value: data.email },
        { icon: <Phone className="h-4 w-4 text-purple-600" />, label: 'No. HP', value: data.nomor_hp },
        { icon: <MapPin className="h-4 w-4 text-red-600" />, label: 'Alamat', value: data.alamat },
        { icon: <GraduationCap className="h-4 w-4 text-indigo-600" />, label: 'Pendidikan', value: data.pendidikan },
    ];

    // Same content component
    const profileContent = (
        <div className="max-w-6xl space-y-6">
            {/* Horizontal Profile Card */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-gray-900">Profile Saya</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setShowEditDialog(true)} className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Button>
                            <DeleteUser />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="flex flex-col gap-6 lg:flex-row">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4 lg:w-1/4 lg:items-start">
                            <div className="relative rounded-3xl border">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={getAvatarUrl() || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                                        {getInitials(data.nama_lengkap || 'User')}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="icon"
                                    className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full shadow-lg"
                                    onClick={handleAvatarClick}
                                    type="button"
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                            {previewImage && (
                                <Button size="sm" variant="outline" onClick={removePreviewImage} className="text-xs">
                                    <X className="mr-1 h-3 w-3" />
                                    Hapus foto baru
                                </Button>
                            )}
                        </div>

                        {/* Profile Information Grid */}
                        <div className="flex-1 lg:w-3/4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {profileItems.map((item, index) => (
                                    <div key={index} className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">{item.icon}</div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">{item.label}</p>
                                                <p className="mt-1 text-sm font-medium break-words text-gray-900">{item.value || 'Belum diisi'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Email Verification Notice */}
                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-amber-600" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Email belum diverifikasi</p>
                                    <p className="text-xs text-amber-700">
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="font-medium underline hover:no-underline"
                                        >
                                            Kirim ulang link verifikasi
                                        </Link>
                                    </p>
                                    {status === 'verification-link-sent' && (
                                        <p className="mt-1 text-xs font-medium text-green-600">Link verifikasi telah dikirim.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                            <p className="text-sm font-medium text-green-800">Profile berhasil diperbarui!</p>
                        </div>
                    </Transition>
                </CardContent>
            </Card>

            {/* Edit Profile Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Perbarui informasi profile Anda</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        {/* Photo Section */}
                        <div className="flex items-center gap-6 rounded-lg bg-gray-50 p-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={getAvatarUrl() || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                                    {getInitials(data.nama_lengkap || 'User')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Button type="button" variant="outline" onClick={handleAvatarClick}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Ganti Foto
                                </Button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                {previewImage && (
                                    <Button type="button" variant="outline" size="sm" onClick={removePreviewImage}>
                                        <X className="mr-2 h-3 w-3" />
                                        Hapus
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
                                <Input
                                    id="nama_lengkap"
                                    value={data.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                    className={errors.nama_lengkap ? 'border-destructive' : ''}
                                    required
                                />
                                <InputError message={errors.nama_lengkap} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-destructive' : ''}
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nik">NIK</Label>
                                <Input
                                    id="nik"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    placeholder="Nomor Induk Kependudukan"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nomor_hp">Nomor HP</Label>
                                <Input
                                    id="nomor_hp"
                                    value={data.nomor_hp}
                                    onChange={(e) => setData('nomor_hp', e.target.value)}
                                    placeholder="Nomor telepon"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">Alamat</Label>
                            <Textarea
                                id="alamat"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                placeholder="Alamat lengkap"
                                rows={2}
                            />
                        </div>

                        {/* Education & Professional */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
                                <Input
                                    id="pendidikan"
                                    value={data.pendidikan}
                                    onChange={(e) => setData('pendidikan', e.target.value)}
                                    placeholder="Gelar dan institusi"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-6">
                            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );

    // Conditional layout rendering
    if (isPenulis) {
        return (
            <AppHeaderLayout>
                <Head title="Profile Settings" />
                <SettingsLayout>{profileContent}</SettingsLayout>
            </AppHeaderLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />
            <SettingsLayout>{profileContent}</SettingsLayout>
        </AppLayout>
    );
}
