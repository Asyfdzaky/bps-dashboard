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
};

export default function TableRole({ roles, can, onSearch, onPageChange }: Props) {
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
            header: 'Nama Role',
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
            enableSorting: false,
        },
        {
            accessorKey: 'guard_name',
            header: 'Guard Name',
            cell: ({ row }) => <div className="text-muted-foreground">{row.original.guard_name}</div>,
            enableSorting: false,
        },
        {
            accessorKey: 'permissions_count',
            header: 'Jumlah Permission',
            cell: ({ row }) => <div className="font-medium">{row.original.permissions_count}</div>,
            enableSorting: false,
        },
        {
            accessorKey: 'permissions',
            header: 'Permission',
            cell: ({ row }) => (
                <div>
                    {row.original.permissions_count > 0 ? (
                        <div className="text-sm text-muted-foreground">
                            {row.original.permissions_count} permission{row.original.permissions_count > 1 ? 's' : ''} assigned
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic">No permissions</div>
                    )}
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Dibuat',
            cell: ({ row }) => <div className="text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString('id-ID')}</div>,
            enableSorting: false,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {can.edit && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                            <Link href={route('roles.edit', row.original.id)}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                    {can.delete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(row.original)}
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
                                    Apakah Anda yakin ingin menghapus role "{roleToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
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
