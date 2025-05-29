'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  ChevronRight
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
import BakerySwitchModal from '@/components/shared/bakery-switch-modal';

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
  cake_reviews: {
    content: string;
    rating: number;
    created_at: string;
    customer_id: string;
    image_id?: string;
  }[];
  metric: {
    rating_average: number;
    reviews_count: number;
  };
}

// Add interface for API response
interface ApiResponse {
  status_code: number;
  errors: any[];
  meta_data: any;
  payload: ApiCake;
}

// Add interface for customer details
interface CustomerDetails {
  name: string;
  address: string;
}

// Add interface for review image
interface ReviewImage {
  file_url: string;
}

// Add these interfaces after the existing interfaces
interface ReviewFilter {
  rating: number | null;
}

// Add these constants after the existing constants
const ITEMS_PER_PAGE = 5;

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
  const [customerDetails, setCustomerDetails] = useState<{ [key: string]: CustomerDetails }>({});
  const [reviewImages, setReviewImages] = useState<{ [key: string]: string }>({});

  // Add state for filtering and pagination
  const [filter, setFilter] = useState<ReviewFilter>({ rating: null });
  const [currentPage, setCurrentPage] = useState(1);

  // Add cart state
  const { addToCart, openBakerySwitchModal, bakerySwitchModal } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Add new state for handling modal state locally
  const [pendingCartItem, setPendingCartItem] = useState<any>(null);

  // Add wishlist hook
  const { addToWishlist, removeFromWishlist, items } = useWishlist();

  // Add filtered and paginated reviews calculation
  const filteredReviews = useMemo(() => {
    if (!cakeData?.cake_reviews) return [];

    return cakeData.cake_reviews.filter(review => {
      if (filter.rating === null) return true;
      return review.rating === filter.rating;
    });
  }, [cakeData?.cake_reviews, filter.rating]);

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredReviews, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter.rating]);

  // Fetch cake data from API
  useEffect(() => {
    const fetchCakeData = async () => {
      try {
        const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/available_cakes/${cakeId}`);
        const data: ApiResponse = await response.json();
        console.log('Cake Data Response:', data);

        if (data.status_code === 200 && data.payload) {
          console.log('Found cake:', data.payload);
          setCakeData(data.payload);
        } else {
          console.error('Failed to fetch cake:', data);
          setCakeData(null);
        }
      } catch (error) {
        console.error('Error fetching cake:', error);
        setCakeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (cakeId) {
      fetchCakeData();
    }
  }, [cakeId]);

  // Add functions to fetch customer details and review images
  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch customer details:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log('Customer Details Response:', {
        customerId,
        response: data
      });

      if (data.status_code === 200) {
        setCustomerDetails(prev => ({
          ...prev,
          [customerId]: {
            name: data.payload.name,
            address: data.payload.address
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const fetchReviewImage = async (imageId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/files/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch review image:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log('Review Image Response:', {
        imageId,
        response: data
      });

      if (data.status_code === 200 && data.payload.file_url) {
        setReviewImages(prev => ({
          ...prev,
          [imageId]: data.payload.file_url
        }));
      }
    } catch (error) {
      console.error('Error fetching review image:', error);
    }
  };

  // Add useEffect to fetch customer details and review images when cake data changes
  useEffect(() => {
    if (cakeData?.cake_reviews) {
      cakeData.cake_reviews.forEach(review => {
        if (review.customer_id && !customerDetails[review.customer_id]) {
          fetchCustomerDetails(review.customer_id);
        }
        if (review.image_id && !reviewImages[review.image_id]) {
          fetchReviewImage(review.image_id);
        }
      });
    }
  }, [cakeData, customerDetails, reviewImages]);

  // Update handleAddToCart function
  const handleAddToCart = async () => {
    if (!cakeData) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login to add items to cart');
        router.push('/sign-in');
        return;
      }

      // Create new cart item for local storage
      const cartItem = {
        id: cakeData.id,
        quantity: quantity,
        bakeryId: cakeData.bakery_id || '',
        config: {
          price: cakeData?.available_cake_price || 0,
          size: cakeData.available_cake_size || "6",
          sponge: "",
          filling: "",
          outerIcing: [""],
          icing: "",
          topping: null,
          candles: null,
          message: "",
          messageType: "none" as const,
          plaqueColor: "",
          goo: null,
          extras: [],
          board: "",
          uploadedImage: null,
          imageUrl: cakeData.available_cake_image_files?.[0]?.file_url || null,
          pipingColor: "",
          name: cakeData.available_cake_name,
          description: cakeData.available_cake_description,
          type: cakeData.available_cake_type
        },
        price: (cakeData?.available_cake_price || 0) * quantity
      };

      // Check if the bakeryId is valid
      if (!cartItem.bakeryId) {
        toast.error('This item cannot be added to cart: missing bakery information');
        return;
      }

      // Get cart state
      const cartState = useCart.getState();
      const { items, currentBakeryId, addToCart, openBakerySwitchModal } = cartState;

      // Debug what's happening with the cart state
      console.log('Current cart state:', { items: items.length, currentBakeryId });

      // Check if cart is truly empty - both no items and no bakery ID
      const isCartEmpty = items.length === 0;

      // Check if this is a different bakery than what's already in cart
      if (!isCartEmpty && currentBakeryId && currentBakeryId !== cartItem.bakeryId) {
        // Save the pending cart item for later use after confirmation
        setPendingCartItem(cartItem);

        // Get bakery names to display in the modal
        const currentBakeryName = "hiện tại";
        const newBakeryName = cakeData.available_cake_name.split(' ')[0] || "mới";

        // Open the bakery switch modal
        openBakerySwitchModal(
          currentBakeryName,
          newBakeryName,
          () => {
            // This function runs when user confirms switch
            handleConfirmBakerySwitch(cartItem);
          }
        );

        return;
      }

      // If no bakery conflict or empty cart, proceed with adding to cart
      const added = addToCart(cartItem);

      if (!added) {
        toast.error('Could not add item to cart. Please try again.');
        return;
      }

      // Process with API request to add to cart
      await processApiCartUpdate(cartItem);

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Function to handle confirmed bakery switch
  const handleConfirmBakerySwitch = async (cartItem: any) => {
    try {
      // Get cart store actions
      const { changeBakery, addToCart, closeBakerySwitchModal } = useCart.getState();

      console.log('Switching bakery to:', cartItem.bakeryId);

      // Clear cart and set new bakery - now awaited
      const changeBakeryResult = await changeBakery(cartItem.bakeryId, true);

      if (!changeBakeryResult) {
        toast.error('Failed to change bakery. Please try again.');
        closeBakerySwitchModal();
        return;
      }

      console.log('Successfully changed bakery, now adding item');

      // Add the new item
      const added = addToCart(cartItem);

      if (!added) {
        toast.error('Failed to add item after bakery switch');
        closeBakerySwitchModal();
        return;
      }

      // Make sure to close the modal regardless of what happens with the API update
      closeBakerySwitchModal();

      // Process with API request to add to cart
      await processApiCartUpdate(cartItem);

      // Save notification about bakery change for cart page
      localStorage.setItem('bakeryChangeNotice', JSON.stringify({
        bakeryName: cartItem.config.name.split(' ')[0] || 'new bakery'
      }));

    } catch (error) {
      console.error('Error handling bakery switch:', error);
      toast.error('Failed to switch bakery');

      // Make sure modal is closed even on error
      const { closeBakerySwitchModal } = useCart.getState();
      closeBakerySwitchModal();
    }
  };

  // Function to handle the API cart update
  const processApiCartUpdate = async (cartItem: any) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      // At this point, the API cart should be empty or have items from the same bakery
      // Fetch current API cart to get the latest state
      const cartResponse = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': '*/*'
        }
      });

      if (!cartResponse.ok) {
        throw new Error(`Failed to fetch cart: ${cartResponse.status}`);
      }

      const cartData = await cartResponse.json();

      // Get existing cart items or initialize empty array
      let existingCartItems = [];

      if (cartData.status_code === 200 && cartData.payload && cartData.payload.cartItems) {
        existingCartItems = cartData.payload.cartItems;

        // Check if there are items from a different bakery
        const hasDifferentBakeryItems = existingCartItems.some(
          (item: any) => item.bakery_id && item.bakery_id !== cartItem.bakeryId
        );

        if (hasDifferentBakeryItems) {
          // Need to delete cart first before adding new items
          console.log("Detected items from different bakery in API cart, deleting first");
          const deleteResponse = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (!deleteResponse.ok) {
            throw new Error(`Failed to delete cart: ${deleteResponse.status}`);
          }

          // Reset existing items
          existingCartItems = [];
        }
      }

      // Check if the same cake already exists in API cart
      const existingItemIndex = existingCartItems.findIndex(
        (item: any) => item.available_cake_id === cartItem.id
      );

      let updatedCartItems;

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        updatedCartItems = [...existingCartItems];
        const existingItem = updatedCartItems[existingItemIndex];
        updatedCartItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + cartItem.quantity,
          sub_total_price: (cakeData?.available_cake_price || 0) * (existingItem.quantity + cartItem.quantity)
        };
      } else {
        // New item, add to cart
        const newCartItem = {
          cake_name: cartItem.config.name,
          main_image_id: cakeData?.available_cake_image_files[0]?.id || "",
          main_image: cakeData?.available_cake_image_files[0] || null,
          quantity: cartItem.quantity,
          cake_note: "",
          sub_total_price: cartItem.price,
          available_cake_id: cartItem.id,
          custom_cake_id: null,
          bakery_id: cartItem.bakeryId || ""
        };

        updatedCartItems = [...existingCartItems, newCartItem];
      }

      // Prepare the complete cart payload with all items
      const cartPayload = {
        bakeryId: cartItem.bakeryId || "",
        order_note: "",
        phone_number: "",
        shipping_address: "",
        latitude: "",
        longitude: "",
        pickup_time: new Date().toISOString(),
        shipping_type: "DELIVERY",
        payment_type: "QR_CODE",
        voucher_code: "",
        cartItems: updatedCartItems
      };

      // Update the cart with all items
      const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(cartPayload)
      });

      const data = await response.json();

      if (data.status_code === 200) {
        toast.success('Thêm vào giỏ hàng thành công!');
        router.push('/cart');
      } else {
        toast.error(data.errors?.[0] || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error during API cart update:', error);
      toast.error('Failed to update cart on server');
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
        price: cakeData?.available_cake_price || 0,
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
              {cakeData?.available_cake_image_files?.[0]?.file_url ? (
                <Image
                  src={cakeData.available_cake_image_files[0].file_url}
                  alt={cakeData.available_cake_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Đánh giá từ khách hàng</h2>
          {cakeData?.metric && (
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{cakeData.metric.rating_average.toFixed(1)}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-gray-600 dark:text-gray-400">{cakeData.metric.reviews_count} đánh giá</span>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Lọc theo:</span>
            <div className="flex items-center gap-2">
              <Button
                variant={filter.rating === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter({ rating: null })}
                className="rounded-full"
              >
                Tất cả
              </Button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Button
                  key={rating}
                  variant={filter.rating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter({ rating })}
                  className="rounded-full flex items-center gap-1"
                >
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  {rating}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {filteredReviews.length > 0 ? (
          <>
            <div className="grid gap-6">
              {paginatedReviews.map((review, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-sm">
                      <span className="text-pink-600 dark:text-pink-400 font-semibold">
                        {customerDetails[review.customer_id]?.name?.slice(0, 2).toUpperCase() || review.customer_id.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {customerDetails[review.customer_id]?.name || `Khách hàng ${review.customer_id.slice(0, 4)}`}
                          </h3>
                          {customerDetails[review.customer_id]?.address && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {customerDetails[review.customer_id].address}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{review.content}</p>
                      {review.image_id && reviewImages[review.image_id] && (
                        <div className="mt-4">
                          <Image
                            src={reviewImages[review.image_id]}
                            alt="Review image"
                            width={200}
                            height={200}
                            className="rounded-lg object-cover shadow-sm hover:shadow-md transition-shadow duration-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="rounded-full w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Star className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {filter.rating === null
                ? "Chưa có đánh giá nào cho sản phẩm này."
                : `Không tìm thấy đánh giá ${filter.rating} sao.`}
            </p>
          </div>
        )}
      </motion.div>

      {/* Add the BakerySwitchModal */}
      <BakerySwitchModal
        isOpen={bakerySwitchModal.isOpen}
        currentBakeryName={bakerySwitchModal.currentBakeryName}
        newBakeryName={bakerySwitchModal.newBakeryName}
        onConfirm={bakerySwitchModal.onConfirm}
        onCancel={bakerySwitchModal.onCancel}
      />
    </div>
  );
};

export default CakeDetail;