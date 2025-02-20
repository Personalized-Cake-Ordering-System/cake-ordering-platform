import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { IUser } from "@/features/users/types/user-type";
import { Row, type Column } from "@tanstack/react-table";

export const nameColumn = {
  accessorKey: "name",
  header: ({ column }: { column: Column<any, unknown> }) => (
    <DataTableColumnHeader column={column} title="Phí dịch vụ" />
  ),
  cell: ({ row }: { row: Row<IUser> }) => {
    return (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("name")}
        </span>
      </div>
    );
  },
  enableSorting: false,
  enableHiding: false,
  filterFn: (
    row: Row<IUser>,
    columnId: string,
    filterValue: IUser[]
  ) => {
    return filterValue.includes(row.getValue(columnId));
  },


} as const;

export default nameColumn;
