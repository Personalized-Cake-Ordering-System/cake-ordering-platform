'use-client'
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Users, Clock, PercentCircle, Heart, MessageCircle, Calendar, Store, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BreadCrumb from '@/components/shared/dashboard/bread-crumb';
import { LoadingSpinner } from '@/components/shared/custom-ui/loading-spinner';
import { cn } from '@/lib/utils';
import { getBakeryById } from '@/features/barkeries/actions/barkeries-action';

export default async function BakeryPage({ params }: { params: { id: string } }) {
  // Fetch bakery data
  const bakeryData = await getBakeryById(params.id);
  console.log('====================================');
  console.log("barkery data is: " + bakeryData);
  console.log('====================================');
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard', isLast: false },
    { label: 'Bakeries', href: '/dashboard/bakeries', isLast: false },
    { label: bakeryData?.bakery_name || 'Bakery Details', href: `/dashboard/bakeries/${params.id}`, isLast: true },
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
  if (!bakery) {
    return <div className="p-8 text-center">Bakery data not found or could not be loaded.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header section with bakery info - modernized */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-lg">
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
                src={bakery.avatar_file?.file_url || '/images/auth/auth-illustration.png'}
                alt={bakery.bakery_name}
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
              <Badge className="absolute bottom-1 right-1 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                <Award className="h-3 w-3 mr-1" /> {bakery.status}
              </Badge>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                {bakery.bakery_name}
                <Badge className="bg-white/20 text-white text-xs">{bakery.status}</Badge>
              </h1>

              <p className="text-sm flex items-center justify-center md:justify-start gap-1.5">
                <Clock className="h-4 w-4" /> Status: {bakery.status}
                {bakery.confirmed_at && bakery.confirmed_at !== "0001-01-01T00:00:00" && (
                  <>
                    <span className="inline-block mx-1.5 h-1 w-1 rounded-full bg-white/70"></span>
                    <Calendar className="h-4 w-4" /> Confirmed: {new Date(bakery.confirmed_at).toLocaleDateString()}
                  </>
                )}
              </p>

              <div className="flex gap-3 justify-center md:justify-start">
                <Button size="sm" className="bg-white text-red-600 hover:bg-white/90 rounded-full px-4">
                  <Heart className="h-4 w-4 mr-1.5" /> Follow
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent border-white text-white hover:bg-white/20 rounded-full px-4">
                  <MessageCircle className="h-4 w-4 mr-1.5" /> Chat
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 md:ml-auto grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <StoreMetric icon={<ShoppingCart className="h-5 w-5" />} label="Tax Code" value={bakery.tax_code || 'N/A'} />
            <StoreMetric icon={<Users className="h-5 w-5" />} label="Owner" value={bakery.owner_name} />
            <StoreMetric icon={<Star className="h-5 w-5 fill-amber-300 stroke-amber-400" />} label="Phone" value={bakery.phone} />
            <StoreMetric icon={<Calendar className="h-5 w-5" />} label="Created" value={new Date(bakery.created_at).toLocaleDateString()} />
          </div>
        </div>
      </div>

      {/* Tabs - modernized */}
      <Tabs defaultValue="info" className="w-full">
        <div className="relative">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6 rounded-lg bg-gray-100/80 p-1 overflow-x-auto">
            <TabsTrigger value="info" className="text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
              Shop Info
            </TabsTrigger>
            <TabsTrigger value="products" className="text-sm font-medium rounded-md">Products</TabsTrigger>
            <TabsTrigger value="identity" className="text-sm font-medium rounded-md">Identity</TabsTrigger>
            <TabsTrigger value="vouchers" className="text-sm font-medium rounded-md">Vouchers</TabsTrigger>
            <TabsTrigger value="reviews" className="text-sm font-medium rounded-md">Reviews</TabsTrigger>
            <TabsTrigger value="more" className="text-sm font-medium rounded-md">More ▼</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="space-y-8">
          {/* Bakery Information */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold flex items-center">
                <Store className="h-5 w-5 text-red-500 mr-2" />
                Bakery Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InfoItem label="Bakery Name" value={bakery.bakery_name} />
                <InfoItem label="Owner Name" value={bakery.owner_name} />
                <InfoItem label="Email" value={bakery.email} />
                <InfoItem label="Phone" value={bakery.phone} />
                <InfoItem label="Address" value={bakery.address || 'Not provided'} />
              </div>
              <div className="space-y-4">
                <InfoItem label="ID Card Number" value={bakery.identity_card_number} />
                <InfoItem label="Tax Code" value={bakery.tax_code} />
                <InfoItem label="Status" value={bakery.status} />
                <InfoItem label="Created At" value={new Date(bakery.created_at).toLocaleString()} />
                <InfoItem
                  label="Confirmed At"
                  value={bakery.confirmed_at && bakery.confirmed_at !== "0001-01-01T00:00:00"
                    ? new Date(bakery.confirmed_at).toLocaleString()
                    : 'Not confirmed yet'}
                />
              </div>
            </div>
          </div>

          {/* ID Card Images */}
          {(bakery.front_card_file || bakery.back_card_file) && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-bold flex items-center">
                  <PercentCircle className="h-5 w-5 text-red-500 mr-2" />
                  Identity Card Images
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bakery.front_card_file && (
                  <Card className="overflow-hidden">
                    <div className="p-3 bg-gray-50 text-gray-700 font-medium border-b">Front Side</div>
                    <CardContent className="p-4">
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={bakery.front_card_file.file_url}
                          alt="Front ID Card"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {bakery.back_card_file && (
                  <Card className="overflow-hidden">
                    <div className="p-3 bg-gray-50 text-gray-700 font-medium border-b">Back Side</div>
                    <CardContent className="p-4">
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={bakery.back_card_file.file_url}
                          alt="Back ID Card"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Shop Images */}
          {bakery.shop_image_files && bakery.shop_image_files.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-bold flex items-center">
                  <Store className="h-5 w-5 text-red-500 mr-2" />
                  Shop Images
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bakery.shop_image_files.map((image, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={image.file_url}
                        alt={`Shop Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No shop images message */}
          {(!bakery.shop_image_files || bakery.shop_image_files.length === 0) && (
            <Card className="p-6 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <Store className="h-12 w-12 text-gray-300" />
                <h3 className="font-medium">No Shop Images Available</h3>
                <p className="text-sm">This bakery hasn't uploaded any shop images yet.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Other tab contents */}
        <TabsContent value="products" className="p-6 text-center text-gray-500">
          <div className="flex flex-col items-center gap-3">
            <ShoppingCart className="h-12 w-12 text-gray-300" />
            <h3 className="font-medium">No Products Available</h3>
            <p>This bakery hasn't added any products yet or the products data couldn't be loaded.</p>
          </div>
        </TabsContent>

        <TabsContent value="identity" className="p-6 text-center text-gray-500">
          <div className="flex flex-col items-center gap-3">
            <Users className="h-12 w-12 text-gray-300" />
            <h3 className="font-medium">Identity Information</h3>
            <p>ID Card Number: {bakery.identity_card_number}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto mt-4">
              {bakery.front_card_file && (
                <Card className="overflow-hidden">
                  <div className="p-3 bg-gray-50 text-gray-700 font-medium border-b">Front Side</div>
                  <CardContent className="p-4">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={bakery.front_card_file.file_url}
                        alt="Front ID Card"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {bakery.back_card_file && (
                <Card className="overflow-hidden">
                  <div className="p-3 bg-gray-50 text-gray-700 font-medium border-b">Back Side</div>
                  <CardContent className="p-4">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={bakery.back_card_file.file_url}
                        alt="Back ID Card"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vouchers" className="p-6 text-center text-gray-500">
          <div className="flex flex-col items-center gap-3">
            <PercentCircle className="h-12 w-12 text-gray-300" />
            <h3 className="font-medium">No Vouchers Available</h3>
            <p>This bakery hasn't created any vouchers yet or the voucher data couldn't be loaded.</p>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="p-6 text-center text-gray-500">
          <div className="flex flex-col items-center gap-3">
            <Star className="h-12 w-12 text-gray-300" />
            <h3 className="font-medium">No Reviews Available</h3>
            <p>This bakery hasn't received any reviews yet or the review data couldn't be loaded.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for store metrics
function StoreMetric({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
      <div className="text-white/90">
        {icon}
      </div>
      <div>
        <div className="text-xs opacity-80">{label}:</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}

// Helper component for information items
function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}