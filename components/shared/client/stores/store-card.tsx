"use client" ;

import React from "react" ;
import Image from "next/image" ;
import { useRouter } from "next/navigation" ;
import { Card, CardContent } from "@/components/ui/card" ;
import { Button } from "@/components/ui/button" ;
import { MapPin, Star, Clock, Award, TrendingUp, Phone, ExternalLink } from "lucide-react" ;
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
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full px-3 py-1 font-medium flex items-center gap-1 shadow-md backdrop-blur-sm">
            <Award className="h-3 w-3" />
            <span>Đã xác nhận</span>
          </div>
        ) ;
      case "PENDING":
        return (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs rounded-full px-3 py-1 font-medium flex items-center gap-1 shadow-md backdrop-blur-sm">
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
  
  return (
    <Card className="group relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-800 overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative h-60 w-full overflow-hidden">
          <Image
            src={bakery?.avatar_file?.file_url || "/default-bakery-image.jpg"}
            alt={bakery.bakery_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Show "Mới" badge for new bakeries */}
          {isNewBakery && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full px-3 py-1 font-medium flex items-center gap-1 shadow-md backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" />
              <span>Mới</span>
            </div>
          )}

          {getStatusBadge()}

          {isFeatured && (
            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs rounded-full px-3 py-1 font-medium shadow-md backdrop-blur-sm">
              Nổi bật
            </div>
          )}

          <div className="absolute bottom-3 right-3">
            <div className="flex items-center bg-white/30 backdrop-blur-md px-2 py-1 rounded-full shadow-lg">
              <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="text-xs font-semibold text-white">
                4.5
              </span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-600 dark:from-rose-400 dark:to-purple-400 mb-2 line-clamp-1">
            {bakery.bakery_name}
          </h3>

          <div className="flex items-start mb-3 gap-2">
            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {bakery.address}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="font-medium">{bakery.phone}</span>
          </div>

          {/* Description in a styled box */}
          {bakery.bakery_description && (
            <div className="mb-4 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {bakery.bakery_description}
              </p>
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-1.5">
            <span className="bg-purple-100/70 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full px-2.5 py-1 font-medium">
              Bánh ngọt
            </span>
            {bakery.price_description && (
              <span className="bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded-full px-2.5 py-1 font-medium">
                {bakery.price_description}
              </span>
            )}
            <span className="bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full px-2.5 py-1 font-medium">
              <span suppressHydrationWarning>{formattedDate}</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Chủ sở hữu:</span> {bakery.owner_name}
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white transition-all duration-300 rounded-full px-4 font-medium shadow-md hover:shadow-lg flex items-center gap-1.5"
              onClick={handleViewStore}
            >
              <span>XEM</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ) ;
} ;
