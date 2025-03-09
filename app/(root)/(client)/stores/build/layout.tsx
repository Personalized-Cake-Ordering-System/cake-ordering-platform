import { ReactNode } from "react";

const LayoutBuild3D = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {children}
    </div>
  );
};

export default LayoutBuild3D;
