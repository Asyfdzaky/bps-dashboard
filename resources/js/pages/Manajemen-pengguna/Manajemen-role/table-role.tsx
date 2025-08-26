'use client';

import { DataTable } from '@/components/table-data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Paginated, RoleIndexFilters, RoleRow } from '@/types/role';
import { Link, router } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Props = {
    roles: Paginated<RoleRow>;
    filters: RoleIndexFilters;
    can: { edit: boolean; delete: boolean };
    onSearch: (q: string) => void;
    onSort: (colId: 'name' | 'guard_name' | 'permissions_count' | 'created_at', dir: 'asc' | 'desc') => void;
    onPageChange: (page: number) => void;
};

export default function TableRole({ roles, can, onSearch, onSort, onPageChange }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<RoleRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (role: RoleRow) => {
        setRoleToDelete(role);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;

        setIsDeleting(true);    
        try {
            router.delete(route('roles.destroy', roleToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setRoleToDelete(null);
                    setIsDeleting(false);
                },
                onError: () => {
                    setIsDeleting(false);
                },
                onFinish: () => {
                    // Ensure state is reset even if there are issues
                    setIsDeleting(false);
                },
            });
        } catch (error) {
            console.error('Error deleting role:', error);
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
        setIsDeleting(false);
    };

    // Reset states when dialog closes
    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            setDeleteDialogOpen(false);
            setRoleToDelete(null);
            setIsDeleting(false);
        }
    };

    const columns: ColumnDef<RoleRow>[] = [
        {
            accessorKey: 'name',
            header: () => <div className="flex items-center justify-center">Nama Role</div>,
            cell: ({ row }) => <div className="text-center font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'guard_name',
            header: () => <div className="flex items-center justify-center">Guard Name</div>,
            cell: ({ row }) => <div className="text-center text-sm text-muted-foreground">{row.original.guard_name}</div>,
        },
        {
            accessorKey: 'permissions_count',
            header: () => <div className="flex items-center justify-center">Jumlah Permission</div>,
            cell: ({ row }) => <div className="text-center font-medium">{row.original.permissions_count}</div>,
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
                            </Link>
                        </>
                    )}
                    {can.delete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(row.original)}
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <DialogTitle>Hapus Role</DialogTitle>
                                <DialogDescription>
                                    Apakah Anda yakin ingin menghapus role ini? Tindakan ini tidak dapat dibatalkan.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                            {isDeleting ? 'Menghapus...' : 'Hapus Role'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
