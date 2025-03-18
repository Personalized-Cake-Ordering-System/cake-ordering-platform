"use client";

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Clock, Heart, MessageCircle, ShoppingCart, Star, Users, Calendar } from 'lucide-react';

export default function StoreHeader({ bakery }: { bakery: any }) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-custom-pink to-custom-teal shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20"></div>
        <div className="absolute left-40 bottom-10 h-32 w-32 rounded-full bg-white/20"></div>
        <div className="absolute right-1/4 top-1/3 h-16 w-16 rounded-full bg-white/20"></div>
      </div>

      <div className="relative flex flex-col md:flex-row md:items-start p-6 gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-white/95 p-1.5 shadow-md">
            <Image
              src={'/images/auth/auth-illustration.png'}
              alt={bakery.name}
              width={120}
              height={120}
              className="rounded-lg object-cover"
            />
            <Badge className="absolute bottom-1 right-1 bg-custom-teal text-white text-xs font-semibold px-2 py-0.5 rounded-md">
              <Award className="h-3 w-3 mr-1" /> Official
            </Badge>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              {bakery.name}
              <Badge className="bg-gray-800/70 dark:bg-white/20 text-white text-xs">Verified</Badge>
            </h1>

            <p className="text-sm flex items-center justify-center md:justify-start gap-1.5 text-gray-800 dark:text-gray-100">
              <Clock className="h-4 w-4" /> Online {bakery.online}
              <span className="inline-block mx-1.5 h-1 w-1 rounded-full bg-gray-600 dark:bg-white/70"></span>
              <Users className="h-4 w-4" /> {bakery.currentlyViewing} currently viewing
            </p>

            <div className="flex gap-3 justify-center md:justify-start">
              <Button size="sm" className="bg-white text-custom-pink hover:bg-white/90 rounded-full px-4 shadow-sm">
                <Heart className="h-4 w-4 mr-1.5" /> Follow
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent border-gray-800 dark:border-white text-gray-800 dark:text-white hover:bg-gray-800/10 dark:hover:bg-white/20 rounded-full px-4">
                <MessageCircle className="h-4 w-4 mr-1.5" /> Chat
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-0 md:ml-auto grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <StoreMetric icon={<ShoppingCart className="h-5 w-5" />} label="Products" value={bakery.products} />
          <StoreMetric icon={<Users className="h-5 w-5" />} label="Followers" value={bakery.followers} />
          <StoreMetric icon={<Star className="h-5 w-5 fill-amber-300 stroke-amber-400" />} label="Rating" value={`${bakery.rating} (${bakery.totalReviews})`} />
          <StoreMetric icon={<Calendar className="h-5 w-5" />} label="Established" value={bakery.establishedDate} />
        </div>
      </div>
    </div>
  );
}

// Helper component for store metrics
function StoreMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
  );
} 