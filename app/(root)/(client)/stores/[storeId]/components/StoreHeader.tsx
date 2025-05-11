"use client" ;

import Image from 'next/image' ;
import { Badge } from '@/components/ui/badge' ;
import { Button } from '@/components/ui/button' ;
import { Award, Clock, Heart, MessageCircle, ShoppingCart, Star, Users, Calendar } from 'lucide-react' ;

interface StoreInfo {
  id: string ;
  name: string ;
  email: string ;
  phone: string ;
  address: string ;
  ownerName: string ;
  avatar: string ;
  bannerImages: string[] ;
  status: string ;
  createdAt: string ;
  taxCode?: string ;
}

export default function StoreHeader({ storeInfo }: { storeInfo: StoreInfo }) {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
      {/* Banner Image Carousel */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          <Image
            src={storeInfo.bannerImages[0] || '/images/default-banner.jpg'}
            alt={storeInfo.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Store Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-6">
          {/* Store Avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
            <Image
              src={storeInfo.avatar}
              alt={storeInfo.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Store Details */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">{storeInfo.name}</h1>
            <p className="text-lg opacity-90">Owned by {storeInfo.ownerName}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full ${storeInfo.status === 'CONFIRMED'
                ? 'bg-green-500 text-white'
                : 'bg-yellow-500 text-white'
                }`}>
                {storeInfo.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) ;
}

// Helper component for store metrics
function StoreMetric({ icon, label, value }: { icon: React.ReactNode ; label: string ; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 p-3 rounded-lg backdrop-blur-sm">
      <div className="text-gray-700 dark:text-white/90">
        {icon}
      </div>
      <div>
        <div className="text-xs opacity-80">{label}:</div>
        <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  ) ;
} 