"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Search, Cake, SlidersHorizontal } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { StoreFilters } from "@/components/shared/client/stores/store-filter";
import { StoreFilterTags } from "@/components/shared/client/stores/store-filter-tag";
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
        <div>
            {/* Header with Search */}
            <div className="relative">
                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-10 right-20 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-1/2 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <Cake className="h-8 w-8 text-rose-500 mr-2" />
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-purple-600">
                                Cửa hàng bánh tại TP.HCM
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                            Khám phá các cửa hàng bánh ngon, chất lượng và uy tín nhất trong khu vực của bạn
                        </p>
                    </div>
                    
                    <div className="max-w-2xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 flex items-center mb-12">
                        <div className="relative flex-1">
                            <Input
                                type="search"
                                placeholder="Tìm kiếm cửa hàng bánh..."
                                className="border-0 bg-transparent pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full"
                                value={filters.bakeryName}
                                onChange={(e) => setBakeryName(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-full bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-800 ml-2 flex items-center"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <SlidersHorizontal className="h-5 w-5 mr-1 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">Bộ lọc</span>
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-16">
                <div className="flex flex-col md:flex-row gap-8">
                    {isFilterOpen && (
                        <div className="w-full md:w-80 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 self-start sticky top-24">
                            <StoreFilters cakeCategories={cakeCategories} />
                        </div>
                    )}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
                                    <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-rose-500 border-t-transparent"></div>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="backdrop-blur-sm bg-red-50/90 dark:bg-red-900/20 p-6 rounded-2xl text-red-600 dark:text-red-400 shadow-lg border border-red-100 dark:border-red-900/30 text-center">
                                <div className="mb-3 flex justify-center">
                                    <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium mb-2">Đã xảy ra lỗi</h3>
                                {error}
                            </div>
                        ) : bakeries.length === 0 ? (
                            <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Không tìm thấy cửa hàng nào
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Vui lòng thử lại với bộ lọc khác hoặc mở rộng phạm vi tìm kiếm
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {bakeries.map((bakery) => (
                                    <StoreCard key={bakery.id} bakery={bakery} />
                                ))}
                            </div>
                        )}

                        {/* Pagination with updated style */}
                        {!loading && bakeries.length > 0 && pagination.totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 inline-flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-10 h-10 p-0 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-gray-800"
                                        onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
                                        disabled={pagination.currentPage === 0}
                                    >
                                        <ChevronDown className="h-5 w-5 rotate-90" />
                                    </Button>

                                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                                        <Button
                                            key={i}
                                            variant="ghost"
                                            size="sm"
                                            className={`w-10 h-10 p-0 rounded-full ${pagination.currentPage === i
                                                ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                            onClick={() => handlePageChange(i)}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-10 h-10 p-0 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-gray-800"
                                        onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                                        disabled={pagination.currentPage === pagination.totalPages - 1}
                                    >
                                        <ChevronDown className="h-5 w-5 -rotate-90" />
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