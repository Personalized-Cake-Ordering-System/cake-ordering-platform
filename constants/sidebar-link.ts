import { LucideIcon, ShieldAlert } from "lucide-react";
import { IconType } from "react-icons";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";
import { GrTransaction } from "react-icons/gr";
import { MdMiscellaneousServices } from "react-icons/md";
import {
  FaCalendar,
  FaCalendarCheck,
  FaCalendarPlus,
  FaEnvelope,
  FaEnvelopeOpen,
  FaListAlt,
  FaMoneyBillAlt,
  FaRegListAlt,
  FaRegMoneyBillAlt,
  FaUserCheck,
  FaUserPlus,
} from "react-icons/fa";
import { Settings, User, BadgePlus, FileCog } from "lucide-react";
import { FaMailchimp, FaUserPen } from "react-icons/fa6";
import { TbBrandBooking } from "react-icons/tb";
import { UserRole } from "@/lib/enums/user-role-enum";
import { FaGifts } from "react-icons/fa";
import { MdSettings, MdSettingsApplications } from "react-icons/md";
export interface Route {
  label: string;
  icon: LucideIcon | IconType;
  activeIcon: LucideIcon | IconType;
  href?: string;
  isParent?: boolean;
  children?: Omit<Route, "isParent" | "children">[];
  allowsRoles?: UserRole[];
}

// ko truyền allowRoles là full role dc vô nhé
// code dev để full mốt chặn sau => ví dụ ở bookings route
export const routes: Route[] = [
  {
    label: "Trang chủ",
    icon: GoHome,
    activeIcon: GoHomeFill,
    href: "/dashboard",
    allowsRoles: [UserRole.MANAGER, UserRole.REVIEWER, UserRole.ADMIN],
  },
  // {
  //   label: "Quản lý nhân sự",
  //   icon: FaUserPen,
  //   activeIcon: FaUserCheck,
  //   isParent: true,
  //   allowsRoles: [UserRole.ADMIN, UserRole.MANAGER],
  //   children: [
  //     {
  //       label: "Danh sách nhân sự",
  //       href: "/dashboard/users",
  //       icon: FaUserPen,
  //       activeIcon: FaUserCheck,
  //     },
  //     {
  //       label: "Xét duyệt nhân viên ",
  //       href: "/dashboard/users/accept_employee",
  //       icon: FaUserPen,
  //       activeIcon: FaUserCheck,
  //     },
  //     {
  //       label: "Quản lý ca làm việc",
  //       href: "/dashboard/users/manage_shift",
  //       icon: FaCalendarPlus,
  //       activeIcon: FaCalendarPlus,
  //       allowsRoles: [UserRole.MANAGER],
  //     },
  //   ],
  // },
  {
    label: "Quản lý dịch vụ",
    icon: MdMiscellaneousServices,
    activeIcon: MdMiscellaneousServices,
    isParent: true,
    allowsRoles: [UserRole.MANAGER],
    children: [
      {
        label: "Danh sách dịch vụ",
        href: "/dashboard/services",
        icon: FaRegListAlt,
        activeIcon: FaListAlt,
      },
      {
        label: "Tạo mới dịch vụ",
        href: "/dashboard/services/create_service",
        icon: BadgePlus,
        activeIcon: BadgePlus,
      },
    ],
  },
  {
    label: "Quản lý đơn ",
    icon: TbBrandBooking,
    activeIcon: TbBrandBooking,
    isParent: true,
    allowsRoles: [UserRole.MANAGER, UserRole.REVIEWER],
    children: [
      {
        label: "Đơn đặt bánh",
        href: "/dashboard/bookings",
        icon: FaRegListAlt,
        activeIcon: FaListAlt,
      },
      {
        label: "Đơn khách custom",
        href: "/dashboard/bookings_exception",
        icon: ShieldAlert,
        activeIcon: ShieldAlert,
      },
    ],
    // allowsRoles: [UserRole.MANAGER, UserRole.REVIEWER],
  },

  // {
  //   label: "Quản lý lịch làm việc",
  //   icon: FaCalendar,
  //   activeIcon: FaCalendarCheck,
  //   isParent: true,
  //   children: [
  //     {
  //       label: "Lịch làm việc",
  //       href: "/dashboard/schedule/schedule_list",
  //       icon: FaRegListAlt,
  //       activeIcon: FaListAlt,
  //     },
  //   ],
  // },
  {
    label: "Quản lý giao dịch",
    icon: GrTransaction,
    activeIcon: GrTransaction,
    href: "/dashboard/transactions",
    allowsRoles: [UserRole.MANAGER],
  },
    {
    label: "Danh sách khuyến mãi",
    icon: FaGifts,
    activeIcon: FaGifts,
    href: "/dashboard/promotions",
    allowsRoles: [UserRole.MANAGER],
  },
  {
    label: "Hỗ trợ khách hàng",
    icon: FaRegMoneyBillAlt,
    activeIcon: FaMoneyBillAlt,
    href: "/dashboard/refund",
    allowsRoles: [UserRole.MANAGER],
  },
  // {
  //   label: "Phản hồi",
  //   icon: FaEnvelope,
  //   activeIcon: FaEnvelopeOpen,
  //   href: "/dashboard/mail",
  // },
  {
    label: "Cài đặt",
    icon: Settings,
    activeIcon: Settings,
    href: "/dashboard/settings",
  },
];
