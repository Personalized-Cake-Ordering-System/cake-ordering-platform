import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { IUser } from "@/features/users/types/user-type";
import { Row, type Column } from "@tanstack/react-table";

export const idColumn = {
  accessorKey: "id",
  header: ({ column }: { column: Column<any, unknown> }) => (
    <DataTableColumnHeader column={column} title="Mã nhân viên" />
  ),
  cell: ({ row }: { row: Row<IUser> }) => (
    <div className="w-[80px]">{row.getValue("id")}</div>
  ),
  enableSorting: false,
  enableHiding: false,
} as const;

export default idColumn;
