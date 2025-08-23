import { StatsCard } from '@/components/perfomance-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { RoleIndexPageProps } from '@/types/role';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Key, Shield, Users } from 'lucide-react';
import TableRole from './table-role';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Manajemen Role', href: '/manajemen-role' }];

export default function Page() {
    // ← KUNCI: ketik propsnya
    const { roles, filters, can } = usePage<RoleIndexPageProps>().props;

    const { data, setData, post, processing, reset } = useForm({ name: '' });

    const search = (value: string) => {
        router.get(route('roles.index'), { ...filters, q: value }, { preserveState: true, replace: true });
    };

    const onCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('roles.store'), { onSuccess: () => reset() });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Role" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Role</h1>
                        <p className="text-muted-foreground">Kelola role dan permission untuk user. Klik tombol edit untuk mengatur permission.</p>
                    </div>
                    {can?.create && (
                        <div className="flex flex-col gap-2">
                            <form onSubmit={onCreate} className="flex items-center gap-2">
                                <input
                                    className="rounded border px-3 py-2"
                                    placeholder="Nama role baru"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <Button disabled={processing} type="submit">
                                    Tambah Role
                                </Button>
                            </form>
                            <p className="text-xs text-muted-foreground">Setelah membuat role, klik tombol edit untuk mengatur permission</p>
                        </div>
                    )}
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatsCard title="Total Roles" value={roles.total} icon={<Users className="h-4 w-4" />} />
                    <StatsCard
                        title="Roles with Permissions"
                        value={roles.data.filter((role) => role.permissions_count > 0).length}
                        change={`${((roles.data.filter((role) => role.permissions_count > 0).length / roles.total) * 100).toFixed(1)}%`}
                        period="of total roles"
                        icon={<Shield className="h-4 w-4" />}
                    />
                    <StatsCard
                        title="Total Permissions"
                        value={roles.data.reduce((sum, role) => sum + role.permissions_count, 0)}
                        icon={<Key className="h-4 w-4" />}
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
                        onSort={(col, dir) => {
                            router.get(route('roles.index'), { ...filters, sort: col, dir }, { preserveState: true, replace: true });
                        }}
                        onPageChange={(page) => {
                            router.get(route('roles.index'), { ...filters, page }, { preserveState: true, replace: true });
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
