'use client'
import { useCart } from '@/app/store/useCart';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Check, ChevronDown, ChevronUp, CreditCard, MapPin, PackageCheck, ShieldCheck, Ticket, Wallet, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Province, vietnamProvinces } from '@/app/data/vietnam-provinces';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { CheckoutFormValues } from './types';
import { createOrder } from './api';
import { cartService } from '@/app/services/cartService';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { voucherService } from '@/app/services/voucherService';
import axios from 'axios';

type GeocodingResponse = {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      }
    }
  }>;
  status: string;
};

// Form schema for checkout validation
const checkoutSchema = z.object({
  // Delivery details
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Phone number should be at least 10 digits' }),
  province: z.string().min(2, { message: 'Tỉnh/Thành phố không được để trống' }),
  district: z.string().min(2, { message: 'Quận/Huyện không được để trống' }),
  address: z.string().min(5, { message: 'Địa chỉ không được để trống' }),
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  paymentType: z.enum(['QR_CODE', 'WALLET']),
  specialInstructions: z.string().optional(),
  formatted_address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  voucher_code: z.string().optional(),
});

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 80 }
  }
};

export type CakeConfig = {
  size: string;
  sponge: string;
  filling: string;
  price: number;
  imageUrl?: string;
};

// Add CartItem type from cartService
type CartItem = {
  available_cake_id?: string;
  custom_cake_id?: string;
  cake_name: string;
  cake_note?: string;
  quantity: number;
  sub_total_price: number;
  main_image?: {
    file_url: string;
  };
  bakery_id?: string;
};

// Add interface for JWT payload
interface JWTPayload {
  id: string;
  [key: string]: any;
}

// Add interface for Customer Voucher
interface CustomerVoucher {
  customer_id: string;
  voucher: {
    code: string;
    discount_percentage: number;
    min_order_amount: number;
    max_discount_amount: number;
    expiration_date: string;
    quantity: number;
    usage_count: number;
    description: string;
    voucher_type: string;
  };
  is_applied: boolean;
  applied_at: string | null;
}

const CheckoutPage = () => {
  const router = useRouter();
  // State for order confirmation
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = React.useState(false);
  const [selectedProvince, setSelectedProvince] = React.useState<string>('');
  const [availableDistricts, setAvailableDistricts] = React.useState<Array<{ name: string; code: string }>>([]);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [vouchers, setVouchers] = React.useState<any[]>([]);
  const [customerVouchers, setCustomerVouchers] = React.useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = React.useState(false);
  const [bakeryId, setBakeryId] = React.useState<string | null>(null);
  const [bakery, setBakery] = React.useState<any>(null);
  const [shippingInfo, setShippingInfo] = React.useState<{
    shipping_time: number;
    shipping_distance: number;
    shipping_fee: number;
  } | null>(null);
  const { clearCart, deleteCartAPI } = useCart();

  // Delivery fees
  const standardDelivery = shippingInfo?.shipping_fee; // No default value anymore

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      province: '',
      district: '',
      address: '',
      deliveryType: 'DELIVERY',
      paymentType: 'QR_CODE',
      specialInstructions: '',
    },
  });

  // Get the delivery method, type, and payment type values from the form
  const deliveryType = form.watch('deliveryType');
  const paymentType = form.watch('paymentType');

  // Add VND currency formatter
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Calculate totals based on actual cart items
  const subtotal = cartItems.reduce((sum, item) => sum + item.sub_total_price, 0);
  const deliveryFee = deliveryType === 'DELIVERY' ? (standardDelivery || 0) : 0;

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    const discountAmount = (subtotal * selectedVoucher.discount_percentage) / 100;
    return Math.min(discountAmount, selectedVoucher.max_discount_amount);
  };

  const discount = calculateDiscount();
  const total = subtotal + deliveryFee - discount;

  // Add visual indicators for shipping calculation
  const [isCalculatingShipping, setIsCalculatingShipping] = React.useState(false);

  // Handle province change
  const handleProvinceChange = (provinceCode: string) => {
    const province = vietnamProvinces.find((p: Province) => p.code === provinceCode);
    if (province) {
      setSelectedProvince(provinceCode);
      setAvailableDistricts(province.districts);
      form.setValue('province', province.name);
      form.setValue('district', '');
      // Clear previous shipping calculations when province changes
      setShippingInfo(null);
    }
  };

  // Handle district change
  const handleDistrictChange = (districtCode: string) => {
    const district = availableDistricts.find(d => d.code === districtCode);
    if (district) {
      form.setValue('district', district.name);
      // Recalculate shipping after district changes
      handleAddressChange();
    }
  };

  // Update handleAddressChange to show loading state
  const handleAddressChange = async () => {
    const province = form.getValues('province');
    const district = form.getValues('district');
    const address = form.getValues('address');
    
    if (province && district && address) {
      setIsCalculatingShipping(true);
      const fullAddress = `${address}, ${district}, ${province}`;
      await geocodeAddress(fullAddress);
      setIsCalculatingShipping(false);
    }
  };

  // Add function to fetch shipping information
  const fetchShippingInfo = async (bakeryLat: number, bakeryLng: number, orderLat: number, orderLng: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;

      const response = await axios.get(
        `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/shippings?bakeryLat=${bakeryLat}&bakeryLng=${bakeryLng}&orderLat=${orderLat}&orderLng=${orderLng}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': '*/*'
          }
        }
      );

      if (response.data.status_code === 200) {
        console.log('Shipping info:', response.data.payload);
        return response.data.payload;
      }
      return null;
    } catch (error) {
      console.error('Error fetching shipping info:', error);
      return null;
    }
  };

  // Update geocode function to also calculate shipping when address is selected
  const geocodeAddress = async (address: string) => {
    try {
      const API_KEY_GOONG = '2R2HQynx7ypczZZcxS1w7uuJaxXIGoeXymvGGx0u'
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://rsapi.goong.io/geocode?address=${encodedAddress}&api_key=${API_KEY_GOONG}`
      );
      const data: GeocodingResponse = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        // If we have bakery coordinates, calculate shipping
        if (bakery && bakery.latitude && bakery.longitude) {
          const shippingData = await fetchShippingInfo(
            parseFloat(bakery.latitude),
            parseFloat(bakery.longitude),
            location.lat,
            location.lng
          );
          
          if (shippingData) {
            setShippingInfo(shippingData);
          }
        }
        
        return {
          formatted_address: result.formatted_address,
          location: location
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Add logging to useEffect for cart items
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const fetchCart = async () => {
      const accessToken = localStorage.getItem('accessToken');
      console.log('Access Token:', accessToken ? 'Found' : 'Not found');

      if (!accessToken) {
        setError('Please login to view your cart');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching cart data...');
        const response = await cartService.getCart(accessToken);
        console.log('Cart API Response:', response);

        if (response.payload.bakeryId) {
          console.log('Bakery ID from cart:', response.payload.bakeryId);
          setBakeryId(response.payload.bakeryId);
          fetchVouchers(response.payload.bakeryId);
        }

        setCartItems(response.payload.cartItems as CartItem[]);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to fetch cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Add useEffect to fetch bakery details when bakeryId is available
  React.useEffect(() => {
    const fetchBakery = async () => {
      if (!bakeryId) return;
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      try {
        console.log('Fetching bakery details:', bakeryId);
        const response = await axios.get(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/bakeries/${bakeryId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': '*/*'
          }
        });
        
        if (response.data.status_code === 200) {
          console.log('Bakery details:', response.data.payload);
          setBakery(response.data.payload);
        }
      } catch (error) {
        console.error('Error fetching bakery details:', error);
      }
    };
    
    fetchBakery();
  }, [bakeryId]);

  // Add getImageUrl function
  const getImageUrl = (fileUrl: string | undefined) => {
    if (!fileUrl) return null;
    try {
      // If it's already a valid URL, return it
      if (fileUrl.startsWith('http')) {
        return fileUrl;
      }
      // If it's a Google Images URL, return it directly
      if (fileUrl.includes('gstatic.com')) {
        return fileUrl;
      }
      // Otherwise try to create a URL object
      const url = new URL(fileUrl);
      return url.toString();
    } catch {
      // If URL parsing fails, return null to trigger fallback
      return null;
    }
  };

  // Add handleImageError function
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/imagecake.jpg'; // Fallback image
  };

  // Add function to decode JWT and get customer ID
  const getCustomerId = (): string | null => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;

      const tokenParts = accessToken.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.id;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Function to fetch customer-specific vouchers
  const fetchCustomerVouchers = React.useCallback(async (bakeryId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return [];

      // Get customer ID from JWT token
      const tokenParts = accessToken.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const customerId = payload.id;

      const response = await fetch(
        `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/customers/${customerId}/vouchers?isApplied=false&pageIndex=0&pageSize=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': '*/*'
          }
        }
      );

      const data = await response.json();

      if (data.status_code === 200) {
        console.log('Customer vouchers:', data.payload);
        const validCustomerVouchers = data.payload.filter((voucherData: any) => {
          const voucher = voucherData.voucher;
          const isExpired = new Date(voucher.expiration_date) < new Date();
          const isFullyUsed = voucher.usage_count >= voucher.quantity;
          return !isExpired && !isFullyUsed;
        });
        setCustomerVouchers(validCustomerVouchers);
        return validCustomerVouchers;
      }
      return [];
    } catch (error) {
      console.error('Error fetching customer vouchers:', error);
      return [];
    }
  }, []);

  // Function to fetch all vouchers (both global and customer-specific)
  const fetchVouchers = React.useCallback(async (bakeryId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log('Fetching vouchers with:', { bakeryId, accessToken: !!accessToken });

      if (!accessToken) return;

      // Fetch global vouchers
      const globalResponse = await voucherService.getVouchers(bakeryId, accessToken);
      console.log('Global Voucher API Response:', globalResponse);

      // Fetch customer vouchers
      const customerVouchersData = await fetchCustomerVouchers(bakeryId);

      if (globalResponse.status_code === 200) {
        // Filter valid global vouchers
        const validGlobalVouchers = globalResponse.payload.filter((voucher: any) => {
          const isExpired = new Date(voucher.expiration_date) < new Date();
          const isFullyUsed = voucher.usage_count >= voucher.quantity;
          const isGlobalType = voucher.voucher_type === 'GLOBAL';
          return !isExpired && !isFullyUsed && isGlobalType;
        });

        // Combine both types of vouchers
        const allVouchers = [
          ...validGlobalVouchers,
          ...customerVouchersData.map((cv: any) => ({
            ...cv.voucher,
            isCustomerVoucher: true
          }))
        ];

        console.log('All available vouchers:', allVouchers);
        setVouchers(allVouchers);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  }, [fetchCustomerVouchers]);

  // Add useEffect to fetch vouchers when bakery_id is available
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (cartItems.length > 0 && cartItems[0].bakery_id) {
      fetchVouchers(cartItems[0].bakery_id);
    }
  }, [cartItems, fetchVouchers]);

  // Update handleVoucherSelect to handle both types of vouchers
  const handleVoucherSelect = (voucher: any) => {
    if (subtotal < voucher.min_order_amount) {
      toast.error(`Đơn hàng tối thiểu ${formatVND(voucher.min_order_amount)} để sử dụng mã này`);
      return;
    }
    setSelectedVoucher(voucher);
    setIsVoucherDialogOpen(false);
    form.setValue('voucher_code', voucher.code);
  };

  // Add logging when voucher dialog is opened
  const handleVoucherDialogOpen = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    console.log('Current vouchers state:', vouchers);
    setIsVoucherDialogOpen(true);
  };

  // Update renderVoucherSection to make it more attractive and modern
  const renderVoucherSection = () => (
    <Card className="p-6 mt-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-medium text-lg">Mã giảm giá</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleVoucherDialogOpen}
          className="px-4 py-2 rounded-full border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
        >
          {selectedVoucher ? 'Thay đổi mã' : 'Chọn mã'}
        </Button>
      </div>

      {isVoucherDialogOpen && (
        <div className="mt-4 rounded-xl border p-0 overflow-hidden">
          <div className="bg-muted/30 p-4 border-b">
            <h4 className="font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              Mã giảm giá có sẵn
            </h4>
          </div>
          <div className="space-y-3 p-4 max-h-[350px] overflow-y-auto">
            {vouchers.length > 0 ? (
              vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className={`relative p-4 border rounded-xl transition-all group
                    ${selectedVoucher?.id === voucher.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : subtotal >= voucher.min_order_amount
                        ? 'cursor-pointer hover:border-primary/50 hover:shadow-md'
                        : 'opacity-70 cursor-not-allowed bg-muted/20'
                    }`}
                  onClick={() => subtotal >= voucher.min_order_amount && handleVoucherSelect(voucher)}
                >
                  {/* Decorative elements */}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-background border border-muted-foreground/20"></div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-background border border-muted-foreground/20"></div>

                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-md">
                          <Ticket className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-primary text-lg">
                          Giảm {voucher.discount_percentage}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {voucher.description || 'Không có mô tả'}
                      </p>
                    </div>
                    <Badge
                      variant={selectedVoucher?.id === voucher.id ? "default" : "outline"}
                      className={`text-xs font-mono tracking-wider ${selectedVoucher?.id === voucher.id ? 'bg-primary' : 'group-hover:bg-primary/10'}`}
                    >
                      {voucher.code}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-4 pt-3 border-t border-dashed">
                    <p className={subtotal < voucher.min_order_amount ? "text-destructive font-medium flex items-center" : "flex items-center"}>
                      <span className="w-2 h-2 rounded-full bg-blue-400 mr-1.5"></span>
                      Đơn tối thiểu: {formatVND(voucher.min_order_amount)}
                      {subtotal < voucher.min_order_amount && (
                        <span className="ml-1 text-destructive">
                          (Còn thiếu {formatVND(voucher.min_order_amount - subtotal)})
                        </span>
                      )}
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
                      Giảm tối đa: {formatVND(voucher.max_discount_amount)}
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
                      HSD: {new Date(voucher.expiration_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <Ticket className="h-6 w-6 text-muted-foreground/70" />
                </div>
                <p className="text-muted-foreground">Không có mã giảm giá nào khả dụng</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedVoucher && !isVoucherDialogOpen && (
        <div className="mt-4 rounded-xl overflow-hidden border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="relative p-4">
            {/* Decorative elements */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border border-muted-foreground/20"></div>
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border border-muted-foreground/20"></div>

            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <Ticket className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-primary">
                    Giảm {selectedVoucher.discount_percentage}%
                  </span>
                </div>
                <Badge variant="outline" className="mb-2 bg-background/50 font-mono text-xs">
                  {selectedVoucher.code}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Đơn tối thiểu: {formatVND(selectedVoucher.min_order_amount)}
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  Bạn tiết kiệm được: {formatVND(calculateDiscount())}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVoucher(null);
                  form.setValue('voucher_code', '');
                }}
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );

  // Update orderCalculation to show message when shipping calculation is not available yet
  const orderCalculation = (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Tạm tính</span>
        <span>{formatVND(subtotal)}</span>
      </div>
      {selectedVoucher && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Giảm giá</span>
          <span className="text-primary">-{formatVND(discount)}</span>
        </div>
      )}
      {deliveryType === 'DELIVERY' && (
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            {isCalculatingShipping ? (
              <span className="flex items-center">
                <div className="h-3 w-3 mr-2 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                Đang tính...
              </span>
            ) : !shippingInfo && deliveryType === 'DELIVERY' ? (
              <span className="text-xs text-amber-500">Cần nhập địa chỉ đầy đủ</span>
            ) : (
              <span>{formatVND(deliveryFee)}</span>
            )}
          </div>
          {shippingInfo && (
            <div className="text-xs text-muted-foreground pl-2">
              <p>Khoảng cách: {shippingInfo.shipping_distance.toFixed(1)} km</p>
              <p>Thời gian dự kiến: {Math.ceil(shippingInfo.shipping_time)} phút</p>
            </div>
          )}
        </div>
      )}
      <Separator className="my-2" />
      <div className="flex justify-between text-base font-medium">
        <span>Tổng cộng</span>
        <span>{formatVND(total)}</span>
      </div>
    </div>
  );

  // Add function to move order to next state
  const moveOrderToNextState = async (orderId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Create form data for the multipart/form-data request
      const formData = new FormData();
      
      // Make the API call to move the order to the next state
      const response = await axios.put(
        `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/orders/${orderId}/move-to-next`,
        formData,
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error moving order to next state:', error);
      throw error;
    }
  };

  // Update the onSubmit handler to include shipping fee
  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);

    try {
      const fullAddress = `${data.address}, ${data.district}, ${data.province}`;
      const geocodeResult = await geocodeAddress(fullAddress);

      if (geocodeResult) {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          toast.error('Please login to continue');
          setIsProcessing(false);
          return;
        }

        try {
          const cartResponse = await cartService.getCart(accessToken);
          const bakeryId = cartResponse.payload.bakeryId;

          if (!bakeryId) {
            toast.error('Unable to determine bakery information');
            setIsProcessing(false);
            return;
          }

          const orderData = {
            bakery_id: bakeryId,
            order_note: data.specialInstructions || '',
            phone_number: data.phone,
            shipping_address: fullAddress,
            latitude: geocodeResult.location.lat.toString(),
            longitude: geocodeResult.location.lng.toString(),
            pickup_time: data.deliveryType === 'PICKUP' ? new Date().toISOString() : null,
            shipping_type: data.deliveryType,
            payment_type: data.paymentType,
            shipping_fee: deliveryFee,
            voucher_code: selectedVoucher?.code || "",
            order_detail_create_models: cartItems.map((item) => ({
              available_cake_id: item.available_cake_id || null,
              custom_cake_id: item.custom_cake_id || null,
              cake_note: item.cake_note || '',
              quantity: item.quantity,
              price: item.sub_total_price / item.quantity
            })),
          };

          console.log('Submitting order with data:', orderData);
          const response = await createOrder(orderData);

          if (response.status_code === 200) {
            const {
              total_customer_paid,
              order_code,
              total_product_price,
              shipping_distance,
              discount_amount,
              shipping_fee,
              id: orderId // Extract order ID
            } = response.payload;
            const qrLink = `https://img.vietqr.io/image/TPBank-00005992966-qr_only.jpg?amount=${total_customer_paid}&addInfo=${order_code}`;

            const orderDetails = {
              customerInfo: {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                address: fullAddress,
              },
              orderInfo: {
                items: cartItems,
                subtotal,
                deliveryFee,
                total: total_customer_paid,
                orderCode: order_code,
                totalProductPrice: total_product_price,
                shippingDistance: shipping_distance,
                discountAmount: discount_amount,
                shippingFee: shipping_fee,
                voucher: selectedVoucher ? {
                  code: selectedVoucher.code,
                  discount_percentage: selectedVoucher.discount_percentage,
                } : null,
                voucher_discount: discount
              },
              qrLink
            };

            // Save order details to localStorage
            localStorage.setItem('currentOrder', JSON.stringify(orderDetails));

            // Redirect based on payment type
            if (data.paymentType === 'QR_CODE') {
              // Reset payment countdown timer to ensure it starts from 15 minutes
              localStorage.removeItem('paymentCountdown');
              localStorage.removeItem('paymentTimestamp');
              
              // Không xóa giỏ hàng ở đây vì người dùng có thể chưa hoàn tất thanh toán
              // clearCart() đã được di chuyển sang trang payment-success
              
              // Navigate to QR payment page
              router.push('/qr-payment');
            } else {
              try {
                // For wallet payments, call the move-to-next API before redirecting
                await moveOrderToNextState(orderId);
                
                // DO NOT delete cart here - we should only delete it after confirmed payment success
                // Cart deletion is now handled in the payment-success page
                
                // Show success message and redirect to order confirmation
                toast.success('Thanh toán thành công từ ví của bạn!');
                router.push('/order-confirmation');
              } catch (moveError) {
                console.error('Error moving order to next state:', moveError);
                toast.error('Đã xảy ra lỗi khi xử lý thanh toán');
                setIsProcessing(false);
              }
            }
          } else {
            console.error('Order creation failed:', response.errors);
            toast.error('Failed to create order');
            setIsProcessing(false);
          }
        } catch (error) {
          console.error('Error getting cart or creating order:', error);
          toast.error('Failed to process order');
          setIsProcessing(false);
        }
      } else {
        console.error('Failed to geocode address:', fullAddress);
        toast.error('Failed to validate address');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-destructive mb-4">{error}</h2>
        <Button asChild>
          <Link href="/sign-in">Login</Link>
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        className="container mx-auto px-4 py-16 max-w-4xl text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          className="mb-8 flex justify-center"
        >
          <div className="rounded-full bg-green-100 p-6 dark:bg-green-900">
            <Check className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Order Confirmed!
        </motion.h1>

        <motion.p
          className="text-muted-foreground mb-8 max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Thank you for your order! Your confirmation number is <span className="font-medium">CK</span>.
          Weve sent an email with your order details and tracking information.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <PackageCheck className="mr-2 h-5 w-5" />
              Thông tin giao hàng
            </h2>

            <div className="text-center mb-6">
              <p className="font-medium">Estimated Delivery Date:</p>
              <p className="text-2xl font-bold mb-2">
                {/* {new Date(Date.now() + (deliveryMethod === 'express' ? 2 : 4) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} */}
              </p>
              <Badge variant={deliveryType === 'DELIVERY' ? 'default' : 'outline'}>
                {deliveryType === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng'}
              </Badge>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-1">Shipping Address:</h3>
                <p className="text-muted-foreground">
                  {form.getValues('fullName')}
                  <br />
                  {form.getValues('address')}
                  <br />
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Contact Information:</h3>
                <p className="text-muted-foreground">
                  Email: {form.getValues('email')}
                  <br />
                  Phone: {form.getValues('phone')}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/cakes">Continue Shopping</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/">Return to Home</Link>
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <motion.div variants={itemVariants} className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/cart" className="flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold"></h1>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main checkout form */}
        <motion.div
          variants={itemVariants}
          className="w-full lg:w-2/3"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Delivery Information */}
              <Card className="p-6">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-3">
                    1
                  </div>
                  <h2 className="text-xl font-bold">Delivery Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và Tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Thanh Tâm" className="h-[3.5rem]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" className="h-[3.5rem]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" className="h-[3.5rem]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-base font-semibold mb-2">Tỉnh/Thành phố</FormLabel>
                        <Select
                          onValueChange={handleProvinceChange}
                          defaultValue={selectedProvince}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="w-full min-h-[3.5rem] px-4 bg-background border-2 transition-all duration-200 
                              ease-in-out hover:border-primary focus:border-primary rounded-xl shadow-sm
                              hover:shadow-md focus:shadow-md"
                            >
                              <SelectValue
                                placeholder="Chọn tỉnh/thành phố"
                                className="text-base placeholder:text-muted-foreground/70"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            className="max-h-[300px] overflow-y-auto rounded-xl border-2 border-border shadow-2xl bg-popover 
                            p-2 z-[100] relative"
                            style={{
                              position: 'fixed',
                              backgroundColor: 'hsl(var(--popover))',
                              backdropFilter: 'none'
                            }}
                          >
                            <div className="sticky top-0 bg-popover p-3 border-b mb-2">
                              <div className="text-sm font-semibold text-popover-foreground flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-primary" />
                                Chọn tỉnh/thành phố
                              </div>
                            </div>
                            {vietnamProvinces.map((province: Province) => (
                              <SelectItem
                                key={province.code}
                                value={province.code}
                                className="cursor-pointer transition-all duration-150 rounded-lg my-1 px-3 py-2.5
                                hover:bg-primary/10 focus:bg-primary/10 data-[state=checked]:bg-primary/20"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{province.name}</span>
                                  <Badge variant="outline" className="ml-2 bg-popover">
                                    {province.districts.length} quận/huyện
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-base font-semibold mb-2">Quận/Huyện</FormLabel>
                        <Select
                          onValueChange={handleDistrictChange}
                          defaultValue={field.value}
                          disabled={!selectedProvince}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`w-full min-h-[3.5rem] px-4 bg-background border-2 transition-all duration-200 
                              ease-in-out rounded-xl shadow-sm ${!selectedProvince
                                  ? 'opacity-50 cursor-not-allowed border-muted'
                                  : 'hover:border-primary focus:border-primary hover:shadow-md focus:shadow-md'
                                }`}
                            >
                              <SelectValue
                                placeholder={
                                  !selectedProvince
                                    ? "Vui lòng chọn tỉnh/thành phố trước"
                                    : "Chọn quận/huyện"
                                }
                                className="text-base placeholder:text-muted-foreground/70"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            className="max-h-[300px] overflow-y-auto rounded-xl border-2 border-border shadow-2xl bg-popover 
                            p-2 z-[100] relative"
                            style={{
                              position: 'fixed',
                              backgroundColor: 'hsl(var(--popover))',
                              backdropFilter: 'none'
                            }}
                          >
                            <div className="sticky top-0 bg-popover p-3 border-b mb-2">
                              <div className="text-sm font-semibold text-popover-foreground flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-primary" />
                                Chọn quận/huyện
                              </div>
                            </div>
                            {availableDistricts.map((district) => (
                              <SelectItem
                                key={district.code}
                                value={district.code}
                                className="cursor-pointer transition-all duration-150 rounded-lg my-1 px-3 py-2.5
                                hover:bg-primary/10 focus:bg-primary/10 data-[state=checked]:bg-primary/20"
                              >
                                <div className="flex items-center">
                                  <span className="font-medium">{district.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Số nhà, tên đường" 
                            className="h-[3.5rem]" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              // Wait for the field value to be updated before recalculating
                              setTimeout(() => handleAddressChange(), 300);
                            }}
                            onBlur={(e) => {
                              field.onBlur();
                              handleAddressChange();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                <FormField
                  control={form.control}
                  name="deliveryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mb-4 block">Phương thức nhận hàng</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Recalculate shipping fee when delivery type changes
                            if (value === 'DELIVERY') {
                              handleAddressChange();
                            }
                          }}
                          className="flex flex-col md:flex-row gap-4"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <Label
                              htmlFor="pickup"
                              className={`
                                flex flex-col p-4 border-2 rounded-lg cursor-pointer h-full transition-all duration-200
                                ${field.value === 'PICKUP'
                                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                                  : 'border-muted hover:border-primary/50 dark:border-muted-foreground/30 dark:hover:border-primary/50'}
                              `}
                            >
                              <div className="flex items-start mb-1">
                                <div className="flex items-center justify-center mt-1 mr-3">
                                  <RadioGroupItem value="PICKUP" id="pickup" className="mt-0" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${field.value === 'PICKUP' ? 'bg-primary/20 dark:bg-primary/30' : 'bg-muted dark:bg-muted/30'}`}>
                                      <ShoppingBag className={`h-5 w-5 ${field.value === 'PICKUP' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <span className={`font-medium ${field.value === 'PICKUP' ? 'text-primary' : ''}`}>Tại cửa hàng</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Nhận bánh trực tiếp tại cửa hàng
                                  </p>
                                  <Badge variant="outline" className="mt-2 bg-secondary/10">Miễn phí</Badge>
                                </div>
                              </div>
                            </Label>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <Label
                              htmlFor="delivery"
                              className={`
                                flex flex-col p-4 border-2 rounded-lg cursor-pointer h-full transition-all duration-200
                                ${field.value === 'DELIVERY'
                                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                                  : 'border-muted hover:border-primary/50 dark:border-muted-foreground/30 dark:hover:border-primary/50'}
                              `}
                            >
                              <div className="flex items-start mb-1">
                                <div className="flex items-center justify-center mt-1 mr-3">
                                  <RadioGroupItem value="DELIVERY" id="delivery" className="mt-0" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${field.value === 'DELIVERY' ? 'bg-primary/20 dark:bg-primary/30' : 'bg-muted dark:bg-muted/30'}`}>
                                      <Truck className={`h-5 w-5 ${field.value === 'DELIVERY' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <span className={`font-medium ${field.value === 'DELIVERY' ? 'text-primary' : ''}`}>Giao tận nơi</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Shipper sẽ giao tận nhà
                                  </p>
                                  {field.value === 'DELIVERY' && (
                                    isCalculatingShipping ? (
                                      <Badge variant="outline" className="mt-2 bg-secondary/10 animate-pulse">
                                        Đang tính phí vận chuyển...
                                      </Badge>
                                    ) : shippingInfo ? (
                                      <Badge variant="outline" className="mt-2 bg-secondary/10">
                                        {formatVND(standardDelivery || 0)}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="mt-2 bg-secondary/10">
                                        Cần địa chỉ để tính phí
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            </Label>
                          </motion.div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-6" />

                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mb-4 block">Phương thức thanh toán</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-col md:flex-row gap-4"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <Label
                              htmlFor="qr-code"
                              className={`
                                flex flex-col p-4 border-2 rounded-lg cursor-pointer h-full transition-all duration-200
                                ${field.value === 'QR_CODE'
                                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                                  : 'border-muted hover:border-primary/50 dark:border-muted-foreground/30 dark:hover:border-primary/50'}
                              `}
                            >
                              <div className="flex items-start mb-2">
                                <div className="flex items-center justify-center mt-1 mr-3">
                                  <RadioGroupItem value="QR_CODE" id="qr-code" className="mt-0" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${field.value === 'QR_CODE' ? 'bg-primary/20 dark:bg-primary/30' : 'bg-muted dark:bg-muted/30'}`}>
                                      <CreditCard className={`h-5 w-5 ${field.value === 'QR_CODE' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <span className={`font-medium ${field.value === 'QR_CODE' ? 'text-primary' : ''}`}>Thanh toán ngân hàng</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Quét mã QR qua ứng dụng ngân hàng
                                  </p>
                                </div>
                              </div>
                              {field.value === 'QR_CODE' && (
                                <div className="mt-2 rounded-md bg-primary/10 dark:bg-primary/20 p-2 flex items-center text-xs">
                                  <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                                  <span className="text-primary dark:text-primary-foreground">Thanh toán an toàn qua ngân hàng của bạn</span>
                                </div>
                              )}
                            </Label>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <Label
                              htmlFor="wallet"
                              className={`
                                flex flex-col p-4 border-2 rounded-lg cursor-pointer h-full transition-all duration-200
                                ${field.value === 'WALLET'
                                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                                  : 'border-muted hover:border-primary/50 dark:border-muted-foreground/30 dark:hover:border-primary/50'}
                              `}
                            >
                              <div className="flex items-start mb-2">
                                <div className="flex items-center justify-center mt-1 mr-3">
                                  <RadioGroupItem value="WALLET" id="wallet" className="mt-0" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${field.value === 'WALLET' ? 'bg-primary/20 dark:bg-primary/30' : 'bg-muted dark:bg-muted/30'}`}>
                                      <Wallet className={`h-5 w-5 ${field.value === 'WALLET' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <span className={`font-medium ${field.value === 'WALLET' ? 'text-primary' : ''}`}>Ví điện tử</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Thanh toán bằng số dư trong ví của bạn
                                  </p>
                                </div>
                              </div>
                              {field.value === 'WALLET' && (
                                <div className="mt-2 rounded-md bg-primary/10 dark:bg-primary/20 p-2 flex items-center text-xs">
                                  <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                                  <span className="text-primary dark:text-primary-foreground">Thanh toán nhanh chóng và an toàn</span>
                                </div>
                              )}
                            </Label>
                          </motion.div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </Card>

              {renderVoucherSection()}

              {/* Submit section */}
              <motion.div
                variants={itemVariants}
                className="sticky bottom-0 bg-background p-4 border-t border-border shadow-md md:static md:p-0 md:border-0 md:shadow-none z-10"
              >
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isProcessing || !form.formState.isValid}
                  >
                    {isProcessing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      `Hoàn thành đơn hàng`
                    )}
                  </Button>
                </div>
              </motion.div>
            </form>
          </Form>
        </motion.div>

        {/* Order summary */}
        <motion.div
          variants={itemVariants}
          className="w-full lg:w-1/3 "
        >
          <Card className="sticky top-24 border-muted/50">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Thông tin đơn hàng</h2>
                <Badge variant="outline" className="px-2 py-0.5">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </Badge>
              </div>

              {/* Mobile view - collapsible order summary */}
              <div className="lg:hidden mb-3">
                <Collapsible
                  open={isOrderSummaryOpen}
                  onOpenChange={setIsOrderSummaryOpen}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full flex justify-between">
                      <span>View Order Details</span>
                      {isOrderSummaryOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <ScrollArea className="h-[calc(100vh-480px)] min-h-[150px]">
                      <div className="space-y-4 pr-4">
                        {cartItems.map((item) => (
                          <div key={item.available_cake_id || item.custom_cake_id} className="flex gap-3">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                              {item.main_image?.file_url ? (
                                <Image
                                  src={getImageUrl(item.main_image.file_url) || '/placeholder-cake.jpg'}
                                  alt={item.cake_name}
                                  fill
                                  className="object-cover"
                                  onError={handleImageError}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  unoptimized
                                  priority
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200">
                                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                                </div>
                              )}
                              {item.quantity > 1 && (
                                <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary-foreground">{item.quantity}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                              <h3 className="font-medium">{item.cake_name}</h3>

                              <div className="mt-auto text-sm font-medium">
                                {formatVND(item.sub_total_price)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Desktop view - always visible order items */}
              <div className="hidden lg:block">
                <ScrollArea className="max-h-[120px]">
                  <div className="space-y-2 pr-4">
                    {cartItems.map((item) => (
                      <div key={item.available_cake_id || item.custom_cake_id} className="flex gap-2">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                          {item.main_image?.file_url ? (
                            <Image
                              src={getImageUrl(item.main_image.file_url) || '/placeholder-cake.jpg'}
                              alt={item.cake_name}
                              fill
                              className="object-cover"
                              onError={handleImageError}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              unoptimized
                              priority
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200">
                              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          {item.quantity > 1 && (
                            <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs font-bold text-primary-foreground">{item.quantity}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <h3 className="font-medium text-sm">{item.cake_name}</h3>
                          {/* <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.cake_note || 'No special notes'}
                          </p> */}
                          <div className="text-sm font-medium">
                            {formatVND(item.sub_total_price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator className="my-3" />

              {orderCalculation}

              <div className="mt-3">
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Thanh toán an toàn</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Tất cả dữ liệu nhạy cảm được mã hóa</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;