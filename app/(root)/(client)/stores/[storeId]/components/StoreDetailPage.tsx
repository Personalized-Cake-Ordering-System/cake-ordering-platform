"use client";

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Mail, Calendar, Store, Image as ImageIcon, Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, Star, AlertTriangle } from 'lucide-react';
import StoreHeader from './StoreHeader';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from 'next/image';
import axios from 'axios';
import CakeCustomizer from '@/components/3d-custom/cake-customize';
import { useWishlist } from '@/app/store/useWishlist';
import { useCart } from '@/app/store/useCart';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// API response interfaces
interface FileData {
  file_name: string;
  file_url: string;
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  is_deleted: boolean;
}

interface BakeryData {
  bakery_name: string;
  email: string;
  phone: string;
  address: string;
  latitude?: string;
  longitude?: string;
  bank_account?: string | null;
  owner_name: string;
  avatar_file?: {
    file_url: string;
  };
  identity_card_number?: string;
  front_card_file_id?: string;
  front_card_file?: FileData;
  back_card_file_id?: string;
  back_card_file?: FileData;
  tax_code?: string;
  status: string;
  confirmed_at?: string;
  shop_image_files?: Array<{
    file_url: string;
  }>;
  id: string;
  created_at: string;
  created_by?: string;
  updated_at?: string | null;
  updated_by?: string | null;
  is_deleted?: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
}

// Store information interface
interface StoreInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ownerName: string;
  avatar: string;
  bannerImages: string[];
  status: string;
  createdAt: string;
  taxCode?: string;
  cake_description: string;
  price_description: string;
  bakery_description: string;
}

interface AvailableCake {
  available_cake_price: number;
  available_cake_name: string;
  available_cake_description: string;
  available_cake_type: string;
  available_cake_quantity: number;
  available_main_image_id: string;
  available_cake_main_image: null;
  available_cake_image_files: FileData[];
  bakery_id: string;
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  is_deleted: boolean;
}

interface ApiResponse {
  status_code: number;
  errors: any[];
  meta_data: {
    total_items_count: number;
    page_size: number;
    total_pages_count: number;
    page_index: number;
    has_next: boolean;
    has_previous: boolean;
  };
  payload: AvailableCake[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
    avatar_url?: string;
  };
}

interface ReviewApiResponse {
  status_code: number;
  errors: any[];
  meta_data: {
    total_items_count: number;
    page_size: number;
    total_pages_count: number;
    page_index: number;
    has_next: boolean;
    has_previous: boolean;
  };
  payload: Review[];
}

export default function StoreDetailPage({ bakery }: { bakery: BakeryData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cakes, setCakes] = useState<AvailableCake[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const { addToWishlist, removeFromWishlist, items } = useWishlist();
  const { toast } = useToast();

  // Add new state for filters
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 9,
    totalPages: 1,
    totalItems: 0
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPagination, setReviewPagination] = useState({
    currentPage: 0,
    pageSize: 5,
    totalPages: 1,
    totalItems: 0
  });

  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Filter and sort cakes
  const filteredAndSortedCakes = useMemo(() => {
    let result = [...cakes];

    // Apply filter
    if (filterBy === 'inStock') {
      result = result.filter(cake => cake.available_cake_quantity > 0);
    } else if (filterBy === 'outOfStock') {
      result = result.filter(cake => cake.available_cake_quantity === 0);
    }

    // Apply sort
    switch (sortBy) {
      case 'priceAsc':
        result.sort((a, b) => a.available_cake_price - b.available_cake_price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.available_cake_price - a.available_cake_price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [cakes, sortBy, filterBy]);

  useEffect(() => {
    if (!bakery) return;

    try {
      const storeData: StoreInfo = {
        id: bakery.id,
        name: bakery.bakery_name,
        email: bakery.email,
        phone: bakery.phone,
        address: bakery.address,
        ownerName: bakery.owner_name,
        avatar: bakery.avatar_file?.file_url || '/images/default-avatar.png',
        bannerImages: [
          ...(bakery.shop_image_files?.map(img => img.file_url) || []),
          bakery.avatar_file?.file_url,
        ].filter(Boolean) as string[],
        status: bakery.status,
        createdAt: new Date(bakery.created_at).toLocaleDateString(),
        taxCode: bakery.tax_code,
        cake_description: "Chuyên cung cấp các loại bánh kem tươi, bánh sinh nhật và bánh theo yêu cầu với nguyên liệu chất lượng cao.",
        price_description: "Giá cả hợp lý từ 150.000đ, tùy theo kích thước và thiết kế bánh.",
        bakery_description: "BreadTalk là tiệm bánh gia đình với hơn 5 năm kinh nghiệm trong việc làm bánh và phục vụ khách hàng khu vực trung tâm Sài Gòn."
      };

      setStoreInfo(storeData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing bakery data:", error);
      toast({
        title: "Error processing data",
        description: "There was a problem preparing the store information",
        variant: "destructive"
      });
    }
  }, [bakery, toast]);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const response = await axios.get<ApiResponse>(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/bakeries/${bakery.id}/available_cakes`, {
          params: {
            'page-index': pagination.currentPage,
            'page-size': pagination.pageSize,
            'sort-by': sortBy,
            'filter-by': filterBy
          }
        });
        if (response.data.status_code === 200) {
          setCakes(response.data.payload);
          setPagination(prev => ({
            ...prev,
            totalPages: response.data.meta_data.total_pages_count,
            totalItems: response.data.meta_data.total_items_count
          }));
        }
      } catch (error) {
        console.error("Error fetching cakes:", error);
        toast({
          title: "Error fetching cakes",
          description: "There was a problem loading the available cakes",
          variant: "destructive"
        });
      }
    };

    if (bakery?.id) {
      fetchCakes();
    }
  }, [bakery?.id, toast, pagination.currentPage, pagination.pageSize, sortBy, filterBy]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<ReviewApiResponse>(
          `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/bakeries/${bakery.id}/reviews`,
          {
            params: {
              'page-index': reviewPagination.currentPage,
              'page-size': reviewPagination.pageSize,
            }
          }
        );
        if (response.data.status_code === 200) {
          setReviews(response.data.payload);
          setReviewPagination(prev => ({
            ...prev,
            totalPages: response.data.meta_data.total_pages_count,
            totalItems: response.data.meta_data.total_items_count
          }));
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          title: "Error fetching reviews",
          description: "There was a problem loading the store reviews",
          variant: "destructive"
        });
      }
    };

    if (bakery?.id) {
      fetchReviews();
    }
  }, [bakery?.id, reviewPagination.currentPage, reviewPagination.pageSize]);

  const handleWishlistToggle = (cake: AvailableCake) => {
    const isInWishlist = items.some(item => item.id === cake.id);

    if (isInWishlist) {
      removeFromWishlist(cake.id);
      toast({
        title: "Success",
        description: "Removed from wishlist",
      });
    } else {
      addToWishlist({
        id: cake.id,
        name: cake.available_cake_name,
        price: cake.available_cake_price,
        image: cake.available_cake_image_files?.[0]?.file_url || '/placeholder-cake.jpg',
      });
      toast({
        title: "Success",
        description: "Added to wishlist",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handleReviewPageChange = (newPage: number) => {
    setReviewPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handleCreateReview = async () => {
    if (!userReview.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung đánh giá",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/bakeries/${bakery.id}/reviews`,
        {
          rating: userRating,
          comment: userReview
        }
      );

      if (response.data.status_code === 200) {
        toast({
          title: "Thành công",
          description: "Đánh giá của bạn đã được gửi thành công",
        });
        setUserReview('');
        setUserRating(5);
        // Refresh reviews
        const currentPage = reviewPagination.currentPage;
        setReviewPagination(prev => ({ ...prev, currentPage: 0 }));
        setTimeout(() => setReviewPagination(prev => ({ ...prev, currentPage })), 100);
      }
    } catch (error) {
      console.error("Error creating review:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi gửi đánh giá",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportReview = async () => {
    if (!selectedReviewId || !reportReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do báo cáo",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post(
        `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/reviews/${selectedReviewId}/reports`,
        {
          reason: reportReason
        }
      );

      if (response.data.status_code === 200) {
        toast({
          title: "Thành công",
          description: "Báo cáo của bạn đã được gửi thành công",
        });
        setReportDialogOpen(false);
        setReportReason('');
        setSelectedReviewId(null);
      }
    } catch (error) {
      console.error("Error reporting review:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi gửi báo cáo",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !storeInfo) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <StoreHeader storeInfo={storeInfo} />

      <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-6 rounded-lg bg-white p-1 shadow-sm border border-gray-100">
          <TabsTrigger value="info" className="flex items-center gap-2 data-[state=active]:bg-custom-teal data-[state=active]:text-white transition-all duration-200">
            <Store className="w-4 h-4" />
            Thông tin cửa hàng
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2 data-[state=active]:bg-custom-teal data-[state=active]:text-white transition-all duration-200">
            <ImageIcon className="w-4 h-4" />
            Hình ảnh cửa hàng
          </TabsTrigger>
          <TabsTrigger value="cakes" className="flex items-center gap-2 data-[state=active]:bg-custom-teal data-[state=active]:text-white transition-all duration-200">
            <ImageIcon className="w-4 h-4" />
            Bánh có sẵn
          </TabsTrigger>
          <TabsTrigger value="customCake" className="flex items-center gap-2 data-[state=active]:bg-custom-teal data-[state=active]:text-white transition-all duration-200">
            <ImageIcon className="w-4 h-4" />
            Tạo bánh
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-custom-teal data-[state=active]:text-white transition-all duration-200">
            <Star className="w-4 h-4" />
            Đánh giá
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6 text-custom-teal border-b border-gray-100 pb-4">Thông tin cửa hàng</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <Store className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tên cửa hàng</p>
                    <p className="text-lg font-semibold text-gray-900">{storeInfo.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Địa chỉ</p>
                    <p className="text-lg font-semibold text-gray-900">{storeInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <Store className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Giới thiệu</p>
                    <p className="text-sm text-gray-600">{storeInfo.bakery_description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <Store className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sản phẩm</p>
                    <p className="text-sm text-gray-600">{storeInfo.cake_description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <Store className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Giá cả</p>
                    <p className="text-sm text-gray-600">{storeInfo.price_description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <Phone className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Thông tin liên hệ</p>
                    <p className="text-lg font-semibold text-gray-900">{storeInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <Mail className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{storeInfo.email}</p>
                    <p className="text-sm text-gray-500 mt-2">Để biết thêm thông tin, đặt hàng và yêu cầu đặc biệt</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6 text-custom-teal border-b border-gray-100 pb-4">Thông tin bổ sung</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Thành lập</p>
                    <p className="text-lg font-semibold text-gray-900">{storeInfo.createdAt}</p>
                    <p className="text-sm text-gray-500 mt-2">Nhiều năm kinh nghiệm trong việc tạo ra những chiếc bánh ngon và đẹp mắt</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-custom-teal/10 rounded-lg">
                    <Store className="w-5 h-5 text-custom-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái cửa hàng</p>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${storeInfo.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {storeInfo.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">Tiệm bánh đã được xác minh và đáng tin cậy với đánh giá tốt từ khách hàng</p>
                  </div>
                </div>

                {storeInfo.taxCode && (
                  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-2 bg-custom-teal/10 rounded-lg">
                      <Store className="w-5 h-5 text-custom-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Mã số thuế</p>
                      <p className="text-lg font-semibold text-gray-900">{storeInfo.taxCode}</p>
                      <p className="text-sm text-gray-500 mt-2">Doanh nghiệp đã đăng ký với đầy đủ giấy tờ</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-custom-teal border-b border-gray-100 pb-4">Hình ảnh cửa hàng</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Image Display */}
              <div className="lg:col-span-2">
                <div className="aspect-square relative rounded-xl overflow-hidden">
                  <Image
                    src={selectedImage || storeInfo.bannerImages[0]}
                    alt="Hình ảnh cửa hàng đã chọn"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Image Thumbnails */}
              <div className="lg:col-span-1">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {storeInfo.bannerImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`aspect-square relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${selectedImage === imageUrl ? 'ring-2 ring-custom-teal' : 'hover:ring-2 hover:ring-gray-200'
                        }`}
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Hình ảnh cửa hàng ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {selectedImage === imageUrl && (
                        <div className="absolute inset-0 bg-custom-teal/20" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Hình ảnh:</span>
                <span className="text-sm font-medium text-gray-900">
                  {storeInfo.bannerImages.findIndex(img => img === selectedImage) + 1} / {storeInfo.bannerImages.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentIndex = storeInfo.bannerImages.findIndex(img => img === selectedImage);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : storeInfo.bannerImages.length - 1;
                    setSelectedImage(storeInfo.bannerImages[prevIndex]);
                  }}
                  className="border-custom-teal text-custom-teal hover:bg-custom-teal hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentIndex = storeInfo.bannerImages.findIndex(img => img === selectedImage);
                    const nextIndex = currentIndex < storeInfo.bannerImages.length - 1 ? currentIndex + 1 : 0;
                    setSelectedImage(storeInfo.bannerImages[nextIndex]);
                  }}
                  className="border-custom-teal text-custom-teal hover:bg-custom-teal hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cakes" className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-custom-teal border-b border-gray-100 pb-4">Bánh có sẵn</h2>

            {/* Filter and Sort Section */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sắp xếp theo:</span>
                <select
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-custom-teal"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPagination(prev => ({ ...prev, currentPage: 0 }));
                  }}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Lọc theo:</span>
                <select
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-custom-teal"
                  value={filterBy}
                  onChange={(e) => {
                    setFilterBy(e.target.value);
                    setPagination(prev => ({ ...prev, currentPage: 0 }));
                  }}
                >
                  <option value="all">Tất cả</option>
                  <option value="inStock">Còn hàng</option>
                  <option value="outOfStock">Hết hàng</option>
                </select>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                Hiển thị {cakes.length} trên tổng số {pagination.totalItems} sản phẩm
              </div>
            </div>

            {/* Cakes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedCakes.map((cake) => (
                <div
                  key={cake.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group border border-gray-100"
                  onClick={() => router.push(`/cakes/${cake.id}`)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={cake.available_cake_image_files[0]?.file_url || '/images/default-cake.png'}
                      alt={cake.available_cake_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Wishlist Button */}
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlistToggle(cake);
                        }}
                        className={`h-10 w-10 rounded-full transition-all duration-200 backdrop-blur-sm ${items.some(item => item.id === cake.id)
                          ? 'bg-pink-50 border-pink-500 hover:bg-pink-100'
                          : 'bg-white/80 border-white hover:bg-white'
                          }`}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors duration-200 ${items.some(item => item.id === cake.id)
                            ? 'fill-pink-500 text-pink-500'
                            : 'text-gray-700'
                            }`}
                        />
                      </Button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-custom-teal transition-colors duration-200">{cake.available_cake_name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {cake.available_cake_type}
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${cake.available_cake_quantity > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {cake.available_cake_quantity > 0
                          ? `${cake.available_cake_quantity} sản phẩm có sẵn`
                          : 'Hết hàng'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">{cake.available_cake_description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-custom-teal">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cake.available_cake_price)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-custom-teal text-custom-teal hover:bg-custom-teal hover:text-white transition-colors duration-200"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                    onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
                    disabled={pagination.currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className={`w-10 h-10 p-0 border-gray-300 dark:border-gray-700 ${pagination.currentPage === i ? "bg-custom-teal text-white" : ""
                        }`}
                      onClick={() => handlePageChange(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                    onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="customCake">
          <CakeCustomizer storeId={storeInfo.id} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-custom-teal border-b border-gray-100 pb-4">Đánh giá của khách hàng</h2>

            {/* Create Review Form */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>
              <div className="space-y-4">
                <div>
                  <Label>Đánh giá của bạn</Label>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`w-6 h-6 cursor-pointer ${index < userRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                          }`}
                        onClick={() => setUserRating(index + 1)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Nội dung đánh giá</Label>
                  <Textarea
                    placeholder="Chia sẻ trải nghiệm của bạn về cửa hàng..."
                    className="mt-2"
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateReview}
                  disabled={isSubmitting}
                  className="bg-custom-teal hover:bg-custom-teal/90"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
              </div>
            </div>

            {/* Existing Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có đánh giá nào cho cửa hàng này</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative flex-shrink-0">
                        <Image
                          src={review.user.avatar_url || '/images/default-avatar.png'}
                          alt={review.user.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{review.user.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedReviewId(review.id);
                                setReportDialogOpen(true);
                              }}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${index < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Report Review Dialog */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogContent>
                <DialogTitle>Báo cáo đánh giá</DialogTitle>
                <DialogDescription>
                  Vui lòng cho chúng tôi biết lý do bạn muốn báo cáo đánh giá này
                </DialogDescription>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Lý do báo cáo</Label>
                    <Textarea
                      placeholder="Nhập lý do báo cáo..."
                      className="mt-2"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReportDialogOpen(false);
                        setReportReason('');
                        setSelectedReviewId(null);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleReportReview}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Gửi báo cáo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Existing Pagination */}
            {reviewPagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                    onClick={() => handleReviewPageChange(Math.max(0, reviewPagination.currentPage - 1))}
                    disabled={reviewPagination.currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: reviewPagination.totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className={`w-10 h-10 p-0 border-gray-300 dark:border-gray-700 ${reviewPagination.currentPage === i ? "bg-custom-teal text-white" : ""
                        }`}
                      onClick={() => handleReviewPageChange(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    className="w-10 h-10 p-0 border-gray-300 dark:border-gray-700"
                    onClick={() => handleReviewPageChange(Math.min(reviewPagination.totalPages - 1, reviewPagination.currentPage + 1))}
                    disabled={reviewPagination.currentPage === reviewPagination.totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 