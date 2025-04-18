'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ShoppingCart,
  Heart,
  Share2,
  Clock,
  Check,
  Minus,
  Plus,
  Star,
  Truck,
  CalendarHeart,
  CircleDollarSign,
  ShieldCheck
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ModelGLB } from '@/components/3d-custom/modelGLB';
import { useInView } from 'react-intersection-observer';
import { useWishlist } from '@/app/store/useWishlist';
import { toast } from 'sonner';
import { useCart } from '@/app/store/useCart';

// Add interface for API cake type
interface ApiCake {
  available_cake_price: number;
  available_cake_name: string;
  available_cake_description: string;
  available_cake_type: string;
  available_cake_quantity: number;
  available_cake_image_files: {
    file_url: string;
    id: string;
  }[];
  available_cake_size: string;
  available_cake_serving_size: string;
  has_low_shipping_fee: boolean;
  is_quality_guaranteed: boolean;
  id: string;
  bakery_id?: string;
}

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    date: '2 tuần trước',
    rating: 5,
    comment: 'Tuyệt vời! Bánh rất mềm và hương vị sô cô la đậm đà nhưng không quá ngọt. Mọi người trong bữa tiệc đều rất thích!',
    avatar: '/imagecake1.jpeg',
  },
  {
    id: 2,
    name: 'Michael Chen',
    date: '1 tháng trước',
    rating: 4,
    comment: 'Bánh ngon và trình bày đẹp mắt. Giao hàng đúng giờ và bánh đến trong tình trạng hoàn hảo. Sẽ đặt lại.',
    avatar: '/imagecake2.jpeg',
  },
  {
    id: 3,
    name: 'Emma Williams',
    date: '2 tháng trước',
    rating: 5,
    comment: 'Chiếc bánh hoàn hảo cho dịp kỷ niệm! Thơm ngon, sang trọng và hoàn toàn xứng đáng với giá tiền. Chồng tôi rất thích món quà sinh nhật này.',
    avatar: '/imagecake.jpg',
  },
];

// Add these animation variants before the CakeDetail component
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const CakeDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { cakeId } = params;

  // Add state for API cake data
  const [cakeData, setCakeData] = useState<ApiCake | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add cart state
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Add wishlist hook
  const { addToWishlist, removeFromWishlist, items } = useWishlist();

  // Fetch cake data from API
  useEffect(() => {
    const fetchCakeData = async () => {
      try {
        const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/available_cakes');
        const data = await response.json();
        if (data.status_code === 200) {
          const cake = data.payload.find((c: ApiCake) => c.id === cakeId);
          if (cake) {
            setCakeData(cake);
          }
        }
      } catch (error) {
        console.error('Error fetching cake:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCakeData();
  }, [cakeId]);

  // Add handleAddToCart function
  const handleAddToCart = async () => {
    if (!cakeData) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login to add items to cart');
        router.push('/sign-in');
        return;
      }

      const cartPayload = {
        bakeryId: cakeData.bakery_id || "",
        order_note: "",
        phone_number: "",
        shipping_address: "",
        latitude: "",
        longitude: "",
        pickup_time: new Date().toISOString(),
        shipping_type: "DELIVERY",
        payment_type: "QR_CODE",
        voucher_code: "",
        cartItems: [{
          cake_name: cakeData.available_cake_name,
          main_image_id: cakeData.available_cake_image_files[0]?.id || "",
          main_image: cakeData.available_cake_image_files[0] || null,
          quantity: quantity,
          cake_note: "",
          sub_total_price: cakeData.available_cake_price * quantity,
          available_cake_id: cakeData.id,
          custom_cake_id: null,
          bakery_id: cakeData.bakery_id || ""
        }]
      };

      const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/carts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(cartPayload)
      });

      const data = await response.json();

      if (data.status_code === 200) {
        toast.success('Added to cart successfully');
        router.push('/cart');
      } else {
        toast.error(data.errors?.[0] || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Add wishlist toggle handler
  const handleWishlistToggle = () => {
    if (!cakeData) return;

    const isInWishlist = items.some(item => item.id === cakeData.id);

    if (isInWishlist) {
      removeFromWishlist(cakeData.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: cakeData.id,
        name: cakeData.available_cake_name,
        price: cakeData.available_cake_price,
        image: cakeData.available_cake_image_files?.[0]?.file_url || '/placeholder-cake.jpg',
      });
      toast.success('Added to wishlist');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-pink-600 font-medium">Đang tải thông tin bánh...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!cakeData) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy bánh</h1>
        <Button onClick={() => router.back()}>Quay Lại</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Back Button */}
      <motion.div
        className="mb-6"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-pink-500 transition-colors duration-300"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách bánh
        </Button>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column - Images */}
        <motion.div
          variants={fadeIn}
          className="relative"
        >
          <div className="sticky top-24">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-4 aspect-square relative">
              <Image
                src={cakeData.available_cake_image_files[0]?.file_url || '/placeholder-cake.jpg'}
                alt={cakeData.available_cake_name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Right Column - Details */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <motion.div variants={fadeIn} className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200">
                {cakeData.available_cake_type}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {cakeData.available_cake_name}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {cakeData.available_cake_description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-pink-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cakeData.available_cake_price)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CalendarHeart className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-600 dark:text-gray-300">Kích thước: {cakeData.available_cake_size}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-600 dark:text-gray-300">Phù hợp: {cakeData.available_cake_serving_size}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {cakeData.has_low_shipping_fee ? 'Phí giao hàng thấp' : 'Phí giao hàng cao'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {cakeData.is_quality_guaranteed ? 'Đảm bảo chất lượng' : 'Chất lượng không đảm bảo'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <Separator className="mb-8" />

          {/* Quantity Section */}
          <motion.div variants={fadeIn} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Số lượng</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(cakeData.available_cake_quantity, quantity + 1))}
                  disabled={quantity >= cakeData.available_cake_quantity}
                  className="h-10 w-10 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Update Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white h-12 text-base"
                size="lg"
                onClick={handleAddToCart}
                disabled={cakeData.available_cake_quantity === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {cakeData.available_cake_quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={`h-12 w-12 ${items.some(item => item.id === cakeData?.id)
                    ? 'bg-pink-50 border-pink-500'
                    : 'border-pink-200'
                    } hover:bg-pink-50 dark:hover:bg-pink-950/30`}
                >
                  <Heart
                    className={`h-5 w-5 ${items.some(item => item.id === cakeData?.id)
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-pink-500'
                      }`}
                  />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mt-16"
      >
        <h2 className="text-2xl font-bold mb-8">Đánh giá từ khách hàng</h2>

        <div className="grid gap-6">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={fadeIn}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{review.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CakeDetail;