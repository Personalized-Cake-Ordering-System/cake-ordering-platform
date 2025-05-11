"use client" ;

import { Card } from '@/components/ui/card' ;

  interface CategoriesSectionProps {
    categories?: string[] ;
  }

  export default function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
    // Use provided categories or fallback to default ones
    const displayCategories = categories.length > 0 
      ? categories 
      : ['Birthday Specials', 'Wedding Collection', 'Seasonal Treats', 'Gluten-Free', 'Vegan Options', 'Party Packages'] ;
    
    return (
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
          <h2 className="text-xl font-bold dark:text-white">Popular Categories</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayCategories.map((category, index) => (
            <Card key={index} className="overflow-hidden border border-gray-100 dark:border-gray-700 dark:bg-gray-800 group cursor-pointer hover:border-custom-pink transition-all">
              <div className="aspect-[4/3] relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-custom-pink/20 to-custom-teal/20"></div>
                <div className="h-12 w-12 rounded-full bg-white/80 dark:bg-gray-600/80 flex items-center justify-center shadow-sm">
                  {index % 6 === 0 && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-custom-teal"><path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z"></path><path d="M12 9V14"></path><path d="M12 17.01L12.01 16.9989"></path></svg>}
                  {index % 6 === 1 && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-custom-pink"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>}
                  {index % 6 === 2 && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-custom-teal"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>}
                  {index % 6 === 3 && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-custom-pink"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
                  {index % 6 === 4 && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-custom-teal"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                  {index % 6 === 5 && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-custom-pink"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
                </div>
              </div>
              <div className="p-3 text-center">
                <h3 className="text-sm font-medium dark:text-gray-200 group-hover:text-custom-teal transition-colors">{category}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    ) ;
  } 