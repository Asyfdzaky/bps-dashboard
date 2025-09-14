import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchableColumn?: string;
    onSearch?: (value: string) => void;
    onToggleColumn?: (columnId: string, visible: boolean) => void;
    // Props khusus untuk approval
    statusFilter?: string;
    onStatusFilterChange?: (value: string) => void;
    onResetFilters?: () => void;
}

export function ApprovalDataTable<TData, TValue>({
    columns,
    data,
    searchableColumn,
    onSearch,
    onToggleColumn,
    statusFilter = "all",
    onStatusFilterChange,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            {/* Mobile Layout */}
            <div className="block sm:hidden space-y-3 py-4">
                {/* Search Input - Full Width on Mobile */}
                {searchableColumn ? (
                    <Input
                        placeholder={`Filter ${searchableColumn}...`}
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="w-full"
                    />
                ) : null}

                {/* Status Filter - Full Width on Mobile */}
                {onStatusFilterChange && (
                    <div className="w-full">
                        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="review">Sedang Review</SelectItem>
                                <SelectItem value="canceled">Ditolak</SelectItem>
                                <SelectItem value="approved">Disetujui</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Column Visibility - Full Width on Mobile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
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

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                    {/* Search Input */}
                    {searchableColumn ? (
                        <Input
                            placeholder={`Filter ${searchableColumn}...`}
                            onChange={(e) => onSearch?.(e.target.value)}
                            className="max-w-sm"
                        />
                    ) : null}

                    {/* Status Filter */}
                    {onStatusFilterChange && (
                        <>
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter Status:</label>
                            <div className="w-full">
                                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="review">Sedang Review</SelectItem>
                                        <SelectItem value="canceled">Ditolak</SelectItem>
                                        <SelectItem value="approved">Disetujui</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>

                {/* Column Visibility Dropdown */}
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

            {/* Table Container with Horizontal Scroll on Mobile */}
            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="whitespace-nowrap">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="whitespace-nowrap">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination - Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 py-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="text-xs sm:text-sm"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="text-xs sm:text-sm"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
