"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HeaderDashboard from '@/components/3d-custom/header';
import EleganceSection from '@/components/3d-custom/elegance-section';
import StoreHeader from './StoreHeader';
import PromotionsSection from './PromotionsSection';
import RecommendedProducts from './RecommendedProducts';
import CategoriesSection from './CategoriesSection';
import ReviewsSection from './ReviewsSection';
import { useToast } from '@/components/ui/use-toast';

// Define types for our data structure
interface Product {
  id: number | string;
  name: string;
  image: string;
  price: number;
  discountedPrice: number;
  sold: string;
  category?: string;
}

interface Promotion {
  id: number | string;
  discount: string;
  minSpend: string;
  maxDiscount: string;
  expires: string;
  used: string;
}

interface Review {
  id: number | string;
  text: string;
  rating?: number;
  user_name?: string;
  created_at?: string;
}

interface StoreData {
  id: string;
  name: string;
  logo: string;
  online: string;
  products: number;
  followers: string;
  currentlyViewing: number;
  rating: number;
  totalReviews: string;
  establishedDate: string;
  responseRate: string;
  bannerImage: string;
  promotions: Promotion[];
  recommendedProducts: Product[];
  description?: string;
  address?: string;
  contactInfo?: string;
  socialLinks?: any;
  categories?: string[];
  reviews?: Review[];
}

// API response interface
interface BakeryApiResponse {
  id: string;
  bakery_name: string;
  email: string;
  phone: string;
  address: string;
  owner_name: string;
  avatar_file?: {
    file_url: string;
  };
  shop_image_files?: Array<{
    file_url: string;
  }>;
  status: string;
  created_at: string;
  confirmed_at?: string;
}

export default function StoreDetailPage({ bakery }: { bakery: BakeryApiResponse }) {
  const [activeTab, setActiveTab] = useState('all');
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { toast } = useToast();

  // Fetch all data for this bakery
  useEffect(() => {
    if (!bakery || !bakery.id) return;
    
    setIsLoading(true);
    
    // Function to fetch data with error handling
    async function fetchData(endpoint: string, defaultData: any) {
      try {
        // For development, simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In production, replace with actual API call
        // const response = await fetch(`/api/bakeries/${bakery.id}/${endpoint}`);
        // if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
        // const data = await response.json();
        // return data.payload || defaultData;
        
        // For now, return default data
        return defaultData;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        toast({
          title: `Couldn't load ${endpoint}`,
          description: "Using sample data instead",
          variant: "destructive"
        });
        return defaultData;
      }
    }

    // Fetch all data in parallel
    async function loadAllData() {
      const logoImage = bakery.avatar_file?.file_url || '/images/auth/auth-illustration.png';
      
      // Default data to use if API fails
      const defaultProducts = [
        { id: 1, name: 'Chocolate Cake', image: logoImage, price: 300, discountedPrice: 255, sold: '12', category: 'Birthday' },
        { id: 2, name: 'Strawberry Cake', image: logoImage, price: 320, discountedPrice: 270, sold: '8', category: 'Birthday' },
        { id: 3, name: 'Cheesecake', image: logoImage, price: 350, discountedPrice: 299, sold: '15', category: 'Wedding' },
        { id: 4, name: 'Red Velvet Cake', image: logoImage, price: 280, discountedPrice: 240, sold: '7', category: 'Wedding' },
        { id: 5, name: 'Vanilla Cupcakes', image: logoImage, price: 150, discountedPrice: 120, sold: '21', category: 'Cupcakes' },
        { id: 6, name: 'Chocolate Cookies', image: logoImage, price: 100, discountedPrice: 85, sold: '18', category: 'Cookies' }
      ];
      
      const defaultPromotions = [
        { id: 1, discount: '20%', minSpend: '₫0', maxDiscount: '₫50k', expires: '31.03.2025', used: '66%' },
        { id: 2, discount: '15%', minSpend: '₫0', maxDiscount: '₫100k', expires: '31.03.2025', used: '59%' },
      ];
      
      const defaultCategories = ['Birthday', 'Wedding', 'Cupcakes', 'Cookies'];
      
      const defaultReviews = [
        { id: 1, text: "The chocolate cake was absolutely delicious! Moist and perfectly sweet.", rating: 5, user_name: "Customer 1", created_at: "2023-12-01" },
        { id: 2, text: "Delivery was prompt and the packaging was excellent.", rating: 4, user_name: "Customer 2", created_at: "2023-11-15" },
      ];

      // Fetch all data in parallel
      const [productData, promotionData, categoryData, reviewData] = await Promise.all([
        fetchData('products', defaultProducts),
        fetchData('promotions', defaultPromotions),
        fetchData('categories', defaultCategories),
        fetchData('reviews', defaultReviews)
      ]);

      // Process and set the data
      setProducts(productData);
      setPromotions(promotionData);
      setCategories(categoryData);
      setReviews(reviewData);
    }

    loadAllData();
  }, [bakery, toast]);

  // Process bakery data and combine with fetched data
  useEffect(() => {
    if (!bakery) return;
    
    try {
      // Calculate how long the bakery has been established
      const createdDate = new Date(bakery.created_at);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + 
                        (now.getMonth() - createdDate.getMonth());
      const establishedText = monthsDiff < 12 
        ? `${monthsDiff} Months Ago` 
        : `${Math.floor(monthsDiff / 12)} Years Ago`;

      // Get the first shop image as banner or use avatar as fallback
      const bannerImage = bakery.shop_image_files && bakery.shop_image_files.length > 0
        ? bakery.shop_image_files[0].file_url
        : bakery.avatar_file?.file_url || '/images/bakery-banner-placeholder.png';
      
      // Get avatar image or use placeholder
      const logoImage = bakery.avatar_file?.file_url || '/images/auth/auth-illustration.png';

      // Create a complete store data object by combining real data with fetched data
      const enhancedData: StoreData = {
        id: bakery.id,
        name: bakery.bakery_name,
        logo: logoImage,
        online: 'Recently active',
        products: products.length,
        followers: Math.floor(Math.random() * 1000 + 100).toString(), // Simulated data
        currentlyViewing: Math.floor(Math.random() * 10) + 1, // Simulated data
        rating: reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + (review.rating || 5), 0) / reviews.length 
          : 5.0,
        totalReviews: reviews.length.toString(),
        establishedDate: establishedText,
        responseRate: '100%', // Simulated data
        bannerImage: bannerImage,
        promotions: promotions,
        recommendedProducts: products,
        description: `${bakery.bakery_name} is a premium bakery offering delicious cakes and pastries.`,
        address: bakery.address,
        contactInfo: `Email: ${bakery.email}, Phone: ${bakery.phone}`,
        categories: categories,
        reviews: reviews
      };
      
      setStoreData(enhancedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing bakery data:", error);
      toast({
        title: "Error processing data",
        description: "There was a problem preparing the store information",
        variant: "destructive"
      });
    }
  }, [bakery, products, promotions, categories, reviews, toast]);

  // Show loading state while processing data
  if (isLoading || !storeData) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-teal"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <StoreHeader bakery={bakery} />
      <HeaderDashboard />
      
      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="relative">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6 rounded-lg bg-gray-100/80 p-1 overflow-x-auto">
            <TabsTrigger value="all" className="text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-custom-teal data-[state=active]:shadow-sm">
              All Products
            </TabsTrigger>
            {storeData.categories && storeData.categories.slice(0, 4).map(category => (
              <TabsTrigger 
                key={category} 
                value={category.toLowerCase()} 
                className="text-sm font-medium rounded-md"
              >
                {category}
              </TabsTrigger>
            ))}
            {storeData.categories && storeData.categories.length > 4 && (
              <TabsTrigger value="more" className="text-sm font-medium rounded-md">More ▼</TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-8">
          {storeData.promotions.length > 0 && (
            <PromotionsSection promotions={storeData.promotions} storeId={storeData.id} />
          )}
          
          {storeData.recommendedProducts.length > 0 && (
            <RecommendedProducts 
              products={storeData.recommendedProducts} 
              storeId={storeData.id} 
              rating={storeData.rating} 
            />
          )}
          
          {storeData.categories && storeData.categories.length > 0 && (
            <CategoriesSection categories={storeData.categories} />
          )}
          
          {storeData.reviews && storeData.reviews.length > 0 && (
            <ReviewsSection reviews={storeData.reviews} />
          )}
          
          <EleganceSection />
        </TabsContent>

        {/* Dynamic tab contents based on categories */}
        {storeData.categories && storeData.categories.map(category => (
          <TabsContent key={category} value={category.toLowerCase()} className="p-4">
            <RecommendedProducts 
              products={storeData.recommendedProducts.filter(p => 
                p.category?.toLowerCase() === category.toLowerCase()
              )} 
              storeId={storeData.id} 
              rating={storeData.rating} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 