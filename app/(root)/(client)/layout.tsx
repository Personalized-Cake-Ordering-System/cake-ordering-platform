"use client" ;

import { ReactNode } from "react" ;
import Footer from "@/components/shared/client/footer/footer" ;
import Header from "@/components/shared/client/header/header" ;
import { usePathname } from "next/navigation" ;
import ErrorBoundary from '@/app/components/ErrorBoundary' ;
import { useCart } from '@/app/store/useCart' ;
import { CakeConfig } from '@/types/cake' ;

interface CartItem {
  id: string ;
  quantity: number ;
  config: CakeConfig ;
}

const Layout = ({ children }: { children: ReactNode }) => {
  const pathName = usePathname() ;

  const isBuildLayout3D =
    pathName.startsWith("/stores/") && pathName.endsWith("/build") ;

  if (isBuildLayout3D) {
    return <ErrorBoundary>{children}</ErrorBoundary> ;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Header />
        {children}
        <Footer />
      </div>
    </ErrorBoundary>
  ) ;
} ;

export default Layout ;
