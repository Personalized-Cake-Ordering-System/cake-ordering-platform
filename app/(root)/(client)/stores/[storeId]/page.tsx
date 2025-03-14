import { LoadingSpinner } from '@/components/shared/custom-ui/loading-spinner';
import BreadCrumb from '@/components/shared/dashboard/bread-crumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Calendar, Clock, Heart, MessageCircle, PercentCircle, ShoppingCart, Star, Store, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import EleganceSection from '@/components/3d-custom/elegance-section';
import HeaderDashboard from '@/components/3d-custom/header';
import { getBakeryById } from '@/features/barkeries/actions/barkeries-action';

export default async function BakeryPage({ params }: { params: { id: string } }) {
  // Fetch bakery data
  const bakeryData = await getBakeryById(params.id);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard', isLast: false },
    { label: 'Bakeries', href: '/dashboard/bakeries', isLast: false },
    { label: 'Bakery Details', href: `/dashboard/bakeries/${params.id}`, isLast: true },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <BreadCrumb items={breadcrumbItems} />
      <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner /></div>}>
        <StoreDetailPage bakery={bakeryData} />
      </Suspense>
    </div>
  );
}

function StoreDetailPage({ bakery }: { bakery: any }) {
  // Mock data based on the Shopee Mall image
  const mockBakery = {
    id: bakery?.id || '123',
    name: bakery?.name || 'Sweet Delights Bakery',
    logo: bakery?.logo || '/images/auth/auth-illustration.png',
    online: '1 hour ago',
    products: bakery?.productCount || 492,
    followers: bakery?.followerCount || '493.1k',
    currentlyViewing: bakery?.currentlyViewing || 5,
    rating: bakery?.rating || 4.9,
    totalReviews: bakery?.totalReviews || '681k',
    establishedDate: bakery?.establishedDate || '6 Years Ago',
    responseRate: bakery?.responseRate || '100%',
    bannerImage: bakery?.bannerImage || '/images/bakery-banner-placeholder.png',
    promotions: [
      { id: 1, discount: '20%', minSpend: '₫0', maxDiscount: '₫50k', expires: '31.03.2025', used: '66%' },
      { id: 2, discount: '15%', minSpend: '₫0', maxDiscount: '₫100k', expires: '31.03.2025', used: '59%' },
      { id: 3, discount: '8%', minSpend: '₫199k', maxDiscount: '₫30k', expires: 'In 2 hours', used: '89%' },
      { id: 4, discount: '10%', minSpend: '₫240k', maxDiscount: '₫50k', expires: 'In 2 hours', used: '75%' }
    ],
    recommendedProducts: [
      { id: 1, name: 'Chocolate Cake', image: '/images/auth/auth-illustration.png', price: 300, discountedPrice: 255, sold: '1.2k' },
      { id: 2, name: 'Strawberry Cake', image: '/images/auth/auth-illustration.png', price: 300, discountedPrice: 255, sold: '980' },
      { id: 3, name: 'Cheesecake', image: '/images/auth/auth-illustration.png', price: 300, discountedPrice: 255, sold: '1.5k' },
      { id: 4, name: 'Red Velvet Cake', image: '/images/auth/auth-illustration.png', price: 300, discountedPrice: 255, sold: '750' },
      { id: 5, name: 'Vanilla Cake', image: '/images/auth/auth-illustration.png', price: 300, discountedPrice: 255, sold: '2.1k' },
      { id: 6, name: 'Tiramisu', image: '/images/auth/auth-illustration.png', price: 300, discountedPrice: 255, sold: '1.8k' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header section with bakery info - Using custom colors */}

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
                alt={mockBakery.name}
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
                {mockBakery.name}
                <Badge className="bg-gray-800/70 dark:bg-white/20 text-white text-xs">Verified</Badge>
              </h1>

              <p className="text-sm flex items-center justify-center md:justify-start gap-1.5 text-gray-800 dark:text-gray-100">
                <Clock className="h-4 w-4" /> Online {mockBakery.online}
                <span className="inline-block mx-1.5 h-1 w-1 rounded-full bg-gray-600 dark:bg-white/70"></span>
                <Users className="h-4 w-4" /> {mockBakery.currentlyViewing} currently viewing
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
            <StoreMetric icon={<ShoppingCart className="h-5 w-5" />} label="Products" value={mockBakery.products} />
            <StoreMetric icon={<Users className="h-5 w-5" />} label="Followers" value={mockBakery.followers} />
            <StoreMetric icon={<Star className="h-5 w-5 fill-amber-300 stroke-amber-400" />} label="Rating" value={`${mockBakery.rating} (${mockBakery.totalReviews})`} />
            <StoreMetric icon={<Calendar className="h-5 w-5" />} label="Established" value={mockBakery.establishedDate} />
          </div>
        </div>
      </div>
      <HeaderDashboard />
      {/* Tabs - Updated with custom colors */}
      <Tabs defaultValue="all" className="w-full">
        <div className="relative">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6 rounded-lg bg-gray-100/80 p-1 overflow-x-auto">
            <TabsTrigger value="all" className="text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-custom-teal data-[state=active]:shadow-sm">
              All Products
            </TabsTrigger>
            <TabsTrigger value="birthday" className="text-sm font-medium rounded-md">Birthday Cakes</TabsTrigger>
            <TabsTrigger value="wedding" className="text-sm font-medium rounded-md">Wedding Cakes</TabsTrigger>
            <TabsTrigger value="cupcakes" className="text-sm font-medium rounded-md">Cupcakes</TabsTrigger>
            <TabsTrigger value="cookies" className="text-sm font-medium rounded-md">Cookies</TabsTrigger>
            <TabsTrigger value="more" className="text-sm font-medium rounded-md">More ▼</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-8">
          {/* Promotions - Updated with custom colors and dark mode */}
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
              {mockBakery.promotions.map((promo) => (
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

          {/* Recommended Products - Updated with custom colors and dark mode */}
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
              {mockBakery.recommendedProducts.map((product) => (
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
                        <span className="text-xs">{mockBakery.rating}</span>
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
                      <Link href={`/stores/${mockBakery.id}/build/Model3DCustom`} className="flex items-center justify-center">
                        <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Categories - Updated with custom colors and dark mode */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
              <h2 className="text-xl font-bold dark:text-white">Popular Categories</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['Birthday Specials', 'Wedding Collection', 'Seasonal Treats', 'Gluten-Free', 'Vegan Options', 'Party Packages'].map((category, index) => (
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

          {/* Customer Reviews - Updated with custom colors and dark mode */}
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
              {[1, 2, 3].map((review) => (
                <Card key={review} className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-gray-400 dark:text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm dark:text-white">Customer {review}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">
                      {review === 1 && "The chocolate cake was absolutely delicious! Moist and perfectly sweet. Will definitely order again."}
                      {review === 2 && "Delivery was prompt and the packaging was excellent. The cake arrived in perfect condition."}
                      {review === 3 && "Ordered cupcakes for my daughter's birthday. Everyone loved them. Great quality and beautiful decorations!"}
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
          <EleganceSection />
        </TabsContent>

        {/* Other tab contents would go here */}
        <TabsContent value="birthday" className="p-4 text-center text-gray-500">
          Birthday cakes collection coming soon
        </TabsContent>
        <TabsContent value="wedding" className="p-4 text-center text-gray-500">
          Wedding cakes collection coming soon
        </TabsContent>
        <TabsContent value="cupcakes" className="p-4 text-center text-gray-500">
          Cupcakes collection coming soon
        </TabsContent>
        <TabsContent value="cookies" className="p-4 text-center text-gray-500">
          Cookies collection coming soon
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for store metrics
function StoreMetric({ icon, label, value }) {
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