import StoresBody from "@/components/store/store-body";
import { getBakeries } from "@/features/barkeries/actions/barkeries-action";
import { SearchParams } from "@/types/table";

export interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

const StoresPage = async ({ searchParams }: IndexPageProps) => {
  // const safeParams: SearchParams = {};

  // if (searchParams) {
  //   for (const [key, value] of Object.entries(searchParams)) {
  //     safeParams[key] = value;
  //   }
  // }

  // const barkeriesResponse = await getBakeries();

  const [barkeriesPromise] = await Promise.all([getBakeries((await searchParams))]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900">
      <StoresBody barkeriesPromise={barkeriesPromise} />
    </div>
  );
};

export default StoresPage;