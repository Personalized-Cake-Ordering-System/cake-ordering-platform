"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { Route, routes } from "@/constants/sidebar-link";

export function NavMain() {
  const pathname = usePathname();

  const isRouteVisible = (route: Route) => {
    // Uncomment when role checking is implemented
    // if (route.allowsRoles && !hasAnyRole(route.allowsRoles)) {
    //   return false;
    // }
    return true;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
      <SidebarMenu>
        {routes.filter(isRouteVisible).map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          if (item.href) {
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    className={cn(
                      "w-full transition-all duration-200 hover:bg-[#FF9E40] hover:text-white hover:shadow",
                      isActive
                        ? "bg-[#FF5722] text-white shadow"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-[#FF9E40] dark:hover:bg-[#D97706]"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-base font-semibold">
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.label}
              asChild
              defaultOpen={item.children?.some(
                (child) => pathname === child.href
              )}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.label}
                    className={cn(
                      "transition-all duration-200 hover:bg-[#FF9E40] hover:text-white hover:shadow",
                      isActive
                        ? "bg-[#FF5722] text-white shadow"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-[#FF9E40] dark:hover:bg-[#D97706]"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-base font-semibold">
                      {item.label}
                    </span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.children?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.label}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            "transition-all font-medium hover:bg-[#FF9E40] hover:text-white",
                            pathname === subItem.href
                              ? "bg-[#FF5722] text-white shadow"
                              : "text-neutral-600 dark:text-neutral-400"
                          )}
                        >
                          <Link href={subItem.href || ""}>
                            <subItem.icon className="w-5 h-5" />
                            <span className="text-sm">{subItem.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
