"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Award, TrendingUp, Phone } from "lucide-react";
import { IBakery } from "@/features/barkeries/types/barkeries-type";

interface StoreCardProps {
  bakery: IBakery;
  isFeatured?: boolean;
}

export const StoreCard = ({ bakery, isFeatured = false }: StoreCardProps) => {
  const router = useRouter();

  // Generate a status badge based on bakery status
  const getStatusBadge = () => {
    switch (bakery.status) {
      case "CONFIRMED":
        return (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs rounded-full px-2 py-1 font-medium flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>Đã xác nhận</span>
          </div>
        );
      case "PENDING":
        return (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs rounded-full px-2 py-1 font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Đang chờ</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Check if the bakery was created recently (within the last 7 days)
  const isNew = () => {
    const createdDate = new Date(bakery.created_at);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7;
  };

  // Format creation date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleViewStore = () => {
    router.push(`/stores/${bakery.id}`);
  };

  return (
    // <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg">
    //   <CardContent className="p-0">
    //     <div className="relative h-48 w-full group">
    //       <Image
    //         src={bakery.avatar_file?.file_url || '/placeholder-bakery.jpg'}
    //         alt={bakery.bakery_name}
    //         fill
    //         className="object-cover transition-transform duration-500 group-hover:scale-105"
    //       />
    //       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    //       {isNew() && (
    //         <div className="absolute top-2 left-2 bg-custom-teal text-white text-xs rounded-full px-2 py-1 font-medium flex items-center gap-1">
    //           <TrendingUp className="h-3 w-3" />
    //           <span>Mới</span>
    //         </div>
    //       )}

    //       {getStatusBadge()}

    //       {isFeatured && (
    //         <div className="absolute bottom-2 left-2 bg-custom-pink text-white text-xs rounded-full px-2 py-1 font-medium">
    //           Nổi bật
    //         </div>
    //       )}
    //     </div>

    //     <div className="p-4">
    //       <div className="flex justify-between items-start">
    //         <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
    //           {bakery.bakery_name}
    //         </h3>
    //         <div className="flex items-center">
    //           <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
    //           <span className="text-sm font-medium text-gray-900 dark:text-white">
    //             {4.5} {/* Placeholder rating since API doesn't provide one */}
    //           </span>
    //         </div>
    //       </div>

    //       <div className="flex items-start mt-2">
    //         <MapPin className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
    //         <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
    //           {bakery.address}
    //         </span>
    //       </div>

    //       <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
    //         <Phone className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
    //         <span>{bakery.phone}</span>
    //       </div>

    //       <div className="mt-3 flex flex-wrap gap-1.5">
    //         <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full px-2 py-0.5">
    //           Bánh ngọt
    //         </span>
    //         <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full px-2 py-0.5">
    //           {bakery.status === "CONFIRMED" ? "Đã xác nhận" : "Đang chờ"}
    //         </span>
    //         <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full px-2 py-0.5">
    //           {formatDate(bakery.created_at)}
    //         </span>
    //       </div>

    //       <div className="mt-4 flex justify-between items-center">
    //         <div className="text-xs text-gray-500 dark:text-gray-400">
    //           {bakery.owner_name}
    //         </div>
    //         <Button
    //           size="sm"
    //           className="bg-custom-teal hover:bg-custom-pink text-white transition-colors duration-300 rounded-full font-medium shadow-sm hover:shadow-md"
    //           onClick={handleViewStore}
    //         >
    //           XEM CỬA HÀNG
    //         </Button>
    //       </div>
    //     </div>
    //   </CardContent>
    // </Card>
    <div>
      <p>
        bebe
      </p>
    </div>
  );
};