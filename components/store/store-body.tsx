"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Search } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { StoreFilters } from "@/components/shared/client/stores/store-filter";
import { useStoreFilters } from "@/hooks/use-store-filter";
import { getBakeries } from "@/features/barkeries/actions/barkeries-action";
import { IBakery } from "@/features/barkeries/types/barkeries-type";
import { StoreCard } from "@/components/shared/client/stores/store-card";
import { ApiListResponse } from "@/lib/api/api-handler/generic";

// Danh sách các loại bánh cho filter
const cakeCategories = [
    "Bánh mì",
    "Bánh kem",
    "Bánh ngọt",
    "Bánh mặn",
    "Bánh trung thu",
    "Bánh chay",
    "Bánh sinh nhật",
    "Bánh theo mùa",
];

interface StoreSectionProps {
    barkeriesPromise: ApiListResponse<IBakery>;
}

const StoresBody = ({ barkeriesPromise }: StoreSectionProps) => {

    const {
        filters,
        isFilterOpen,
        activeFiltersCount,
        setIsFilterOpen,
        setSortBy,
        setSearchQuery,
        setBakeryName,
    } = useStoreFilters();

    const [bakeries, setBakeries] = useState<IBakery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 1,
    });

    // Track if initial data has been loaded
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    // Process the initial barkeriesPromise to extract data
    useEffect(() => {
        console.log("Processing barkeriesPromise in useEffect:", barkeriesPromise);

        if (barkeriesPromise?.payload && Array.isArray(barkeriesPromise.payload)) {
            console.log("Bakeries data from promise payload:", barkeriesPromise.payload);
            setBakeries(barkeriesPromise.payload);

            if (barkeriesPromise.meta_data) {
                setPagination({
                    currentPage: barkeriesPromise.meta_data.page_index || 0,
                    totalPages: barkeriesPromise.meta_data.total_pages_count || 1,
                });
            }

            setLoading(false);
            setInitialDataLoaded(true);
        } else {
            console.log("Invalid or missing data in barkeriesPromise:", barkeriesPromise);
            setError("Invalid data format received from server");
            setLoading(false);
        }
    }, [barkeriesPromise]);

    const fetchBakeries = useCallback(async () => {
        console.log("Fetching bakeries with filters:", filters);
        setLoading(true);
        try {
            const searchParams: Record<string, string | string[]> = {
                "page-index": pagination.currentPage.toString(),
                "page-size": "10",
            };

            // Add bakery name filter
            if (filters.bakeryName) {
                searchParams["bakery-name"] = filters.bakeryName;
            }

            // Add category filters
            if (filters.selectedCategories && filters.selectedCategories.length > 0) {
                searchParams["categories"] = filters.selectedCategories;
            }

            // Add price range filter
            if (filters.priceRange) {
                searchParams["min-price"] = filters.priceRange[0].toString();
                searchParams["max-price"] = filters.priceRange[1].toString();
            }

            // Add distance filter
            if (filters.distance) {
                searchParams["distance"] = filters.distance.toString();
            }

            console.log("Search params for API call:", searchParams);
            const response = await getBakeries(searchParams);
            console.log("API response:", response);

            if (response.payload && Array.isArray(response.payload)) {
                console.log("Setting bakeries from API response payload:", response.payload);
                setBakeries(response.payload);

                if (response.meta_data) {
                    setPagination({
                        currentPage: response.meta_data.page_index || 0,
                        totalPages: response.meta_data.total_pages_count || 1,
                    });
                }
            } else {
                console.error("API call successful but invalid data format:", response);
                setError("Failed to load bakeries");
            }
        } catch (err) {
            console.error("Error fetching bakeries:", err);
            setError("An error occurred while fetching bakeries");
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.currentPage]);

    // Only fetch data when filters change or pagination changes
    // Skip on initial load since we're using barkeriesPromise
    useEffect(() => {
        if (initialDataLoaded) {
            fetchBakeries();
        }
    }, [fetchBakeries, initialDataLoaded]);

    console.log("Bakeries state:", bakeries);

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900">
            {/* Header */}
            {/* <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Cửa hàng bánh tại TP.HCM
                        </h1>

                        <div className="flex w-full md:w-auto items-center">
                            <div className="relative flex-1 md:w-64">
                                <Input
                                    type="search"
                                    placeholder="Tìm tên cửa hàng..."
                                    className="pr-10 border-gray-300 dark:border-gray-700 focus:border-custom-teal dark:focus:border-custom-teal focus:ring-custom-teal/20 dark:focus:ring-custom-teal/20"
                                    value={filters.bakeryName}
                                    onChange={(e) => setBakeryName(e.target.value)}
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>

                            <Button
                                variant="outline"
                                className="ml-2 border-gray-300 dark:border-gray-700 flex items-center"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <Filter className="h-5 w-5 mr-1" />
                                <span>Lọc</span>
                                {activeFiltersCount > 0 && (
                                    <span className="ml-1 bg-custom-teal text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div> */}

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {isFilterOpen && (
                        <div className="w-full md:w-64 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                            <StoreFilters cakeCategories={cakeCategories} />
                        </div>
                    )}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-teal"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        ) : bakeries.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-lg text-center">
                                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                    Không tìm thấy cửa hàng nào
                                </h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-500">
                                    Vui lòng thử lại với bộ lọc khác
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bakeries.map((bakery) => (
                                    <StoreCard key={bakery.id} bakery={bakery} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && bakeries.length > 0 && pagination.totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-1">
                                    <Button
                                        variant="outline"
                                        className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                                        onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
                                        disabled={pagination.currentPage === 0}
                                    >
                                        <ChevronDown className="h-4 w-4 rotate-90" />
                                    </Button>

                                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className={`w-10 h-10 p-0 border-gray-300 dark:border-gray-700 ${pagination.currentPage === i ? "bg-custom-teal text-white" : ""
                                                }`}
                                            onClick={() => handlePageChange(i)}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                                        onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                                        disabled={pagination.currentPage === pagination.totalPages - 1}
                                    >
                                        <ChevronDown className="h-4 w-4 -rotate-90" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoresBody;