"use client" ;

import React from "react" ;
import { Button } from "@/components/ui/button" ;
import { Checkbox } from "@/components/ui/checkbox" ;
import { Slider } from "@/components/ui/slider" ;
import { useStoreFilters } from "@/hooks/use-store-filter" ;
import { Input } from "@/components/ui/input" ;

interface StoreFiltersProps {
  cakeCategories : string[] ;
}

export const StoreFilters = ({ cakeCategories } : StoreFiltersProps) => {
  const { filters, resetFilters, setPriceRange, setDistance, toggleCategory, setBakeryName } =
    useStoreFilters() ;

  const { priceRange, distance, selectedCategories, bakeryName } = filters ;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark :text-white">
          Bộ lọc
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 text-gray-600 dark :text-gray-400 hover :text-custom-teal dark :hover :text-custom-teal"
        >
          Đặt lại
        </Button>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 dark :text-white mb-3">
          Tên cửa hàng
        </h3>
        <Input
          type="text"
          placeholder="Tìm theo tên cửa hàng"
          value={bakeryName}
          onChange={(e) => setBakeryName(e.target.value)}
          className="w-full border-gray-300 dark :border-gray-700 focus :border-custom-teal dark :focus :border-custom-teal"
        />
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 dark :text-white mb-3">
          Loại bánh
        </h3>
        <div className="space-y-2">
          {cakeCategories.map((category) => (
            <div key={category} className="flex items-center">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                className="border-gray-300 data-[state=checked] :bg-custom-teal data-[state=checked] :border-custom-teal"
              />
              <label
                htmlFor={`category-${category}`}
                className="ml-2 text-sm text-gray-700 dark :text-gray-300"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 dark :text-white mb-3">
          Khoảng giá
        </h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            min={15000}
            max={120000}
            step={5000}
            onValueChange={setPriceRange}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-gray-600 dark :text-gray-400">
            <span>{priceRange[0].toLocaleString()}đ</span>
            <span>{priceRange[1].toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-medium text-gray-900 dark :text-white">
            Bán kính
          </h3>
          <span className="text-sm text-gray-600 dark :text-gray-400">
            {distance}km
          </span>
        </div>
        <div className="px-2">
          <Slider
            value={[distance]}
            min={0.5}
            max={10}
            step={0.5}
            onValueChange={(value) => setDistance(value[0])}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-gray-600 dark :text-gray-400">
            <span>0.5km</span>
            <span>10km</span>
          </div>
        </div>
      </div>
    </div>
  ) ;
} ;
