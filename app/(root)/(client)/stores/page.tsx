"use client";

import React, { useEffect, useState } from "react";
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
import { StoreFilterTags } from "@/components/shared/client/stores/store-filter-tag";
import { useStoreFilters } from "@/hooks/use-store-filter";
import { getBakeries } from "@/features/barkeries/actions/barkeries-action";
import { IBakery } from "@/features/barkeries/types/barkeries-type";
import { StoreCard } from "@/components/shared/client/stores/store-card";
import { SearchParams } from "@/types/table"; // Importing the correct type

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

const StoresPage = () => {
  const {
    filters,
    isFilterOpen,
    activeFiltersCount,
    setIsFilterOpen,
    setSortBy,
    setSearchQuery,
  } = useStoreFilters();

  const [bakeries, setBakeries] = useState<IBakery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
  });
  console.log("sert" + bakeries);

  useEffect(() => {
    const fetchBakeries = async () => {
      setLoading(true);
      try {
        // Create a SearchParams object with the correct type
        const searchParams: Record<string, string | string[]> = {
          "page-index": pagination.currentPage.toString(),
          "page-size": "10",
        };

        // Add optional parameters only if they exist
        if (filters.searchQuery) {
          searchParams["search-term"] = filters.searchQuery;
        }

        if (filters.sortBy) {
          searchParams["sort-by"] = filters.sortBy;
        }

        // Cast the searchParams to SearchParams type
        const response = await getBakeries(searchParams as SearchParams);

        console.log('====================================');
        console.log("resssss" + JSON.stringify(response));
        console.log('====================================');

        // Handle the response based on the actual structure
        if (response && response.data && Array.isArray(response.data)) {
          setBakeries(response.data);
          console.log('====================================');
          console.log(response.data + "bebebebe");
          console.log('====================================');
          setPagination({
            currentPage: parseInt(searchParams["page-index"] as string || "0"),
            totalPages: response.pageCount || 1,
          });
        } else {
          setError("Failed to load bakeries");
        }
      } catch (err) {
        setError("An error occurred while fetching bakeries");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBakeries();
  }, [filters.searchQuery, filters.sortBy, pagination.currentPage]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cửa hàng bánh tại TP.HCM
            </h1>

            <div className="flex w-full md:w-auto items-center">
              <div className="relative flex-1 md:w-64">
                <Input
                  type="search"
                  placeholder="Tìm cửa hàng"
                  className="pr-10 border-gray-300 dark:border-gray-700 focus:border-custom-teal dark:focus:border-custom-teal focus:ring-custom-teal/20 dark:focus:ring-custom-teal/20"
                  value={filters.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              <Select value={filters.sortBy!} onValueChange={setSortBy}>
                <SelectTrigger className="w-28 md:w-40 ml-2 border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Phù hợp nhất</SelectItem>
                  <SelectItem value="rating">Đánh giá cao</SelectItem>
                  <SelectItem value="distance">Gần nhất</SelectItem>
                  <SelectItem value="desc">Giá thấp</SelectItem>
                  <SelectItem value="asc">Giá cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div
            className={`w-full md:w-64 lg:w-72 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 md:block ${isFilterOpen ? "block" : "hidden"
              }`}
          >
            <StoreFilters cakeCategories={cakeCategories} />

            <div className="pt-2 md:hidden">
              <Button
                className="w-full bg-custom-teal hover:bg-custom-pink text-white transition-colors duration-300 shadow-md"
                onClick={() => setIsFilterOpen(false)}
              >
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <StoreFilterTags />

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
            {!loading && bakeries.length > 0 && (
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

export default StoresPage;