'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';

type Pagination = { page: number; perPage: number; total: number };
type ServerControls = {
    onSearch?: (q: string) => void;
    onToggleColumn?: (id: string, visible: boolean) => void;
    onSort?: (colId: string, dir: 'asc' | 'desc') => void;
    onPageChange?: (page: number) => void;
};

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: Pagination;
    searchableColumn?: string;
} & ServerControls;

export function DataTable<TData, TValue>({
    columns,
    data,
    pagination,
    searchableColumn,
    onSearch,
    onToggleColumn,
    onSort,
    onPageChange,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // client sorting/filters are disabled so server drives them
        manualSorting: true,
        manualPagination: true,
        pageCount: pagination ? Math.ceil(pagination.total / pagination.perPage) : -1,
    });

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 py-4">
                {searchableColumn ? (
                    <Input placeholder={`Filter ${searchableColumn}...`} onChange={(e) => onSearch?.(e.target.value)} className="max-w-sm" />
                ) : null}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table.getAllLeafColumns().map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                checked={column.getIsVisible()}
                                onCheckedChange={(v) => {
                                    column.toggleVisibility(!!v);
                                    onToggleColumn?.(column.id, !!v);
                                }}
                            >
                                {column.id}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>
                                        {h.isPlaceholder ? null : (
                                            <div
                                                className="cursor-pointer select-none"
                                                onClick={() => {
                                                    if (!h.column.getCanSort?.()) return;
                                                    const dir = h.column.getIsSorted() === 'asc' ? 'desc' : 'asc';
                                                    onSort?.(h.column.id, dir);
                                                }}
                                            >
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination ? (
                <div className="flex items-center justify-end gap-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.perPage))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange?.(Math.max(1, pagination.page - 1))}
                        disabled={pagination.page <= 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange?.(pagination.page + 1)}
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
                    >
                        Next
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
