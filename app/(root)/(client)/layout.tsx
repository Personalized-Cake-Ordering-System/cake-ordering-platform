"use client";

import { ReactNode } from "react";
import Footer from "@/components/shared/client/footer/footer";
import Header from "@/components/shared/client/header/header";
import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: ReactNode }) => {
  const pathName = usePathname();

  const isBuildLayout3D =
    pathName.startsWith("/stores/") && pathName.endsWith("/build");
    
  if (isBuildLayout3D) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
