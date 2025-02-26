"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  MessageSquare,
  Search,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggleAnimate } from "@/components/shared/custom-ui/mode-toggle-animate";
import { cn } from "@/lib/utils";

interface BadgeProps {
  count: number;
}

const NotificationBadge = ({ count }: BadgeProps) => {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-custom-pink dark:bg-custom-pink text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
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
      "py-4 px-4 font-medium text-gray-800 dark:text-gray-200 hover:text-custom-pink dark:hover:text-custom-pink transition-colors duration-200",
      isActive && "border-b-2 border-custom-pink"
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

  const messageCount = 1;
  const wishlistCount = 1;
  const cartCount = 1;

  const navLinks: NavItemType[] = [
    { href: "/", label: "Trang chủ" },
    { href: "/stores", label: "Cửa hàng" },
    { href: "/cakes", label: "Bánh kem" },
    { href: "/discover", label: "Khám phá" },
    { href: "/promotions", label: "Khuyến mãi" },
  ];

  return (
    <>
      {/* Promotion banner */}
      <div className="bg-gradient-pink dark:bg-gradient-pink py-2.5 px-4 text-center text-gray-700 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-800 font-medium">
        <p className="flex items-center justify-center gap-2">
          <span className="inline-block animate-pulse bg-custom-teal text-white text-xs px-2 py-0.5 rounded-full">
            Mới
          </span>
          Giảm giá đến 50% cho các loại bánh mới, chỉ trong thời gian có hạn
        </p>
      </div>

      {/* Main header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative w-10 h-10 mr-2 transition-transform duration-300 group-hover:scale-110">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 rounded-full flex items-center justify-center shadow-md">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold dark:text-white tracking-tight">
                  CusCake
                </h1>
                <p className="text-xs tracking-widest text-gray-500 dark:text-gray-400 font-medium">
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
                  className="w-full bg-white dark:bg-gray-800/70 pr-12 border-gray-300 dark:border-gray-700 focus:ring-custom-pink focus:border-custom-pink transition-all duration-200"
                />
                <Button className="absolute right-0 top-0 bottom-0 rounded-l-none transition-colors duration-200 bg-custom-pink hover:bg-custom-teal text-white">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User navigation */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:block">
                <Link
                  href="/sign-in"
                  className="text-gray-700 hover:text-custom-pink dark:text-gray-300 dark:hover:text-custom-pink transition-colors duration-200 font-medium"
                >
                  Đăng nhập | Đăng ký
                </Link>
              </div>
              <div className="flex items-center space-x-5">
                <ModeToggleAnimate />

                <Link href="/messages" className="relative group">
                  <MessageSquare className="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-custom-pink dark:group-hover:text-custom-pink transition-colors duration-200" />
                  <NotificationBadge count={messageCount} />
                </Link>

                <Link href="/wishlist" className="relative group">
                  <Heart className="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-custom-pink dark:group-hover:text-custom-pink transition-colors duration-200" />
                  <NotificationBadge count={wishlistCount} />
                </Link>

                <Link href="/cart" className="relative group">
                  <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-custom-pink dark:group-hover:text-custom-pink transition-colors duration-200" />
                  <NotificationBadge count={cartCount} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="relative group py-4">
              <button className="flex items-center space-x-1 text-gray-800 dark:text-gray-200 font-medium hover:text-custom-pink dark:hover:text-custom-pink transition-colors duration-200">
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
              {navLinks.map((link) => (
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
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
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
