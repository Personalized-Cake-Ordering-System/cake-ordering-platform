import StoreSection from "@/components/stores/store-section";
import { getBakeries } from "@/features/barkeries/actions/barkeries-action";
import { SearchParams } from "@/types/table";
import React from "react";

export interface IndexPageProps {
  searchParams: SearchParams;
}
const StoresPage = async ({ searchParams }: IndexPageProps) => {
  const [barkeriesPromise] = await Promise.all([getBakeries(searchParams)]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900">
      <StoreSection barkeriesPromise={barkeriesPromise} />
    </div>
  );
};

export default StoresPage;
