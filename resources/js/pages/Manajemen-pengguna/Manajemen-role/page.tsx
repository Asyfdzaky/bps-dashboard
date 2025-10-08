import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KPICard } from '@/components/ui/progress-summary';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Permission, RoleIndexPageProps } from '@/types/role';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Key, Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import TableRole from './table-role';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Manajemen Role', href: '/manajemen-role' }];

// Function to categorize permissions
const categorizePermissions = (permissions: Permission[]) => {
    const categories: Record<string, Permission[]> = {};

    permissions.forEach((permission) => {
        const parts = permission.name.split(' ');
        const category = parts[1] || 'Other'; // Use second word as category

        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(permission);
    });

    return categories;
};

export default function Page() {
    const { roles, filters, can, permissions, users } = usePage<RoleIndexPageProps>().props;

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Categorize permissions for better organization
    const permissionCategories = useMemo(() => categorizePermissions(permissions), [permissions]);

    const search = (value: string) => {
        router.get(route('roles.index'), { ...filters, q: value }, { preserveState: true, replace: true });
    };

    const onCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('roles.store'), {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        reset();
    };

    const handlePermissionToggle = (permissionName: string) => {
        const currentPermissions = [...data.permissions];
        if (currentPermissions.includes(permissionName)) {
            setData(
                'permissions',
                currentPermissions.filter((p) => p !== permissionName),
            );
        } else {
            setData('permissions', [...currentPermissions, permissionName]);
        }
    };

    const handleSelectAll = () => {
        const allPermissionNames = permissions.map((p) => p.name);
        setData('permissions', allPermissionNames);
    };

    const handleDeselectAll = () => {
        setData('permissions', []);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Role" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Role</h1>
                        <p className="text-muted-foreground">Kelola role dan permission untuk user. Klik tombol edit untuk mengatur permission.</p>
                    </div>
                    {/* {can?.create && (
                        <div className="flex flex-col gap-2">
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Role
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Tambah Role Baru</DialogTitle>
                                        <DialogDescription>
                                            Masukkan nama role dan pilih permission yang akan diberikan. Role ini akan dapat diatur permissionnya.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={onCreate} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nama Role</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="Masukkan nama role"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={errors.name ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label>Permission</Label>
                                                <div className="flex gap-2">
                                                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                                                        Pilih Semua
                                                    </Button>
                                                    <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
                                                        Hapus Semua
                                                    </Button>
                                                </div>
                                            </div>

                                            {Object.keys(permissionCategories).length > 0 ? (
                                                <div className="space-y-4">
                                                    {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
                                                        <div key={category} className="space-y-2">
                                                            <h4 className="text-sm font-medium text-muted-foreground capitalize">
                                                                {category} ({categoryPermissions.length})
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-2 pl-4">
                                                                {categoryPermissions.map((permission) => (
                                                                    <div key={permission.id} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={permission.name}
                                                                            checked={data.permissions.includes(permission.name)}
                                                                            onCheckedChange={() => handlePermissionToggle(permission.name)}
                                                                        />
                                                                        <Label
                                                                            htmlFor={permission.name}
                                                                            className="cursor-pointer text-sm font-normal"
                                                                        >
                                                                            {permission.name}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <Separator />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-4 text-center text-muted-foreground">Tidak ada permission yang tersedia</div>
                                            )}

                                            {errors.permissions && <p className="text-sm text-red-500">{errors.permissions}</p>}
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={handleModalClose}>
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Menyimpan...' : 'Simpan Role'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog> */}
                        {/* </div>
                    )} */}
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <KPICard
                        title="Total Role"
                        value={roles.total}
                        icon={<Users className="h-6 w-6" />}
                        color="primary"
                        description="Jumlah user dengan role penerjemah"
                    />
                    <KPICard
                        title="Total Permission"
                        value={roles.data.reduce((sum, role) => sum + role.permissions_count, 0)}
                        icon={<Key className="h-6 w-6" />}
                        color="primary"
                        description="Jumlah permission yang terpakai di semua role"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <TableRole
                        roles={roles}
                        filters={filters}
                        can={{
                            edit: !!can?.edit,
                            delete: !!can?.delete,
                        }}
                        onSearch={(value) => search(value)}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
