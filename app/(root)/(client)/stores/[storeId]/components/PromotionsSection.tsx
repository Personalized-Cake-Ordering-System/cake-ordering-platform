"use client" ;

import Link from 'next/link' ;
import { Card, CardContent } from '@/components/ui/card' ;
import { Button } from '@/components/ui/button' ;
import { PercentCircle } from 'lucide-react' ;

interface Promotion {
  id: number | string ;
  discount: string ;
  minSpend: string ;
  maxDiscount: string ;
  expires: string ;
  used: string ;
}

interface PromotionsSectionProps {
  promotions: Promotion[] ;
  storeId: string ;
}

  export default function PromotionsSection({ promotions, storeId }: PromotionsSectionProps) {
    return (
      <div className="bg-gradient-to-br from-pink-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center dark:text-white">
            <PercentCircle className="h-5 w-5 text-custom-pink mr-2" />
            Available Promotions
          </h2>
          <Link href="/dashboard/bakeries/promotions" className="text-custom-teal text-sm font-medium hover:underline flex items-center">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {promotions.map((promo) => (
            <Card key={promo.id} className="bg-white dark:bg-gray-800 overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <div className="absolute -left-6 top-5 bg-custom-teal text-white py-1 px-8 text-sm font-bold transform -rotate-45">
                  {promo.discount}
                </div>
                <div className="absolute top-3 right-3 text-xs bg-custom-pink/30 text-custom-teal px-2 py-1 rounded-full font-semibold">
                  x3
                </div>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="text-lg font-bold mt-2 dark:text-white">Save {promo.discount}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Min Spend {promo.minSpend}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Max Discount {promo.maxDiscount}</div>

                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-custom-pink rounded-full"
                        style={{ width: promo.used }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                      <span>{promo.used} used</span>
                      <span>Expires {promo.expires}</span>
                    </div>

                    <Button size="sm" className="mt-3 shadow-sm hover:shadow-md transition-shadow bg-custom-teal hover:bg-custom-pink text-white">
                      Claim Now
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    ) ;
  } 