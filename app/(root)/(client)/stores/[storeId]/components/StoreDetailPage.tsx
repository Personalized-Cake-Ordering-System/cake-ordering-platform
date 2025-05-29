"use client" ;

import { useState, useEffect, useMemo, useCallback } from 'react' ;
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs' ;
import { MapPin, Phone, Mail, Calendar, Store, Image as ImageIcon, Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, Star, AlertTriangle, Flag, X, Upload, FileText, AlertCircle } from 'lucide-react' ;
import StoreHeader from './StoreHeader' ;
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog" ;
import Image from 'next/image' ;
import axios from 'axios' ;
import CakeCustomizer from '@/components/3d-custom/cake-customize' ;
import { useWishlist } from '@/app/store/useWishlist' ;
import { useCart } from '@/app/store/useCart' ;
import { Button } from '@/components/ui/button' ;
import { toast } from 'sonner' ;
import { useRouter } from 'next/navigation' ;
import { Textarea } from "@/components/ui/textarea" ;
import { Label } from "@/components/ui/label" ;

// API response interfaces
interface FileData {
  file_name: string ;
  file_url: string ;
  id: string ;
  created_at: string ;
  created_by: string ;
  updated_at: string | null ;
  updated_by: string | null ;
  is_deleted: boolean ;
}

interface BakeryData {
  bakery_name: string ;
  email: string ;
  phone: string ;
  address: string ;
  latitude?: string ;
  longitude?: string ;
  bank_account?: string | null ;
  owner_name: string ;
  avatar_file?: {
    file_url: string ;
  } ;
  identity_card_number?: string ;
  front_card_file_id?: string ;
  front_card_file?: FileData ;
  back_card_file_id?: string ;
  back_card_file?: FileData ;
  tax_code?: string ;
  status: string ;
  confirmed_at?: string ;
  shop_image_files?: Array<{
    file_url: string ;
  }> ;
  id: string ;
  created_at: string ;
  created_by?: string ;
  updated_at?: string | null ;
  updated_by?: string | null ;
  is_deleted?: boolean ;
  cake_description?: string ;
  price_description?: string ;
  bakery_description?: string ;
  metric?: {
    rating_average: number;
    total_revenue: number;
    app_revenue: number;
    orders_count: number;
    customers_count: number;
    average_order_value: number;
  };
}

interface Product {
  id: string ;
  name: string ;
  description: string ;
  price: number ;
  image_url: string ;
  category_name: string ;
}

// Store information interface
interface StoreInfo {
  id: string ;
  name: string ;
  email: string ;
  phone: string ;
  address: string ;
  ownerName: string ;
  avatar: string ;
  bannerImages: string[] ;
  status: string ;
  createdAt: string ;
  taxCode?: string ;
  cake_description: string ;
  price_description: string ;
  bakery_description: string ;
  metric?: {
    rating_average: number;
    total_revenue: number;
    app_revenue: number;
    orders_count: number;
    customers_count: number;
    average_order_value: number;
  };
}

interface AvailableCake {
  available_cake_price: number ;
  available_cake_name: string ;
  available_cake_description: string ;
  available_cake_type: string ;
  available_cake_quantity: number ;
  available_main_image_id: string ;
  available_cake_main_image: null ;
  available_cake_image_files: FileData[] ;
  bakery_id: string ;
  id: string ;
  created_at: string ;
  created_by: string ;
  updated_at: string | null ;
  updated_by: string | null ;
  is_deleted: boolean ;
}

interface ApiResponse {
  status_code: number ;
  errors: any[] ;
  meta_data: {
    total_items_count: number ;
    page_size: number ;
    total_pages_count: number ;
    page_index: number ;
    has_next: boolean ;
    has_previous: boolean ;
  } ;
  payload: AvailableCake[] ;
}

interface Review {
  id: string ;
  rating: number ;
  content: string | null ;
  image_id: string | null ;
  customer_id: string ;
  created_at: string ;
  image?: {
    file_url: string ;
  } ;
  customer?: {
    name: string ;
  } ;
  isCurrentUser?: boolean ;
}

interface ReviewApiResponse {
  status_code: number ;
  errors: any[] ;
  meta_data: {
    total_items_count: number ;
    page_size: number ;
    total_pages_count: number ;
    page_index: number ;
    has_next: boolean ;
    has_previous: boolean ;
  } ;
  payload: {
    reviews: Review[] ;
  } ;
}

// Add new interfaces for filters
interface ReviewFilters {
  rating: number | null ;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' ;
}

// Before useState declarations
interface UploadedFile {
  id: string;
  name: string;
  preview?: string;
}

export default function StoreDetailPage({ bakery }: { bakery: BakeryData }) {
  const router = useRouter() ;
  const [activeTab, setActiveTab] = useState('info') ;
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null) ;
  const [selectedImage, setSelectedImage] = useState<string | null>(null) ;
  const [isLoading, setIsLoading] = useState(true) ;
  const [cakes, setCakes] = useState<AvailableCake[]>([]) ;
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({}) ;
  const { addToWishlist, removeFromWishlist, items } = useWishlist() ;

  const token = localStorage.getItem('accessToken') ;

  console.log(token) ;

  // Add new state for filters
  const [sortBy, setSortBy] = useState('newest') ;
  const [filterBy, setFilterBy] = useState('all') ;
  const [isReviewsLoading, setIsReviewsLoading] = useState(false) ;

  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 9,
    totalPages: 1,
    totalItems: 0
  }) ;

  const [reviews, setReviews] = useState<Review[]>([]) ;
  const [reviewPagination, setReviewPagination] = useState({
    currentPage: 0,
    pageSize: 5,
    totalPages: 1,
    totalItems: 0
  }) ;

  const [userRating, setUserRating] = useState(5) ;
  const [userReview, setUserReview] = useState('') ;
  const [isSubmitting, setIsSubmitting] = useState(false) ;
  const [reportDialogOpen, setReportDialogOpen] = useState(false) ;
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null) ;
  const [reportReason, setReportReason] = useState('') ;
  const [storeReportDialogOpen, setStoreReportDialogOpen] = useState(false) ;
  const [storeReportContent, setStoreReportContent] = useState('') ;
  const [isSubmittingStoreReport, setIsSubmittingStoreReport] = useState(false) ;
  const [uploadedFiles, setUploadedFiles] = useState<Array<UploadedFile>>([]) ;
  const [isUploading, setIsUploading] = useState(false) ;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null) ;
  const [reviewImageErrors, setReviewImageErrors] = useState<{[key: string]: boolean}>({}) ;

  // Add filtered and sorted reviews
  const [reviewFilters, setReviewFilters] = useState<ReviewFilters>({
    rating: null,
    sortBy: 'newest'
  }) ;

  // Get current user ID from localStorage on component mount
  useEffect(() => {
    try {
      const accessToken = localStorage.getItem('accessToken') ;
      if (accessToken) {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1])) ;
        setCurrentUserId(tokenPayload.sub) ;
      }
    } catch (error) {
      console.error("Error parsing user token:", error) ;
    }
  }, []) ;

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews] ;

    // Apply rating filter
    if (reviewFilters.rating !== null) {
      result = result.filter(review => review.rating === reviewFilters.rating) ;
    }

    // Apply sorting
    switch (reviewFilters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) ;
        break ;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) ;
        break ;
      case 'highest':
        result.sort((a, b) => b.rating - a.rating) ;
        break ;
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating) ;
        break ;
    }

    return result ;
  }, [reviews, reviewFilters]) ;

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
        cake_description: bakery.cake_description || "Chuyên cung cấp các loại bánh kem tươi, bánh sinh nhật và bánh theo yêu cầu với nguyên liệu chất lượng cao.",
        price_description: bakery.price_description || "Giá cả hợp lý từ 150.000đ, tùy theo kích thước và thiết kế bánh.",
        bakery_description: bakery.bakery_description || "BreadTalk là tiệm bánh gia đình với hơn 5 năm kinh nghiệm trong việc làm bánh và phục vụ khách hàng khu vực trung tâm Sài Gòn.",
        metric: bakery.metric ? {
          rating_average: Number(bakery.metric.rating_average.toFixed(1)),
          total_revenue: bakery.metric.total_revenue,
          app_revenue: bakery.metric.app_revenue,
          orders_count: bakery.metric.orders_count,
          customers_count: bakery.metric.customers_count,
          average_order_value: bakery.metric.average_order_value
        } : undefined
      };

      setStoreInfo(storeData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing bakery data:", error);
      toast.error("Có lỗi xảy ra khi chuẩn bị thông tin cửa hàng");
    }
  }, [bakery]);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const response = await axios.get<ApiResponse>(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/bakeries/${bakery.id}/available_cakes`, {
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
        toast.error("Có lỗi xảy ra khi tải các bánh có sẵn");
      }
    };

    if (bakery?.id) {
      fetchCakes();
    }
  }, [bakery?.id, pagination.currentPage, pagination.pageSize, sortBy, filterBy]);

  // Extract fetchReviews function outside useEffect for reuse
  const fetchReviews = useCallback(async () => {
    try {
      setIsReviewsLoading(true) ;
      const response = await axios.get<ReviewApiResponse>(
        `https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/bakeries/${bakery.id}`,
        {
          params: {
            'page-index': reviewPagination.currentPage,
            'page-size': reviewPagination.pageSize,
          }
        }
      ) ;
      if (response.data.status_code === 200) {
        // Fetch additional data for each review
        const reviewsWithDetails = await Promise.all(
          response.data.payload.reviews.map(async (review) => {
            let imageUrl = null ;
            let customerName = 'Anonymous' ;
            let isCurrentUser = false ;
            
            // Check if this review belongs to current user
            if (currentUserId && review.customer_id === currentUserId) {
              customerName = 'You' ;
              isCurrentUser = true ;
            } else {
              // Fetch customer details only if not current user
              try {
                console.log('Fetching customer details for ID:', review.customer_id) ;
                const accessToken = localStorage.getItem('accessToken') ;
                if (!accessToken) {
                  console.log('No access token found') ;
                  return ;
                }

                const customerResponse = await axios.get(
                  `https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/customers/${review.customer_id}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'accept': '*/*'
                    }
                  }
                ) ;
                console.log('Customer response:', customerResponse.data) ;
                if (customerResponse.data.status_code === 200 && customerResponse.data.payload) {
                  customerName = customerResponse.data.payload.name ;
                  console.log('Found customer name:', customerName) ;
                } else {
                  console.log('No customer data found in response') ;
                }
              } catch (error) {
                console.error("Error fetching customer details:", error) ;
                console.error("Customer ID that failed:", review.customer_id) ;
              }
            }

            // Fetch image if image_id exists
            if (review.image_id) {
              try {
                const imageResponse = await axios.get(
                  `https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/files/${review.image_id}`
                ) ;
                if (imageResponse.data.status_code === 200) {
                  imageUrl = imageResponse.data.payload.file_url ;
                }
              } catch (error) {
                console.error("Error fetching review image:", error) ;
              }
            }

            return {
              ...review,
              image: imageUrl ? { file_url: imageUrl } : undefined,
              customer: { name: customerName },
              isCurrentUser
            } ;
          })
        ) ;

        setReviews(reviewsWithDetails as Review[]) ;
        setReviewPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(response.data.payload.reviews.length / reviewPagination.pageSize),
          totalItems: response.data.payload.reviews.length
        })) ;
      }
    } catch (error) {
      console.error("Error fetching reviews:", error) ;
      toast.error("Có lỗi xảy ra khi tải đánh giá của cửa hàng") ;
    } finally {
      setIsReviewsLoading(false) ;
    }
  }, [bakery.id, reviewPagination.currentPage, reviewPagination.pageSize]) ;

  useEffect(() => {
    if (bakery?.id) {
      fetchReviews() ;
    }
  }, [bakery?.id, fetchReviews]) ;

  const handleWishlistToggle = (cake: AvailableCake) => {
    const isInWishlist = items.some(item => item.id === cake.id) ;

    if (isInWishlist) {
      removeFromWishlist(cake.id) ;
      toast.success("Đã xóa khỏi danh sách yêu thích") ;
    } else {
      addToWishlist({
        id: cake.id,
        name: cake.available_cake_name,
        price: cake.available_cake_price,
        image: cake.available_cake_image_files?.[0]?.file_url || '/placeholder-cake.jpg',
      }) ;
      toast.success("Đã thêm vào danh sách yêu thích") ;
    }
  } ;

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    })) ;
  } ;

  const handleReviewPageChange = (newPage: number) => {
    setReviewPagination(prev => ({
      ...prev,
      currentPage: newPage
    })) ;
  } ;

  const handleCreateReview = async () => {
    if (!userReview.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error("Vui lòng đăng nhập để đánh giá cửa hàng");
        return;
      }

      // Decode JWT to get customer_id
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const customerId = tokenPayload.sub;

      // Extract the file ID if available
      const fileId = uploadedFiles.length > 0 ? uploadedFiles[0].id : null;
      const filePreview = uploadedFiles.length > 0 ? uploadedFiles[0].preview : null;

      const response = await axios.post(
        `https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/reviews`,
        {
          rating: userRating,
          content: userReview,
          customer_id: customerId,
          review_type: "BAKERY_REVIEW",
          image_id: fileId,
          bakery_id: bakery.id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status_code === 200) {
        toast.success("Đánh giá của bạn đã được gửi thành công");
        
        // Reset form
        setUserReview('');
        setUserRating(5);
        setUploadedFiles([]);
        
        // Add optimistic update with the new review
        const newReview = {
          id: response.data.payload?.id || `temp-${Date.now()}`,
          rating: userRating,
          content: userReview,
          customer_id: customerId,
          created_at: new Date().toISOString(),
          image_id: fileId,
          image: filePreview ? { file_url: filePreview } : undefined,
          customer: { name: "You" },
          isCurrentUser: true
        };
        
        // Add to beginning of reviews array (newest first)
        setReviews(prevReviews => [newReview, ...prevReviews]);
        
        // Then refresh from server after a slight delay to ensure the review is available
        setTimeout(() => {
          fetchReviews();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error creating review:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportReview = async () => {
    if (!selectedReviewId || !reportReason.trim()) {
      toast.error("Vui lòng nhập lý do báo cáo") ;
      return ;
    }

    try {
      const response = await axios.post(
        `https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/reviews/${selectedReviewId}/reports`,
        {
          reason: reportReason
        }
      ) ;

      if (response.data.status_code === 200) {
        toast.success("Báo cáo của bạn đã được gửi thành công") ;
        setReportDialogOpen(false) ;
        setReportReason('') ;
        setSelectedReviewId(null) ;
      }
    } catch (error) {
      console.error("Error reporting review:", error) ;
      toast.error("Có lỗi xảy ra khi gửi báo cáo") ;
    }
  } ;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    try {
      // Create a local preview first
      const filePreview = URL.createObjectURL(files[0]);
      
      formData.set('formFile', files[0]);

      const response = await axios.post(
        'https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/files',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status_code === 200) {
        setUploadedFiles([{
          id: response.data.payload.id,
          name: response.data.payload.file_name,
          preview: filePreview
        }]);
        console.log('File uploaded successfully:', response.data.payload);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Có lỗi xảy ra khi tải lên tệp");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId)) ;
  } ;

  const handleStoreReport = async () => {
    if (!storeReportContent.trim()) {
      toast.error("Vui lòng nhập nội dung báo cáo") ;
      return ;
    }

    setIsSubmittingStoreReport(true) ;
    try {
      const accessToken = localStorage.getItem('accessToken') ;

      if (!accessToken) {
        toast.error("Vui lòng đăng nhập để báo cáo cửa hàng") ;
        return ;
      }

      const reportData = {
        content: storeReportContent,
        report_files: uploadedFiles.map(file => file.id),
        bakery_id: bakery.id
      } ;

      const response = await axios.post(
        'https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/reports',
        reportData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      ) ;

      if (response.status === 201) {
        toast.success("Báo cáo thành công! Chúng tôi đã nhận được báo cáo của bạn và sẽ xem xét trong thời gian sớm nhất") ;
        setStoreReportDialogOpen(false) ;
        setStoreReportContent('') ;
        setUploadedFiles([]) ;
      }
    } catch (error: any) {
      console.error("Error reporting store:", error) ;
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi báo cáo") ;
    } finally {
      setIsSubmittingStoreReport(false) ;
    }
  } ;

  const handleImageError = (reviewId: string) => {
    setReviewImageErrors(prev => ({
      ...prev,
      [reviewId]: true
    }));
  };

  if (isLoading || !storeInfo) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-teal"></div>
      </div>
    ) ;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center">
        <StoreHeader storeInfo={storeInfo} />
      </div>

      {/* Enhanced Store Report Dialog with better contrast */}
      <Dialog open={storeReportDialogOpen} onOpenChange={setStoreReportDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogTitle className="flex items-center gap-2 text-gray-900 pb-2 border-b">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-xl font-semibold">Báo cáo cửa hàng</span>
          </DialogTitle>

          <div className="space-y-6 mt-6">
            {/* Report Categories */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Chọn loại báo cáo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-start gap-3 p-4 bg-white border-2 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200 group text-left"
                  onClick={() => setStoreReportContent(prev => prev + "\n• Sản phẩm không đúng như mô tả")}
                >
                  <div className="p-2 rounded-lg bg-red-100 text-red-500 group-hover:bg-red-200">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-red-500">Vấn đề về sản phẩm</h4>
                    <p className="text-sm text-gray-700 mt-1">Chất lượng, mô tả không chính xác, giá cả</p>
                  </div>
                </button>

                <button
                  type="button"
                  className="flex items-start gap-3 p-4 bg-white border-2 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200 group text-left"
                  onClick={() => setStoreReportContent(prev => prev + "\n• Dịch vụ khách hàng kém")}
                >
                  <div className="p-2 rounded-lg bg-red-100 text-red-500 group-hover:bg-red-200">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-red-500">Vấn đề về dịch vụ</h4>
                    <p className="text-sm text-gray-700 mt-1">Thái độ phục vụ, thời gian phản hồi</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold text-gray-900">Chi tiết báo cáo</Label>
                <span className="text-sm text-gray-700">Vui lòng cung cấp thông tin chi tiết</span>
              </div>
              <Textarea
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                className="min-h-[120px] resize-none border-2 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl text-gray-900 placeholder:text-gray-500 bg-white"
                value={storeReportContent}
                onChange={(e) => setStoreReportContent(e.target.value)}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-700" />
                  Tệp đính kèm
                </Label>
                <span className="text-sm text-gray-700">Hỗ trợ: JPG, PNG, PDF, DOC (tối đa 5MB)</span>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-white hover:bg-gray-50 transition-all duration-200">
                <div className="flex flex-col items-center gap-3">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <div className="p-3 bg-red-50 rounded-full">
                    <Upload className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isUploading}
                      className="bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 mb-2 font-semibold"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          <span>Đang tải lên...</span>
                        </div>
                      ) : (
                        <span>Chọn tệp đính kèm</span>
                      )}
                    </Button>
                    <p className="text-sm text-gray-700">hoặc kéo thả tệp vào đây</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Tệp đã tải lên ({uploadedFiles.length})</h4>
                  <div className="bg-white rounded-xl border-2 border-gray-300 divide-y divide-gray-200">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 group hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200">
                            <FileText className="w-4 h-4 text-gray-700" />
                          </div>
                          <span className="text-sm text-gray-900 truncate">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setStoreReportDialogOpen(false) ;
                  setStoreReportContent('') ;
                  setUploadedFiles([]) ;
                }}
                className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300 font-semibold"
              >
                Hủy báo cáo
              </Button>
              <Button
                onClick={handleStoreReport}
                disabled={isSubmittingStoreReport || !storeReportContent.trim()}
                className="bg-red-500 hover:bg-red-600 text-white min-w-[120px] disabled:bg-gray-300 disabled:text-gray-500 font-semibold"
              >
                {isSubmittingStoreReport ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  'Gửi báo cáo'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-6 rounded-lg bg-white p-1 shadow-sm border border-gray-100">
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
          <TabsTrigger value="report" className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all duration-200">
            <AlertTriangle className="w-4 h-4" />
            Báo cáo
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
                    const currentIndex = storeInfo.bannerImages.findIndex(img => img === selectedImage) ;
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : storeInfo.bannerImages.length - 1 ;
                    setSelectedImage(storeInfo.bannerImages[prevIndex]) ;
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
                    const currentIndex = storeInfo.bannerImages.findIndex(img => img === selectedImage) ;
                    const nextIndex = currentIndex < storeInfo.bannerImages.length - 1 ? currentIndex + 1 : 0 ;
                    setSelectedImage(storeInfo.bannerImages[nextIndex]) ;
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
                    setSortBy(e.target.value) ;
                    setPagination(prev => ({ ...prev, currentPage: 0 })) ;
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
                    setFilterBy(e.target.value) ;
                    setPagination(prev => ({ ...prev, currentPage: 0 })) ;
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
              {cakes.map((cake) => (
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
                          e.stopPropagation() ;
                          handleWishlistToggle(cake) ;
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

            {/* Review Filters */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Lọc theo:</span>
                <select
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-custom-teal"
                  value={reviewFilters.rating?.toString() || ''}
                  onChange={(e) => setReviewFilters(prev => ({
                    ...prev,
                    rating: e.target.value ? parseInt(e.target.value) : null
                  }))}
                >
                  <option value="">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sắp xếp theo:</span>
                <select
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-custom-teal"
                  value={reviewFilters.sortBy}
                  onChange={(e) => setReviewFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as ReviewFilters['sortBy']
                  }))}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="highest">Đánh giá cao nhất</option>
                  <option value="lowest">Đánh giá thấp nhất</option>
                </select>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                Hiển thị {filteredAndSortedReviews.length} trên tổng số {reviews.length} đánh giá
              </div>
            </div>

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
                <div>
                  <Label>Hình ảnh đánh giá</Label>
                  <div className="mt-2 space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        id="review-image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      
                      {uploadedFiles.length > 0 ? (
                        <div className="relative">
                          <div className="aspect-video relative w-full max-w-md mx-auto rounded-lg overflow-hidden border border-gray-200">
                            {uploadedFiles[0].preview ? (
                              <Image 
                                src={uploadedFiles[0].preview} 
                                alt="Preview" 
                                fill 
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                <FileText className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedFiles([])}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="review-image"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            {isUploading ? 'Đang tải lên...' : 'Nhấn để tải lên hình ảnh'}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
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

            {/* Reviews List */}
            {isReviewsLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-teal"></div>
              </div>
            ) : filteredAndSortedReviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Không tìm thấy đánh giá phù hợp</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAndSortedReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border ${review.isCurrentUser ? 'border-custom-teal/40 bg-custom-teal/5' : 'border-gray-100'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0 ring-2 ${review.isCurrentUser ? 'ring-custom-teal/50 bg-custom-teal/20' : 'ring-white bg-gradient-to-br from-gray-100 to-gray-200'} shadow-sm`}>
                        <Image
                          src={review.isCurrentUser ? "/images/user-avatar.png" : "/images/default-avatar.png"}
                          alt={review.customer?.name || 'Anonymous'}
                          fill
                          className="object-cover"
                          priority={review.isCurrentUser}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {review.customer?.name || 'Anonymous'}
                              </h3>
                              {review.isCurrentUser && (
                                <span className="bg-custom-teal/20 text-custom-teal text-xs px-2 py-0.5 rounded-full border border-custom-teal/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    className={`w-4 h-4 ${index < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-200'
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {!review.isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => {
                                setSelectedReviewId(review.id);
                                setReportDialogOpen(true);
                              }}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {review.isCurrentUser && (
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-custom-teal hover:bg-custom-teal/10"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                              </Button>
                            </div>
                          )}
                        </div>

                        {review.content ? (
                          <div className={`mt-4 p-4 rounded-lg ${review.isCurrentUser ? 'bg-white' : 'bg-gray-50'}`}>
                            <p className="text-gray-600 leading-relaxed">{review.content}</p>
                          </div>
                        ) : (
                          <p className="mt-4 text-gray-400 italic">Không có nội dung đánh giá</p>
                        )}

                        {review.image?.file_url && !reviewImageErrors[review.id] && (
                          <div className="mt-4">
                            <div className="relative rounded-lg overflow-hidden">
                              <div className="aspect-video w-full max-w-md relative rounded-lg overflow-hidden">
                                <Image
                                  src={review.image.file_url}
                                  alt="Review image"
                                  fill
                                  className="object-cover"
                                  onError={() => handleImageError(review.id)}
                                />
                              </div>
                              <div 
                                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => window.open(review.image?.file_url, '_blank')}
                              >
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 3 6 6m-6-6v4.8m6-4.8h-4.8"/><path d="M9 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4.5"/><path d="M19 15v4a2 2 0 0 1-2 2h-4.5"/></svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Interactive elements */}
                        <div className="mt-4 flex items-center gap-4">
                          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M12 10v10"/><path d="m8 16 4-4 4 4"/></svg>
                            <span className="text-sm">Helpful</span>
                          </button>

                          <span className="text-gray-300">|</span>

                          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span className="text-sm">Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            {reviewPagination.totalPages > 1 && (
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Trang {reviewPagination.currentPage + 1} / {reviewPagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-10 h-10 p-0 border-gray-200 hover:border-custom-teal hover:text-custom-teal"
                      onClick={() => handleReviewPageChange(0)}
                      disabled={reviewPagination.currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-10 h-10 p-0 border-gray-200 hover:border-custom-teal hover:text-custom-teal"
                      onClick={() => handleReviewPageChange(Math.max(0, reviewPagination.currentPage - 1))}
                      disabled={reviewPagination.currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: reviewPagination.totalPages }, (_, i) => {
                      // Show first page, last page, current page, and pages around current page
                      if (
                        i === 0 ||
                        i === reviewPagination.totalPages - 1 ||
                        (i >= reviewPagination.currentPage - 1 && i <= reviewPagination.currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={i}
                            variant={reviewPagination.currentPage === i ? "default" : "outline"}
                            size="sm"
                            className={`w-10 h-10 p-0 ${reviewPagination.currentPage === i
                              ? "bg-custom-teal text-white"
                              : "border-gray-200 hover:border-custom-teal hover:text-custom-teal"
                              }`}
                            onClick={() => handleReviewPageChange(i)}
                          >
                            {i + 1}
                          </Button>
                        ) ;
                      }
                      // Show ellipsis
                      if (i === 1 || i === reviewPagination.totalPages - 2) {
                        return (
                          <span key={i} className="text-gray-400">
                            ...
                          </span>
                        ) ;
                      }
                      return null ;
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-10 h-10 p-0 border-gray-200 hover:border-custom-teal hover:text-custom-teal"
                      onClick={() => handleReviewPageChange(Math.min(reviewPagination.totalPages - 1, reviewPagination.currentPage + 1))}
                      disabled={reviewPagination.currentPage === reviewPagination.totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-10 h-10 p-0 border-gray-200 hover:border-custom-teal hover:text-custom-teal"
                      onClick={() => handleReviewPageChange(reviewPagination.totalPages - 1)}
                      disabled={reviewPagination.currentPage === reviewPagination.totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Báo cáo cửa hàng</h2>
                <p className="text-gray-700 mt-2">Vui lòng cung cấp thông tin chi tiết về vấn đề bạn gặp phải với cửa hàng này</p>
              </div>

              {/* Report Categories */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Chọn loại báo cáo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-start gap-3 p-4 bg-white border-2 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200 group text-left"
                      onClick={() => setStoreReportContent(prev => prev + "\n• Sản phẩm không đúng như mô tả")}
                    >
                      <div className="p-2 rounded-lg bg-red-100 text-red-500 group-hover:bg-red-200">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-red-500">Vấn đề về sản phẩm</h4>
                        <p className="text-sm text-gray-700 mt-1">Chất lượng, mô tả không chính xác, giá cả</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="flex items-start gap-3 p-4 bg-white border-2 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200 group text-left"
                      onClick={() => setStoreReportContent(prev => prev + "\n• Dịch vụ khách hàng kém")}
                    >
                      <div className="p-2 rounded-lg bg-red-100 text-red-500 group-hover:bg-red-200">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-red-500">Vấn đề về dịch vụ</h4>
                        <p className="text-sm text-gray-700 mt-1">Thái độ phục vụ, thời gian phản hồi</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Report Content */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold text-gray-900">Chi tiết báo cáo</Label>
                    <span className="text-sm text-gray-700">Vui lòng cung cấp thông tin chi tiết</span>
                  </div>
                  <Textarea
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                    className="min-h-[120px] resize-none border-2 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl text-gray-900 placeholder:text-gray-500 bg-white"
                    value={storeReportContent}
                    onChange={(e) => setStoreReportContent(e.target.value)}
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-700" />
                      Tệp đính kèm
                    </Label>
                    <span className="text-sm text-gray-700">Hỗ trợ: JPG, PNG, PDF, DOC (tối đa 5MB)</span>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-white hover:bg-gray-50 transition-all duration-200">
                    <div className="flex flex-col items-center gap-3">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <div className="p-3 bg-red-50 rounded-full">
                        <Upload className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={isUploading}
                          className="bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 mb-2 font-semibold"
                        >
                          {isUploading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              <span>Đang tải lên...</span>
                            </div>
                          ) : (
                            <span>Chọn tệp đính kèm</span>
                          )}
                        </Button>
                        <p className="text-sm text-gray-700">hoặc kéo thả tệp vào đây</p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-base font-semibold text-gray-900 mb-3">Tệp đã tải lên ({uploadedFiles.length})</h4>
                      <div className="bg-white rounded-xl border-2 border-gray-300 divide-y divide-gray-200">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 group hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200">
                                <FileText className="w-4 h-4 text-gray-700" />
                              </div>
                              <span className="text-sm text-gray-900 truncate">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(file.id)}
                              className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleStoreReport}
                    disabled={isSubmittingStoreReport || !storeReportContent.trim()}
                    className="bg-red-500 hover:bg-red-600 text-white min-w-[120px] disabled:bg-gray-300 disabled:text-gray-500 font-semibold"
                  >
                    {isSubmittingStoreReport ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang gửi...</span>
                      </div>
                    ) : (
                      'Gửi báo cáo'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ) ;
} 