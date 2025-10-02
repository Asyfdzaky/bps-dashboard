import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DataTable } from '@/components/table-data';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Role, TeamIndexPageProps, UserRow } from '@/types/team';

import { Head, router, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Edit, Languages, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { KPICard } from '@/components/ui/progress-summary';

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
            header: 'Nama Lengkap',
            cell: ({ row }: { row: { original: UserRow } }) => <div className="font-medium">{row.original.nama_lengkap}</div>,
            enableSorting: false,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }: { row: { original: UserRow } }) => <div className="text-muted-foreground">{row.original.email}</div>,
            enableSorting: false,
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({ row }: { row: { original: UserRow } }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles.map((role: Role) => (
                        <Badge key={role.id} variant="outline" className="items-center text-xs">
                            {role.name}
                        </Badge>
                    ))}
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Dibuat',
            cell: ({ row }: { row: { original: UserRow } }) => (
                <div className="text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString('id-ID')}</div>
            ),
            enableSorting: false,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: { row: { original: UserRow } }) => (
                <div className="flex items-center justify-end gap-2">
                    {can?.edit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => startEdit(row.original)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    {can?.delete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(row.original.user_id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
            enableSorting: false,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Manajemen Pengguna</h1>
                        <p className="text-muted-foreground">Kelola penulis dan penerjemah untuk proyek naskah</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {can?.create && (
                            <Button onClick={handleCreateClick} className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah User Baru
                            </Button>
                        )}
                    </div>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <KPICard
                        title="Total Penulis"
                        value={penulisUsers.length}
                        icon={<BookOpen className="h-6 w-6" />}
                        color="primary"
                        description="Jumlah user dengan role penulis"
                    />
                    <KPICard
                        title="Total Penerjemah"
                        value={penerjemahUsers.length}
                        icon={<Languages className="h-6 w-6" />}
                        color="secondary"
                        description="Jumlah user dengan role penerjemah"
                    />
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
                                        className={errors.nama_lengkap ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.nama_lengkap && <p className="text-sm text-destructive">{errors.nama_lengkap}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                                        className={errors.password ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={errors.password_confirmation ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Role</Label>
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
                                {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseCreateDialog}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90">
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
                                        className={errors.nama_lengkap ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.nama_lengkap && <p className="text-sm text-destructive">{errors.nama_lengkap}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Role</Label>
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
                                {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseEditDialog}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90">
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
