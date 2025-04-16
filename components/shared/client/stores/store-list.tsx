import React from "react";
import { StoreCard } from "./store-card";
import { StoreFilters } from "./store-filter";
import { IBakery } from "@/features/barkeries/types/barkeries-type";
import { useStoreFilters } from "@/hooks/use-store-filter";

interface StoreListProps {
    bakeries: IBakery[];
    cakeCategories: string[];
}

export const StoreList = ({ bakeries, cakeCategories }: StoreListProps) => {
    const { filters } = useStoreFilters();

    // Filter bakeries based on search term
    const filteredBakeries = React.useMemo(() => {
        return bakeries.filter((bakery) => {
            if (!filters.bakeryName) return true;
            return bakery.bakery_name
                .toLowerCase()
                .includes(filters.bakeryName.toLowerCase());
        });
    }, [bakeries, filters.bakeryName]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-24">
                    <StoreFilters cakeCategories={cakeCategories} />
                </div>
            </div>

            {/* Store cards grid */}
            <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBakeries.map((bakery) => (
                        <StoreCard key={bakery.id} bakery={bakery} />
                    ))}
                    {filteredBakeries.length === 0 && (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                Không tìm thấy cửa hàng nào phù hợp với tìm kiếm của bạn.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 