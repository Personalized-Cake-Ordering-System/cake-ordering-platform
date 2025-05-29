'use client'
import * as React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ChevronRight, ShoppingBag, AlertCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useCart } from '@/app/store/useCart';
import { useState, useEffect } from 'react';

// Define CartItem interface locally since we're not using cartService
interface CartItem {
  cake_name: string;
  main_image_id: string;
  main_image?: {
    file_name?: string;
    file_url?: string;
    id?: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
    updated_by?: string;
    is_deleted?: boolean;
  } | null;
  quantity: number;
  cake_note: string;
  sub_total_price: number;
  available_cake_id?: string | null;
  custom_cake_id?: string | null;
  bakery_id?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  },
  exit: {
    y: -20,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3 }
  }
};

const CartPage = () => {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [showCakeModal, setShowCakeModal] = React.useState(false);
  const [selectedCake, setSelectedCake] = React.useState<CartItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showBakeryChangeNotice, setShowBakeryChangeNotice] = useState(false);
  const [newBakeryName, setNewBakeryName] = useState('');

  // Add VND currency formatter
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Add this function to correct current cart in local storage if needed
  const syncCartWithAPI = (apiCartItems: CartItem[]) => {
    if (!apiCartItems || apiCartItems.length === 0) {
      return;
    }

    // Get the bakery ID from the first item
    const bakeryId = apiCartItems[0].bakery_id;

    if (!bakeryId) {
      return;
    }

    // Get the local cart
    const localCart = useCart.getState();

    // Set correct bakery ID in local storage
    if (localCart.currentBakeryId !== bakeryId) {
      console.log('Updating local bakeryId to match API:', bakeryId);
      // Clear cart and set new bakeryId
      localCart.clearCart();

      // Map API cart items to local storage format and add each one
      apiCartItems.forEach(item => {
        const itemId = item.available_cake_id || item.custom_cake_id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localCart.addToCart({
          id: itemId,
          quantity: item.quantity,
          bakeryId: bakeryId,
          config: {
            price: item.sub_total_price / item.quantity,
            size: "",
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
            imageUrl: item.main_image?.file_url || null,
            pipingColor: "",
            name: item.cake_name,
            description: "",
            type: ""
          },
          price: item.sub_total_price
        });
      });

      console.log('Cart synchronized with API');
    }
  }

  // Update the fetchCart function to include syncing
  const fetchCart = React.useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Vui lòng đăng nhập để xem giỏ hàng');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching cart data...');
      const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': '*/*'
        }
      });

      const data = await response.json();
      console.log('Cart API Response:', data);

      if (data.status_code === 200 && data.payload) {
        const apiCartItems = data.payload.cartItems || [];
        setCartItems(apiCartItems);

        // Sync local storage with API data
        syncCartWithAPI(apiCartItems);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err instanceof Error && err.message.includes('401')) {
        setError('Vui lòng đăng nhập để xem giỏ hàng');
      } else {
        setError('Failed to fetch cart items. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add useEffect to check localStorage for bakery change notification
  React.useEffect(() => {
    const bakeryChangeNotice = localStorage.getItem('bakeryChangeNotice');
    if (bakeryChangeNotice) {
      try {
        const notice = JSON.parse(bakeryChangeNotice);
        setShowBakeryChangeNotice(true);
        setNewBakeryName(notice.bakeryName || 'new bakery');

        // Remove the notice after showing it
        localStorage.removeItem('bakeryChangeNotice');
      } catch (e) {
        console.error('Error parsing bakery change notice:', e);
      }
    }
  }, []);

  // Add function to dismiss bakery change notice
  const dismissBakeryChangeNotice = () => {
    setShowBakeryChangeNotice(false);
  };

  const handleQuantityChange = async (item: CartItem, change: number) => {
    console.log('Quantity Change Request:', {
      item: item.cake_name,
      currentQuantity: item.quantity,
      change,
      newQuantity: item.quantity + change
    });

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      toast.error('Vui lòng đăng nhập để cập nhật giỏ hàng');
      return;
    }

    try {
      const newQuantity = item.quantity + change;
      if (newQuantity < 1) {
        // If quantity would be less than 1, remove the item instead
        handleRemoveItem(item);
        return;
      }

      // First update local storage - use the correct ID
      const localCart = useCart.getState();
      const localItemId = item.available_cake_id || item.custom_cake_id || '';

      if (localItemId) {
        // Find matching item in local storage - search by ID
        const localItem = localCart.items.find(i => i.id === localItemId);
        if (localItem) {
          localCart.updateQuantity(localItemId, newQuantity);
        } else {
          // If item doesn't exist in local storage with the API ID, try to find by other means
          console.log('Item not found in local storage by ID, checking all items');
          // This is a fallback in case IDs don't match between local and API
          const allItems = localCart.items;
          console.log('All local items:', allItems);
        }
      }

      // Then fetch current cart from API to get all existing items
      const cartResponse = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': '*/*'
        }
      });

      const cartData = await cartResponse.json();

      // Get existing cart items or initialize empty array
      let existingCartItems: CartItem[] = [];
      if (cartData.status_code === 200 && cartData.payload && cartData.payload.cartItems) {
        existingCartItems = cartData.payload.cartItems;
      }

      // Update the quantity of the specific item
      const updatedCartItems = existingCartItems.map(cartItem => {
        if ((item.available_cake_id && cartItem.available_cake_id === item.available_cake_id) ||
          (item.custom_cake_id && cartItem.custom_cake_id === item.custom_cake_id)) {
          return {
            ...cartItem,
            quantity: newQuantity,
            sub_total_price: (cartItem.sub_total_price / cartItem.quantity) * newQuantity
          };
        }
        return cartItem;
      });

      // Get bakeryId from the first cart item or use the item's bakery_id
      const bakeryId = (cartData.payload?.bakeryId || item.bakery_id || "");

      // Prepare the complete cart payload with all updated items
      const cartPayload = {
        bakeryId: bakeryId,
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
        // After API success, fetch cart to ensure local storage and UI match API data
        await fetchCart();
        toast.success('Cập nhật giỏ hàng thành công');
      } else {
        console.error('Failed to update cart:', data);
        toast.error(data.errors?.[0] || 'Cập nhật giỏ hàng thất bại');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Cập nhật giỏ hàng thất bại');
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      toast.error('Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng');
      return;
    }

    try {
      const itemId = item.available_cake_id || item.custom_cake_id;
      if (!itemId) {
        toast.error('ID sản phẩm không hợp lệ');
        return;
      }

      // First remove from local storage using the correct ID
      const localCart = useCart.getState();
      localCart.removeFromCart(itemId);

      // If no match found with API ID, log for debugging
      if (localCart.items.some(i => (i.id === itemId))) {
        console.log('Failed to remove item from local storage', itemId);
      }

      // Then fetch current cart from API to get all existing items
      const cartResponse = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': '*/*'
        }
      });

      const cartData = await cartResponse.json();

      // Get existing cart items or initialize empty array
      let existingCartItems: CartItem[] = [];
      if (cartData.status_code === 200 && cartData.payload && cartData.payload.cartItems) {
        existingCartItems = cartData.payload.cartItems;
      }

      // Filter out the item to remove
      const updatedCartItems = existingCartItems.filter(cartItem =>
        !((item.available_cake_id && cartItem.available_cake_id === item.available_cake_id) ||
          (item.custom_cake_id && cartItem.custom_cake_id === item.custom_cake_id))
      );

      // Get bakeryId from the first cart item or use the item's bakery_id
      const bakeryId = (cartData.payload?.bakeryId || item.bakery_id || "");

      // Prepare the complete cart payload with the filtered items
      const cartPayload = {
        bakeryId: bakeryId,
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

      // Update the cart with the filtered items
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
        // After API success, fetch cart to ensure local storage and UI match API data
        await fetchCart();
        toast.success('Xóa sản phẩm khỏi giỏ hàng thành công');
      } else {
        console.error('Failed to remove item:', data);
        toast.error(data.errors?.[0] || 'Xóa sản phẩm khỏi giỏ hàng thất bại');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Xóa sản phẩm khỏi giỏ hàng thất bại');
    }
  };

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

  // Add error handling for image loading
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/imagecake.jpg'; // Fallback image
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Bakery Change Notice */}
      {showBakeryChangeNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">Your cart has been updated</p>
                <p className="text-amber-700 text-sm">
                  Items from your previous cart have been removed because you added a product from a different bakery ({newBakeryName}).
                  Items can only be ordered from one bakery at a time.
                </p>
              </div>
            </div>
            <button
              onClick={dismissBakeryChangeNotice}
              className="text-amber-500 hover:text-amber-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content - Cart items */}
        <motion.div
          className="w-full md:w-2/3"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Giỏ Hàng Của Bạn</h1>
            <Badge variant="outline" className="px-3 py-1 text-base">
              {cartItems.length} {cartItems.length === 1 ? 'Sản Phẩm' : 'Sản Phẩm'}
            </Badge>
          </div>

          {cartItems.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg text-center"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                bounce: 0.3
              }}
            >
              <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-medium mb-2">Giỏ hàng của bạn đang trống</h2>
              <p className="text-muted-foreground mb-6">Vui lòng xem bộ sưu tập bánh của chúng tôi để chọn chiếc bánh yêu thích của bạn.</p>
              <Button asChild>
                <Link href="/cakes">
                  Xem Bánh
                </Link>
              </Button>
            </motion.div>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.available_cake_id || item.custom_cake_id}
                    id={`cart-item-${item.available_cake_id || item.custom_cake_id}`}
                    variants={itemVariants}
                    layout
                    className="group"
                  >
                    <Card className="group overflow-hidden border-muted/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 bg-gradient-to-br from-white to-muted/10">
                      <div className="flex flex-col sm:flex-row p-6 gap-6">
                        <motion.div
                          className="relative w-full sm:w-1/4 h-48 sm:h-48 rounded-xl overflow-hidden bg-muted/30 cursor-pointer shadow-lg group-hover:shadow-xl transition-all duration-500"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onClick={() => {
                            setSelectedCake(item);
                            setShowCakeModal(true);
                          }}
                        >
                          {item.main_image?.file_url ? (
                            <Image
                              src={getImageUrl(item.main_image.file_url) || '/placeholder-cake.jpg'}
                              alt={item.cake_name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={handleImageError}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              unoptimized
                              priority
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                        <div className="flex flex-col sm:flex-1 justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-medium">
                                  {item.cake_name}
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {item.available_cake_id && (
                                    <Badge variant="outline" className="text-xs bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20 text-pink-700">
                                      Bánh Có Sẵn
                                    </Badge>
                                  )}
                                  {item.custom_cake_id && (
                                    <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 text-purple-700">
                                      Bánh Tùy Chỉnh
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 space-y-3 bg-muted/5 p-4 rounded-lg border border-muted/10">
                              {item.cake_note && (
                                <div className="flex items-start gap-2">
                                  <span className="text-muted-foreground text-sm font-medium min-w-[80px]">Ghi chú:</span>
                                  <p className="text-sm">{item.cake_note}</p>
                                </div>
                              )}

                              <div className="flex items-start gap-2">
                                <span className="text-muted-foreground text-sm font-medium min-w-[80px]">Giá một cái:</span>
                                <p className="text-sm font-medium text-primary">{formatVND(item.sub_total_price / item.quantity)}</p>
                              </div>

                              <div className="flex items-start gap-2">
                                <span className="text-muted-foreground text-sm font-medium min-w-[80px]">Tổng phụ:</span>
                                <p className="text-sm font-medium text-primary">{formatVND(item.sub_total_price)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">Số lượng:</span>
                              <div className="flex items-center space-x-1 border rounded-full bg-muted/5 p-1">
                                <motion.button
                                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleQuantityChange(item, -1)}
                                  className="p-2 rounded-full hover:bg-background transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </motion.button>
                                <span className="px-4 font-medium">{item.quantity}</span>
                                <motion.button
                                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleQuantityChange(item, 1)}
                                  className="p-2 rounded-full hover:bg-background transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                                {formatVND(item.sub_total_price)}
                              </div>
                              <p className="text-sm text-muted-foreground">Tổng cộng</p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRemoveItem(item)}
                              className="text-muted-foreground hover:text-destructive transition-colors relative group/btn"
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="p-2 rounded-full hover:bg-destructive/10 transition-colors">
                                      <Trash2 className="w-5 h-5" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xóa sản phẩm</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </motion.div>

        {/* Order summary */}
        <motion.div
          className="w-full md:w-1/3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.4
          }}
        >
          <Card className="sticky top-24 border-muted/50">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Tổng Đơn Hàng</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span>{formatVND(cartItems.reduce((sum, item) => sum + item.sub_total_price, 0))}</span>
                </div>
              </div>

              <motion.div
                whileHover={{
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold shadow-lg transition-all duration-500 hover:shadow-xl hover:shadow-primary/20"
                  disabled={cartItems.length === 0}
                  asChild
                >
                  <Link href="/checkout">Tiến Hành Thanh Toán</Link>
                </Button>
              </motion.div>

              {/* <div className="flex justify-center mt-4">
                <Button variant="link" className="text-sm" asChild>
                  <Link href="/cakes">Tiếp Tục Mua Sắm</Link>
                </Button>
              </div> */}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Cake Modal */}
      {showCakeModal && selectedCake && (
        <Dialog open={showCakeModal} onOpenChange={setShowCakeModal}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Chi Tiết Bánh
              </DialogTitle>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full"
            >
              <div className="relative w-full h-80">
                {selectedCake.main_image?.file_url ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={getImageUrl(selectedCake.main_image.file_url) || '/placeholder-cake.jpg'}
                      alt={selectedCake.cake_name}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <ShoppingBag className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {selectedCake.cake_name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCake.available_cake_id && (
                          <Badge variant="outline" className="text-xs bg-pink-50 border-pink-200 text-pink-700">
                            Bánh Có Sẵn
                          </Badge>
                        )}
                        {selectedCake.custom_cake_id && (
                          <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                            Bánh Tùy Chỉnh
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatVND(selectedCake.sub_total_price)}
                      </div>
                      <p className="text-sm text-gray-500">Tổng cộng</p>
                    </div>
                  </div>

                  <Separator className="my-4 bg-gray-200" />

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-500">Giá một cái</h4>
                      <p className="font-medium text-gray-900">
                        {formatVND(selectedCake.sub_total_price / selectedCake.quantity)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-500">Số lượng</h4>
                      <p className="font-medium text-gray-900">{selectedCake.quantity}</p>
                    </div>
                    {selectedCake.cake_note && (
                      <div className="col-span-2 space-y-2">
                        <h4 className="font-medium text-sm text-gray-500">Ghi chú</h4>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                          {selectedCake.cake_note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowCakeModal(false)}
                    className="rounded-full px-6 text-gray-700 hover:bg-gray-100"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CartPage;