"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { IStore } from "../home/data";

interface StoreCardProps {
  store: IStore;
}

export const StoreCard = ({ store }: StoreCardProps) => {
  const router = useRouter();

  const handleViewStore = () => {
    // Navigate to store detail page with the store id
    router.push(`/stores/${store.id}`);
  };

  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={store.avatar}
            alt={store.name}
            fill
            className="object-cover"
          />
          {store.isNew && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs rounded-full px-2 py-1 font-medium">
              Mới mở cửa
            </div>
          )}
          {store.isFeatured && (
            <div className="absolute top-2 right-2 bg-custom-teal text-white text-xs rounded-full px-2 py-1 font-medium">
              Nổi bật
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {store.name}
            </h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {store.rating}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({store.reviewCount})
              </span>
            </div>
          </div>

          <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{store.address}</span>
          </div>

          <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="mr-4">{store.distance}</span>
            <span>{store.openTime}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {store.categories.map((category, index) => (
              <span
                key={index}
                className="bg-custom-pink/20 text-custom-teal dark:bg-custom-pink/30 dark:text-custom-teal text-xs rounded-full px-2 py-1"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm font-medium text-custom-teal dark:text-custom-teal">
              {store.priceRange}
            </span>
            <Button
              size="sm"
              className="bg-custom-teal hover:bg-custom-pink text-white transition-colors duration-300"
              onClick={handleViewStore}
            >
              XEM CỬA HÀNG
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};