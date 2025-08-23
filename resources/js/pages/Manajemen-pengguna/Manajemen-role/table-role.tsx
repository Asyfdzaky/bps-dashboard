'use client';

import { DataTable } from '@/components/table-data';
import { Button } from '@/components/ui/button';
import type { Paginated, RoleIndexFilters, RoleRow } from '@/types/role';
import { Link, router } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';

type Props = {
    roles: Paginated<RoleRow>;
    filters: RoleIndexFilters;
    can: { edit: boolean; delete: boolean };
    onSearch: (q: string) => void;
    onSort: (colId: 'name' | 'guard_name' | 'permissions_count' | 'created_at', dir: 'asc' | 'desc') => void;
    onPageChange: (page: number) => void;
};

export default function TableRole({ roles, filters, can, onSearch, onSort, onPageChange }: Props) {
    // Debug logging to help identify data structure issues
    console.log('TableRole received props:', { roles, filters, can });
    console.log('Roles data structure:', {
        hasData: !!roles?.data,
        dataLength: roles?.data?.length,
        hasLinks: !!roles?.links,
        linksLength: roles?.links?.length,
    });

    const columns: ColumnDef<RoleRow>[] = [
        {
            accessorKey: 'name',
            header: () => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        const next = filters?.sort === 'name' && filters?.dir === 'asc' ? 'desc' : 'asc';
                        onSort('name', next);
                    }}
                >
                    Nama Role <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'guard_name',
            header: () => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        const next = filters?.sort === 'guard_name' && filters?.dir === 'asc' ? 'desc' : 'asc';
                        onSort('guard_name', next);
                    }}
                >
                    Guard Name <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.guard_name}</div>,
        },
        {
            accessorKey: 'permissions_count',
            header: () => (
                <div className="flex items-center justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const next = filters?.sort === 'permissions_count' && filters?.dir === 'asc' ? 'desc' : 'asc';
                            onSort('permissions_count', next);
                        }}
                    >
                        Jumlah Permission <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-medium">{row.original.permissions_count}</div>
                    <div className="text-xs text-muted-foreground">permissions</div>
                </div>
            ),
        },
        {
            accessorKey: 'permissions',
            header: 'Permission',
            cell: ({ row }) => (
                <div className="max-w-xs">
                    {row.original.permissions_count > 0 ? (
                        <div className="text-sm text-muted-foreground">
                            {row.original.permissions_count} permission{row.original.permissions_count > 1 ? 's' : ''} assigned
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic">No permissions</div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Dibuat',
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString('id-ID')}</div>,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    {can.edit && (
                        <>
                            <Link
                                href={route('roles.edit', row.original.id)}
                                className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                title="Edit Role & Permissions"
                            >
                                <Edit className="h-4 w-4" />
                                Kelola Permission
                            </Link>
                            
                        </>
                    )}
                    {can.delete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                                try {
                                    if (confirm(`Hapus role "${row.original.name}"?`)) {
                                        router.delete(route('roles.destroy', row.original.id), { preserveScroll: true });
                                    }
                                } catch (error) {
                                    console.error('Error deleting role:', error);
                                    alert('Error deleting role. Please try again.');
                                }
                            }}
                            title="Hapus Role"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="w-full">
            <DataTable
                columns={columns}
                data={roles.data}
                searchableColumn="name"
                pagination={{
                    page: roles.current_page,
                    perPage: roles.per_page,
                    total: roles.total,
                }}
                onSearch={onSearch}
                onSort={(colId, dir) => onSort(colId as 'name' | 'guard_name' | 'permissions_count' | 'created_at', dir as 'asc' | 'desc')}
                onPageChange={onPageChange}
            />
        </div>
    );
}
