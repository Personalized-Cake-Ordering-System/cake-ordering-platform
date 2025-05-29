"use client" ;

import { Input } from "@/components/ui/input" 
import { Button } from "@/components/ui/button" 
import { ChevronDown , Filter , Search } from "lucide-react" 
import {
  Select ,
  SelectContent ,
  SelectItem ,
  SelectTrigger ,
  SelectValue ,
} from "@/components/ui/select" 

import { stores } from "@/components/shared/client/home/data" 
import { StoreCard } from "@/components/shared/client/stores/store-card" 
import { StoreFilters } from "@/components/shared/client/stores/store-filter" 
import React from "react" 
import { ApiListResponse } from "@/lib/api/api-handler/generic" 
import { IBakery } from "@/features/barkeries/types/barkeries-type" 
import { useStoreFilters } from "@/hooks/use-store-filter";
// Danh sách các loại bánh cho filter
const cakeCategories = [
  "Bánh mì" ,
  "Bánh kem" ,
  "Bánh ngọt" ,
  "Bánh mặn" ,
  "Bánh trung thu" ,
  "Bánh chay" ,
  "Bánh sinh nhật" ,
  "Bánh theo mùa" ,
] 

interface StoreSectionProps {
    barkeriesPromise: ApiListResponse<IBakery> 
}

const StoreSection = ({ barkeriesPromise }: StoreSectionProps) => {
  const {
    filters ,
    isFilterOpen ,
    activeFiltersCount ,
    setIsFilterOpen ,
    setSortBy ,
      setSearchQuery ,
    } = useStoreFilters() 

    // const store = barkeriesPromise.data 
    
    // console.log(store) 

  return (
    <div>
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
            className={`w-full md:w-64 lg:w-72 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 md:block ${
              isFilterOpen ? "block" : "hidden"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barkeriesPromise.data?.data?.map((store: IBakery) => (
                <StoreCard key={store.id} bakery={store} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700 bg-custom-teal text-white"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                >
                  3
                </Button>
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) 
} 

export default StoreSection 
