"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IBakery } from "@/features/barkeries/types/barkeries-type";

interface StoreHighlightCardProps {
  store: {
    id: string;
    name: string;
    rating?: number;
    imageUrl: string;
    isFeatured?: boolean;
    isNew?: boolean;
    reviewCount?: number;
    categories?: string[];
    priceRange?: string;
  };
  bgColor?: string;
  textColor?: string;
}

export const StoreHighlightCard = ({
  store,
  bgColor = "bg-custom-pink/30",
  textColor = "text-custom-teal",
}: StoreHighlightCardProps) => {
  // Default placeholder image in case store.imageUrl is empty
  const imageUrl = store.imageUrl || "/placeholder-store.jpg";

  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 flex-1">
      <CardContent className="p-0 h-full">
        <div
          className={`${bgColor} dark:${bgColor} p-6 flex items-center justify-between h-full`}
        >
          <div className="w-1/2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {store.name}
            </h3>
            {store.isNew && (
              <div className="text-sm bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-1 rounded-full inline-block mt-1 font-medium">
                Mới mở cửa
              </div>
            )}
            {store.isFeatured && (
              <div className="text-sm bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-2 py-1 rounded-full inline-block mt-1 font-medium">
                Cửa hàng nổi bật
              </div>
            )}
            {store.rating && (
              <div className="text-sm text-yellow-600 mt-1 font-medium">
                ★★★★★ {store.reviewCount || "10"}+ đánh giá
              </div>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {store.categories ? store.categories.join(", ") : "Bánh kem, Bánh ngọt"}
            </p>
            <p
              className={`text-xl ${textColor} dark:${textColor} font-semibold mt-4`}
            >
              {store.priceRange || "100k - 500k"}
            </p>
            <Button
              variant="link"
              className="text-gray-900 dark:text-gray-200 font-semibold hover:text-custom-teal dark:hover:text-custom-teal p-0 mt-3"
              onClick={() => console.log("View store:", store.id)}
            >
              XEM CỬA HÀNG →
            </Button>
          </div>
          <div className="w-1/2 flex justify-center items-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 shadow-lg rounded-lg">
              <Image
                src={imageUrl}
                alt={store.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};