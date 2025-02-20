import * as React from "react";
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/types/table";
import {
  flexRender,
  type ColumnDef,
  type Table as TanstackTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableFloatingBar } from "./data-table-floating-bar";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
  dataTable: TanstackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  searchableColumns?: DataTableSearchableColumn<TData>[];
  filterableColumns?: DataTableFilterableColumn<TData>[];
  advancedFilter?: boolean;
  floatingBarContent?: React.ReactNode | null;
  columnLabels?: Record<string, string>;
  newRowLink?: string;
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>;
}

export function DataTable<TData, TValue>({
  dataTable,
  columns,
  searchableColumns = [],
  filterableColumns = [],
  advancedFilter = false,
  columnLabels,
  newRowLink,
  floatingBarContent,
  deleteRowsAction,
}: DataTableProps<TData, TValue>) {
  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={dataTable}
        filterableColumns={filterableColumns}
        searchableColumns={searchableColumns}
        deleteRowsAction={deleteRowsAction}
        columnLabels={columnLabels}
        newRowLink={newRowLink}
      />
      <div className="rounded-md border border-black dark:border-gray-600">
        <div className="overflow-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              {dataTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-gray-900 dark:text-gray-100 font-bold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {dataTable.getRowModel().rows?.length ? (
                dataTable.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-gray-800 dark:text-gray-200 font-semibold"
                      >
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
                    className="h-24 text-center text-gray-600 dark:text-gray-300"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={dataTable} />

    
          {dataTable.getFilteredSelectedRowModel().rows.length > 0 &&
            floatingBarContent}
      </div>
    </div>
  );
}
