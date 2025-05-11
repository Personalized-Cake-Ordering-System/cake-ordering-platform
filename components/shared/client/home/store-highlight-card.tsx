"use client" ;

import React from "react" ;
import Image from "next/image" ;
import { useRouter } from "next/navigation" ;
import { Card, CardContent } from "@/components/ui/card" ;
import { Button } from "@/components/ui/button" ;
import { IBakery } from "@/features/barkeries/types/barkeries-type" ;
import { motion } from "framer-motion" ;

interface StoreHighlightCardProps {
  store: {
    id: string ;
    name: string ;
    rating?: number ;
    imageUrl: string ;
    isFeatured?: boolean ;
    isNew?: boolean ;
    reviewCount?: number ;
    categories?: string[] ;
    priceRange?: string ;
    cake_description?: string ;
    price_description?: string ;
    bakery_description?: string ;
  } ;
  bgColor?: string ;
  textColor?: string ;
}

export const StoreHighlightCard = ({
  store,
  bgColor = "bg-custom-pink/30",
  textColor = "text-custom-teal",
}: StoreHighlightCardProps) => {
  const router = useRouter() ;
  // Default placeholder image in case store.imageUrl is empty
  const imageUrl = store.imageUrl || "/placeholder-store.jpg" ;

  const handleViewStore = () => {
    router.push(`/stores/${store.id}`) ;
  } ;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex-1">
        <CardContent className="p-0 h-full">
          <div
            className={`${bgColor} dark:${bgColor} p-8 flex items-center justify-between h-full`}
          >
            <div className="w-1/2 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {store.name}
                </h3>
                <div className="flex gap-2">
                  {store.isNew && (
                    <div className="text-xs bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100 px-3 py-1 rounded-full font-medium">
                      Mới mở cửa
                    </div>
                  )}
                  {store.isFeatured && (
                    <div className="text-xs bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-3 py-1 rounded-full font-medium">
                      Cửa hàng nổi bật
                    </div>
                  )}
                </div>
              </div>

              {store.rating && (
                <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
                  <span className="text-lg">★</span>
                  <span>{store.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({store.reviewCount || "10"}+ đánh giá)</span>
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {store.categories ? store.categories.join(" • ") : "Bánh kem • Bánh ngọt"}
              </p>

              {store.cake_description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {store.cake_description}
                </p>
              )}

              {store.price_description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {store.price_description}
                </p>
              )}

              {store.bakery_description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {store.bakery_description}
                </p>
              )}

              <Button
                variant="link"
                className="group text-gray-900 dark:text-gray-200 font-semibold hover:text-custom-teal dark:hover:text-custom-teal p-0"
                onClick={handleViewStore}
              >
                <span className="flex items-center gap-2">
                  XEM CỬA HÀNG
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </span>
              </Button>
            </div>

            <div className="w-1/2 flex justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-40 h-40 md:w-48 md:h-48 shadow-xl rounded-2xl overflow-hidden"
              >
                <Image
                  src={imageUrl}
                  alt={store.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 160px, 192px"
                />
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ) ;
} ;