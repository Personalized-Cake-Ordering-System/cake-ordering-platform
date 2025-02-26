import { ReactNode } from "react";
import Footer from "@/components/shared/client/footer/footer";
import Header from "@/components/shared/client/header/header";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
