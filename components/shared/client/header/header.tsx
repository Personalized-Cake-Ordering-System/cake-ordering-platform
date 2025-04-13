"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  Menu,
  MessageSquare,
  Search,
  ShoppingCart,
  Zap,
  User,
  Settings,
  ShoppingBag,
  Store,
  LogOut,
  Bell
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggleAnimate } from "@/components/shared/custom-ui/mode-toggle-animate";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/shared/notification/notification-dropdown";

interface BadgeProps {
  count: number;
}

const NotificationBadge = ({ count }: BadgeProps) => {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-custom-teal dark:bg-custom-teal text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
      {count}
    </span>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavLink = ({ href, children, isActive }: NavLinkProps) => (
  <Link
    href={href}
    className={cn(
      "py-4 px-4 font-medium text-gray-900 dark:text-gray-200 hover:text-custom-teal dark:hover:text-custom-teal transition-colors duration-200",
      isActive && "border-b-2 border-custom-teal text-custom-teal"
    )}
  >
    {children}
  </Link>
);

interface NavItemType {
  href: string;
  label: string;
}

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    router.push('/');
  };

  const messageCount = 1;
  const wishlistCount = 1;
  const cartCount = 1;

  const navLinks: NavItemType[] = [
    { href: "/", label: "Trang chủ" },
    { href: "/stores", label: "Cửa hàng" },
    { href: "/cakes", label: "Bánh kem" },
    { href: "/discover", label: "Khám phá" },
    { href: "/promotions", label: "Khuyến mãi" },
    // { href: "/wallet", label: "Ví" },
    // { href: "/customizeCake", label: "Tùy chỉnh bánh" },
  ];

  const authenticatedNavLinks: NavItemType[] = [
    ...navLinks,
    { href: "/wallet", label: "Ví" },
  ];

  return (
    <>
      {/* Promotion banner */}
      <div className="bg-gradient-to-r from-custom-teal/30 to-custom-pink/30 dark:from-custom-teal/20 dark:to-custom-pink/20 py-2.5 px-4 text-center text-gray-800 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-800 font-medium">
        <p className="flex items-center justify-center gap-2">
          <span className="inline-block animate-pulse bg-custom-teal text-white text-xs px-2 py-0.5 rounded-full font-bold">
            Mới
          </span>
          Giảm giá đến 50% cho các loại bánh mới, chỉ trong thời gian có hạn
        </p>
      </div>

      {/* Main header */}
      <header className="bg-gradient-to-r from-pink-100 to-teal-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative w-10 h-10 mr-2 transition-transform duration-300 group-hover:scale-110">
                <div className="absolute inset-0 bg-gradient-to-br from-custom-teal to-custom-pink dark:from-custom-teal dark:to-custom-pink rounded-full flex items-center justify-center shadow-md">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  CusCake
                </h1>
                <p className="text-xs tracking-widest text-gray-600 dark:text-gray-400 font-medium">
                  SÀN BÁNH NGON
                </p>
              </div>
            </Link>

            {/* Search bar */}
            <div className="hidden md:flex items-center space-x-2 w-1/3">
              <div className="relative w-full group">
                <Input
                  type="text"
                  placeholder="Tìm kiếm bánh..."
                  className="w-full bg-white/90 dark:bg-gray-800/70 pr-12 border-gray-300 dark:border-gray-700 focus:ring-custom-teal focus:border-custom-teal transition-all duration-200"
                />
                <Button className="absolute right-0 top-0 bottom-0 rounded-l-none transition-colors duration-200 bg-custom-teal hover:bg-custom-pink text-white">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User navigation */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3">
                {isLoggedIn ? (
                  <>
                    {/* User dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full flex items-center space-x-2 px-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <User className="h-5 w-5" />
                          <span className="text-sm font-medium">Tài khoản</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" align="end" forceMount>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                          onClick={() => router.push('/profileSetting')}
                        >
                          <User className="h-4 w-4" />
                          <span>Hồ sơ</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                          onClick={() => router.push('/orderHistory')}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>Lịch sử đơn hàng</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Đăng xuất</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Only show notifications, wishlist and cart when logged in */}
                    <NotificationDropdown />
                    <Link href="/wishlist" className="relative group">
                      <Heart className="h-6 w-6 text-gray-800 dark:text-gray-300 group-hover:text-custom-teal dark:group-hover:text-custom-teal transition-colors duration-200" />
                      {/* <NotificationBadge count={wishlistCount} /> */}
                    </Link>
                    <Link href="/cart" className="relative group">
                      <ShoppingCart className="h-6 w-6 text-gray-800 dark:text-gray-300 group-hover:text-custom-teal dark:group-hover:text-custom-teal transition-colors duration-200" />
                      {/* <NotificationBadge count={cartCount} /> */}
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link href="/sign-in">
                      <Button variant="outline" className="border-custom-teal text-custom-teal hover:bg-custom-teal hover:text-white dark:border-custom-teal/70 dark:text-custom-teal/90 dark:hover:bg-custom-teal/20 dark:hover:text-white transition-all">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button variant="default" className="bg-custom-teal hover:bg-custom-pink text-white transition-all">
                        Đăng ký
                      </Button>
                    </Link>
                    <Link href="/bakery-sign-up">
                      <Button variant="ghost" className="flex items-center space-x-2 text-gray-800 dark:text-gray-300 hover:text-custom-teal hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Store className="h-4 w-4" />
                        <span>Đăng ký cửa hàng</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              <ModeToggleAnimate />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-gradient-to-r from-pink-100 to-teal-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="relative group py-4">
              <button className="flex items-center space-x-1 text-gray-900 dark:text-gray-200 font-medium hover:text-custom-teal dark:hover:text-custom-teal transition-colors duration-200">
                <Menu className="h-5 w-5 mr-2" />
                <span>DANH MỤC</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown menu would go here */}
            </div>

            <div className="hidden md:flex items-center">
              {(isLoggedIn ? authenticatedNavLinks : navLinks).map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  isActive={pathname === link.href}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center py-4">
              <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-300 font-medium">
                <Zap className="h-5 w-5 text-custom-teal animate-pulse" />
                <span>Giao hàng miễn phí toàn quốc</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;