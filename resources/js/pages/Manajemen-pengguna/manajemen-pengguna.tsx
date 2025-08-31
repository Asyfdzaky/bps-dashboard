import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DataTable } from '@/components/table-data';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Role, TeamIndexPageProps, UserRow } from '@/types/team';

import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowUpDown, BookOpen, Edit, Languages, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Pengguna',
        href: '/manajemen-pengguna',
    },
];

export default function ManajemenPengguna() {
    const { users, filters, roles, can } = usePage<TeamIndexPageProps>().props;
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nama_lengkap: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
        q: '',
    });

    const search = (value: string) => {
        router.get(route('manajemen-pengguna'), { ...filters, q: value }, { preserveState: true, replace: true });
    };

    const onCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('manajemen-pengguna.store'), {
            onSuccess: () => {
                reset();
                setShowCreateDialog(false);
            },
        });
    };

    const onUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        put(route('manajemen-pengguna.update', editingUser.user_id), {
            onSuccess: () => {
                reset();
                setShowEditDialog(false);
                setEditingUser(null);
            },
        });
    };

    const onDelete = (userId: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            router.delete(route('manajemen-pengguna.destroy', userId), { preserveScroll: true });
        }
    };

    const startEdit = (user: UserRow) => {
        setEditingUser(user);
        setData({
            nama_lengkap: user.nama_lengkap,
            email: user.email,
            password: '',
            password_confirmation: '',
            roles: user.roles.map((r: Role) => r.id),
        });
        setShowEditDialog(true);
    };

    const handleCreateClick = () => {
        reset();
        setShowCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setShowCreateDialog(false);
        reset();
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setEditingUser(null);
        reset();
    };

    const handleRoleAdd = (roleId: string) => {
        const roleIdNum = parseInt(roleId);
        if (!data.roles.includes(roleIdNum)) {
            setData('roles', [...data.roles, roleIdNum]);
        }
    };

    const handleRoleRemove = (roleId: number) => {
        setData(
            'roles',
            data.roles.filter((id) => id !== roleId),
        );
    };

    // Filter users berdasarkan role
    const penulisUsers = users?.data?.filter((user: UserRow) => user.roles.some((role: Role) => role.name === 'penulis')) || [];

    const penerjemahUsers = users?.data?.filter((user: UserRow) => user.roles.some((role: Role) => role.name === 'penerjemah')) || [];

    const columns = [
        {
            accessorKey: 'nama_lengkap',
            header: () => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        const next = filters?.sort === 'nama_lengkap' && filters?.dir === 'asc' ? 'desc' : 'asc';
                        router.get(
                            route('manajemen-pengguna'),
                            { ...filters, sort: 'nama_lengkap', dir: next },
                            { preserveState: true, replace: true },
                        );
                    }}
                >
                    Nama Lengkap <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }: { row: { original: UserRow } }) => <div className="font-medium">{row.original.nama_lengkap}</div>,
        },
        {
            accessorKey: 'email',
            header: () => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        const next = filters?.sort === 'email' && filters?.dir === 'asc' ? 'desc' : 'asc';
                        router.get(route('manajemen-pengguna'), { ...filters, sort: 'email', dir: next }, { preserveState: true, replace: true });
                    }}
                >
                    Email <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }: { row: { original: UserRow } }) => <div className="text-sm text-muted-foreground">{row.original.email}</div>,
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({ row }: { row: { original: UserRow } }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles.map((role: Role) => (
                        <Badge key={role.id} variant="secondary">
                            {role.name}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Dibuat',
            cell: ({ row }: { row: { original: UserRow } }) => (
                <div className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString('id-ID')}</div>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: { row: { original: UserRow } }) => (
                <div className="flex items-center gap-2">
                    {can?.edit && (
                        <Button variant="ghost" size="icon" onClick={() => startEdit(row.original)} title="Edit User">
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    {can?.delete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => onDelete(row.original.user_id)}
                            title="Hapus User"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
                        <p className="text-muted-foreground">Kelola penulis dan penerjemah untuk proyek naskah</p>
                    </div>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Penulis</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{penulisUsers.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Penerjemah</CardTitle>
                            <Languages className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{penerjemahUsers.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {can?.create && (
                        <Button onClick={handleCreateClick}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User Baru
                        </Button>
                    )}
                </div>

                {/* Create User Form */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Tambah User Baru</DialogTitle>
                            <DialogDescription>Buat user baru dengan role penulis atau penerjemah</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onCreate} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                                    <Input
                                        id="nama_lengkap"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        className={errors.nama_lengkap ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.nama_lengkap && <p className="text-sm text-red-500">{errors.nama_lengkap}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Roles</Label>
                                <Select
                                    onValueChange={(value) => {
                                        const role = roles.find((r: Role) => r.name === value);
                                        if (role) {
                                            setData('roles', [role.id]);
                                        }
                                    }}
                                    value=""
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih role (penulis atau penerjemah)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="penulis">Penulis</SelectItem>
                                        <SelectItem value="penerjemah">Penerjemah</SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.roles && <p className="text-sm text-red-500">{errors.roles}</p>}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseCreateDialog}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Tambah User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update informasi user dan role</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-nama_lengkap">Nama Lengkap</Label>
                                    <Input
                                        id="edit-nama_lengkap"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        className={errors.nama_lengkap ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.nama_lengkap && <p className="text-sm text-red-500">{errors.nama_lengkap}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Roles</Label>
                                <Select onValueChange={handleRoleAdd} defaultValue="">
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih role untuk ditambahkan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles
                                            .filter((role: Role) => !data.roles.includes(role.id))
                                            .map((role: Role) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>

                                {/* Display selected roles */}
                                {data.roles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Role yang dipilih:</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {data.roles.map((roleId) => {
                                                const role = roles.find((r: Role) => r.id === roleId);
                                                return role ? (
                                                    <Badge key={role.id} variant="default" className="flex items-center gap-1">
                                                        {role.name}
                                                        <X
                                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                            onClick={() => handleRoleRemove(role.id)}
                                                        />
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {errors.roles && <p className="text-sm text-red-500">{errors.roles}</p>}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseEditDialog}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Update User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Search and Table */}
                <div className="space-y-4">
                    <DataTable
                        columns={columns}
                        data={users?.data || []}
                        searchableColumn="nama_lengkap"
                        pagination={{
                            page: users?.current_page || 1,
                            perPage: users?.per_page || 10,
                            total: users?.total || 0,
                        }}
                        onSearch={search}
                        onPageChange={(page) => {
                            router.get(route('manajemen-pengguna'), { ...filters, page }, { preserveState: true, replace: true });
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
