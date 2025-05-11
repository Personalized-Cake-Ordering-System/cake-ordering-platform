"use client" ;

import React from "react" 
import { X } from "lucide-react" 
import { Button } from "@/components/ui/button" 
import { useStoreFilters } from "@/hooks/use-store-filter" 

interface StoreFilterTagsProps { }

export const StoreFilterTags: React.FC<StoreFilterTagsProps> = ({ }) => {
  const { filters, resetFilters, setPriceRange, setDistance, toggleCategory }  =
    useStoreFilters() 
  const { priceRange, distance, selectedCategories } = filters 
  const defaultPriceRange = [15000, 120000] 
  const defaultDistance = 5 

  const hasPriceFilter  =
    priceRange[0] !== defaultPriceRange[0]  ||
    priceRange[1] !== defaultPriceRange[1] 
  const hasDistanceFilter = distance !== defaultDistance 

  if (
    selectedCategories.length === 0  &&
    !hasPriceFilter  &&
     !hasDistanceFilter
  ) {
    return null 
  }

  return  (
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedCategories.map((category) => (
         <Button
            key={category}
            variant="outline"
            size="sm"
            className="h-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 px-3 rounded-full"
            onClick={() => toggleCategory(category)}
          >
            {category}
            <X className="ml-1 h-4 w-4" />
          </Button>
        ))}

      {hasPriceFilter &&  (
         <Button
           variant="outline"
           size="sm"
            className="h-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 px-3 rounded-full"
           onClick={() => setPriceRange([15000, 120000])}
          >
            {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}

       {hasDistanceFilter && (
         <Button
           variant="outline"
           size="sm"
           className="h-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 px-3 rounded-full"
           onClick={() => setDistance(defaultDistance)}
         >
          Bán kính {distance} km
           <X className="ml-1 h-4 w-4" />
         </Button>
       )}
     </div>
  ) 
} 
