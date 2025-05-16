"use client" ;

import React from "react" ;
import { Button } from "@/components/ui/button" ;
import { Checkbox } from "@/components/ui/checkbox" ;
import { Slider } from "@/components/ui/slider" ;
import { useStoreFilters } from "@/hooks/use-store-filter" ;
import { Input } from "@/components/ui/input" ;
import { Search, RefreshCw, MapPin, Coins } from "lucide-react";

interface StoreFiltersProps {
  cakeCategories : string[] ;
}

export const StoreFilters = ({ cakeCategories } : StoreFiltersProps) => {
  const { filters, resetFilters, setPriceRange, setDistance, toggleCategory, setBakeryName } =
    useStoreFilters() ;

  const { priceRange, distance, selectedCategories, bakeryName } = filters ;
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-600 dark:from-rose-400 dark:to-purple-400">
          Bộ lọc
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Đặt lại</span>
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Search className="h-4 w-4 text-rose-500" />
          Tìm kiếm
        </h3>
        <div className="relative">
          <Input
            type="text"
            placeholder="Tìm theo tên cửa hàng"
            value={bakeryName}
            onChange={(e) => setBakeryName(e.target.value)}
            className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-rose-400 focus:ring focus:ring-rose-200 dark:focus:ring-rose-900/30 dark:focus:border-rose-700"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">
          Loại bánh
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {cakeCategories.map((category) => (
            <div 
              key={category} 
              className={`px-3 py-2 rounded-xl cursor-pointer transition-all border ${
                selectedCategories.includes(category)
                  ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  : 'bg-white/50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                  className={`mr-2 ${
                    selectedCategories.includes(category)
                      ? 'text-rose-500 border-rose-500 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500'
                      : 'border-gray-400'
                  }`}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Coins className="h-4 w-4 text-amber-500" />
          Khoảng giá
        </h3>
        <div className="px-2">
          <div className="py-4 px-2">
            <Slider
              value={priceRange}
              min={15000}
              max={120000}
              step={5000}
              onValueChange={setPriceRange}
              className="my-4"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded-full px-2.5 py-1">{priceRange[0].toLocaleString()}đ</span>
            <span className="font-medium bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded-full px-2.5 py-1">{priceRange[1].toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            Bán kính
          </h3>
          <span className="font-medium bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full px-2.5 py-1">
            {distance}km
          </span>
        </div>
        <div className="px-2">
          <div className="py-4 px-2">
            <Slider
              value={[distance]}
              min={0.5}
              max={10}
              step={0.5}
              onValueChange={(value) => setDistance(value[0])}
              className="my-4"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0.5km</span>
            <span>10km</span>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <Button className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg rounded-xl">
          Áp dụng bộ lọc
        </Button>
      </div>
    </div>
  ) ;
} ;
