"use client" ;

import Link from 'next/link' ;
import Image from 'next/image' ;
import { Card } from '@/components/ui/card' ;
import { Badge } from '@/components/ui/badge' ;
import { Button } from '@/components/ui/button' ;
import { Heart, ShoppingCart, Star, Store } from 'lucide-react' ;

interface Product {
  id: number | string ;
  name: string ;
  image: string ;
  price: number ;
  discountedPrice: number ;
  sold: string ;
  category?: string ;
}

interface RecommendedProductsProps {
  products: Product[] ;
  storeId: string ;
  rating: number ;
}

export default function RecommendedProducts({ products, storeId, rating }: RecommendedProductsProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
        <h2 className="text-xl font-bold flex items-center dark:text-white">
          <Store className="h-5 w-5 text-custom-pink mr-2" />
          Recommended For You
        </h2>
        <Link href="/dashboard/bakeries/recommended" className="text-custom-teal text-sm font-medium hover:underline flex items-center">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-0 dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-md">
                  <Heart className="h-4 w-4 text-custom-pink" />
                </Button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center text-white">
                  <Star className="h-3 w-3 fill-amber-400 stroke-amber-400 mr-1" />
                  <span className="text-xs">{rating}</span>
                </div>
                <span className="text-xs text-white">Sold {product.sold}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium line-clamp-2 dark:text-white group-hover:text-custom-teal transition-colors">{product.name}</h3>
              <div className="mt-2 flex items-center">
                <span className="text-custom-pink font-bold">${product.discountedPrice}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 line-through">${product.price}</span>
                <Badge className="ml-auto bg-custom-pink/30 text-custom-teal text-xs">
                  {Math.round((product.price - product.discountedPrice) / product.price * 100)}% OFF
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 text-xs border-custom-pink text-custom-teal hover:bg-custom-pink/20 hover:text-custom-teal dark:text-custom-teal dark:border-custom-pink">
                <Link href={`/stores/${storeId}/build/Model3DCustom`} className="flex items-center justify-center">
                  <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ) ;
} 