"use client" ;

import Link from 'next/link' ;
import { Card } from '@/components/ui/card' ;
import { Star } from 'lucide-react' ;

interface Review {
  id: number | string ;
  text: string ;
  rating?: number ;
  user_name?: string ;
  created_at?: string ;
}

interface ReviewsSectionProps {
  reviews?: Review[] ;
}

export default function ReviewsSection({ reviews = [] }: ReviewsSectionProps) {
  // Format date to relative time
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently" ;
    
    const date = new Date(dateString) ;
    const now = new Date() ;
    const diffTime = Math.abs(now.getTime() - date.getTime()) ;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) ;
    
    if (diffDays < 1) return "Today" ;
    if (diffDays === 1) return "Yesterday" ;
    if (diffDays < 7) return `${diffDays} days ago` ;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago` ;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago` ;
    return `${Math.floor(diffDays / 365)} years ago` ;
  } ;
  
  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
        <h2 className="text-xl font-bold flex items-center dark:text-white">
          <Star className="h-5 w-5 text-amber-400 mr-2" />
          Customer Reviews
        </h2>
        <Link href="/dashboard/bakeries/reviews" className="text-custom-teal text-sm font-medium hover:underline flex items-center">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-gray-400 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm dark:text-white">{review.user_name || `Customer ${review.id}`}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: review.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">
                {review.text}
              </p>
              <div className="mt-4 flex gap-2">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden"></div>
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ) ;
} 