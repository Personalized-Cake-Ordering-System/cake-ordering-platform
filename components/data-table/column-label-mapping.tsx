import { ColumnDef } from "@tanstack/react-table";

// Định nghĩa mapping từ tên cột sang tiếng Việt
export const COLUMN_LABEL_MAPPING: Record<string, string> = {
  id: "Mã",
  name: "Tên",
  description: "Mô tả",
  status: "Trạng thái",
  type: "Loại",
  createdAt: "Ngày tạo",
  updatedAt: "Ngày cập nhật",
  imageUrl: "Hình ảnh",
  phone: "Số điện thoại",
  email: "Email",
  avatarUrl: "Hình ảnh",
  amount: "Giá tiền",
  isActived: "Trạng thái",
  inverseParentService: "Số dịch vụ con",
  select: "Chọn",
  bookingAt: "Thời gian vận chuyển"
};

/**
 * Chuyển đổi tên cột sang label tiếng Việt
 * @param columns - Mảng các column definitions
 * @returns Record<string, string> - Object mapping column ID sang label tiếng Việt
 */
export function generateColumnLabels<TData>(
  columns: ColumnDef<TData, any>[]
): Record<string, string> {
  const labels: Record<string, string> = {};

  columns.forEach((column) => {
    // Kiểm tra id trước
    if (typeof column.id === "string") {
      labels[column.id] = COLUMN_LABEL_MAPPING[column.id] || column.id;
    }
    // Nếu không có id, kiểm tra accessorFn hoặc accessorKey
    else if (
      "accessorKey" in column &&
      typeof column.accessorKey === "string"
    ) {
      labels[column.accessorKey] =
        COLUMN_LABEL_MAPPING[column.accessorKey] || column.accessorKey;
    }
  });

  return labels;
}
