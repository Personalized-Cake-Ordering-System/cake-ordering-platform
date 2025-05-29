"use client" ;

import React from "react" ;
import Image from "next/image" ;
import { useRouter } from "next/navigation" ;
import { Card, CardContent } from "@/components/ui/card" ;
import { Button } from "@/components/ui/button" ;
import { MapPin, Star, Clock, Award, TrendingUp, Phone } from "lucide-react" ;
import { IBakery } from "@/features/barkeries/types/barkeries-type" ;

interface StoreCardProps {
  bakery: IBakery ;
  isFeatured?: boolean ;
}

export const StoreCard = ({ bakery, isFeatured = false }: StoreCardProps) => {
  const router = useRouter() ;
  const [isClient, setIsClient] = React.useState(false) ;
  const [isNewBakery, setIsNewBakery] = React.useState(false) ;
  const [formattedDate, setFormattedDate] = React.useState("") ;

  // Ensure component only runs client-side
  React.useEffect(() => {
    setIsClient(true) ;

    // Check if bakery is new (created within last 7 days)
    if (bakery?.created_at) {
      const createdDate = new Date(bakery.created_at) ;
      const now = new Date() ;
      const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) ;
      setIsNewBakery(diffInDays <= 7) ;

      // Format date properly
      setFormattedDate(createdDate.toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" })) ;
    }
  }, [bakery]) ;

  // Only show confirmed stores
  if (bakery.status !== "CONFIRMED") return null ;

  // Don't render anything until client-side is ready
  if (!isClient) return null ;

  const getStatusBadge = () => {
    switch (bakery.status) {
      case "CONFIRMED":
        return (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full px-3 py-1 font-medium flex items-center gap-1 shadow-md">
            <Award className="h-3 w-3" />
            <span>Đã xác nhận</span>
          </div>
        ) ;
      case "PENDING":
        return (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs rounded-full px-3 py-1 font-medium flex items-center gap-1 shadow-md">
            <Clock className="h-3 w-3" />
            <span>Đang chờ</span>
          </div>
        ) ;
      default:
        return null ;
    }
  } ;

  const handleViewStore = () => {
    router.push(`/stores/${bakery.id}`) ;
  } ;
  console.log('====================================') ;
  console.log(bakery.avatar_file.file_url, "image oe đay") ;
  console.log('====================================') ;
  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
      <CardContent className="p-0">
        <div className="relative h-56 w-full group">
          <Image
            src={bakery?.avatar_file?.file_url || "/default-bakery-image.jpg"}
            alt={bakery.bakery_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Show "Mới" badge for new bakeries */}
          {isNewBakery && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full px-3 py-1 font-medium flex items-center gap-1 shadow-md">
              <TrendingUp className="h-3 w-3" />
              <span>Mới</span>
            </div>
          )}

          {getStatusBadge()}

          {isFeatured && (
            <div className="absolute bottom-2 left-2 bg-gradient-to-r from-custom-pink to-pink-600 text-white text-xs rounded-full px-3 py-1 font-medium shadow-md">
              Nổi bật
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {bakery.bakery_name}
            </h3>
            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {bakery.metric && typeof bakery.metric.rating_average === 'number'
                  ? Number(bakery.metric.rating_average.toFixed(1))
                  : '4.5'}
              </span>
            </div>
          </div>

          <div className="flex items-start mb-3">
            <MapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {bakery.address}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="font-medium">{bakery.phone}</span>
          </div>

          {/* Description sections */}
          <div className="space-y-3 mb-4">
            {bakery.bakery_description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {bakery.bakery_description}
              </p>
            )}
            {bakery.cake_description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {bakery.cake_description}
              </p>
            )}
            {bakery.price_description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                {bakery.price_description}
              </p>
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full px-3 py-1 font-medium">
              Bánh ngọt
            </span>
            <span className={`text-xs rounded-full px-3 py-1 font-medium ${bakery.status === "CONFIRMED"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
              : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
              }`}>
              {bakery.status === "CONFIRMED" ? "Đã xác nhận" : "Đang chờ"}
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full px-3 py-1 font-medium">
              <span suppressHydrationWarning>{formattedDate}</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Chủ sở hữu:</span> {bakery.owner_name}
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 rounded-full font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              onClick={handleViewStore}
            >
              XEM CỬA HÀNG
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ) ;
} ;
