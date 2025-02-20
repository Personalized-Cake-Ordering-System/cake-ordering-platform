"use client"

import * as React from "react"
import Link from "next/link"
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/types/table"
import { Cross2Icon, PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterableColumns?: DataTableFilterableColumn<TData>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
  newRowLink?: string
  columnLabels?: Record<string, string>
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  columnLabels,
  newRowLink,
  deleteRowsAction,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [isPending, startTransition] = React.useTransition()

  const handleGlobalSearch = React.useCallback(
    (value: string) => {
      searchableColumns.forEach((column) => {
        const columnId = String(column.id)
        table.getColumn(columnId)?.setFilterValue(value)
      })
    },
    [searchableColumns, table]
  )

  const currentSearchValue = searchableColumns.length > 0
    ? (table.getColumn(String(searchableColumns[0].id))?.getFilterValue() as string) ?? ""
    : ""

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns.length > 0 && (
          <Input
            placeholder="Tìm kiếm..."
            value={currentSearchValue}
            onChange={(event) => handleGlobalSearch(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : "")}
                  title={column.title}
                  options={column.options}
                />
              )
          )}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Xóa filter
            <Cross2Icon className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {deleteRowsAction && table.getSelectedRowModel().rows.length > 0 ? (
          <Button
            aria-label="Delete selected rows"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={(event) => {
              startTransition(() => {
                table.toggleAllPageRowsSelected(false)
                deleteRowsAction(event)
              })
            }}
            disabled={isPending}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Xóa 
          </Button>
        ) : newRowLink ? (
          <Link aria-label="Create new row" href={newRowLink}>
            <div
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "h-8",
                })
              )}
            >
              <PlusCircledIcon className="mr-2 size-4" aria-hidden="true" />
              Tạo mới
            </div>
          </Link>
        ) : null}
        <DataTableViewOptions table={table} columnLabels={columnLabels} />
      </div>
    </div>
  )
}