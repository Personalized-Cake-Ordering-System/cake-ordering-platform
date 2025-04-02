'use client'
import * as React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ChevronRight, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cartService, CartItem } from '@/app/services/cartService';
import { toast } from 'sonner';

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

  // Add VND currency formatter
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Add fetchCart function
  const fetchCart = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Please login to view your cart');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching cart data...');
      const response = await cartService.getCart(accessToken);
      console.log('Cart API Response:', response);

      if (response && response.payload) {
        setCartItems(response.payload.cartItems || []);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err instanceof Error && err.message.includes('401')) {
        setError('Please login to view your cart');
      } else {
        setError('Failed to fetch cart items. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (item: CartItem, change: number) => {
    console.log('Quantity Change Request:', {
      item: item.cake_name,
      currentQuantity: item.quantity,
      change,
      newQuantity: item.quantity + change
    });
    // TODO: Implement quantity update API call
  };

  const handleRemoveItem = async (item: CartItem) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      toast.error('Please login to remove items from cart');
      return;
    }

    try {
      const itemId = item.available_cake_id || item.custom_cake_id;
      if (!itemId) {
        toast.error('Invalid item ID');
        return;
      }

      const response = await cartService.deleteCart(accessToken, itemId);

      if (response && response.status_code === 200) {
        // Fetch fresh cart data after successful deletion
        await fetchCart();
        toast.success('Item removed from cart successfully');
      } else {
        console.error('Failed to remove item:', response);
        toast.error(response?.errors?.[0] || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
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
    target.src = '/placeholder-cake.jpg'; // Fallback image
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
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content - Cart items */}
        <motion.div
          className="w-full md:w-2/3"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <Badge variant="outline" className="px-3 py-1 text-base">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
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
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Please go to our cakes collection to choose your favorite cake to buy.</p>
              <Button asChild>
                <Link href="/cakes">
                  Browse Cakes
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
                    <Card className="overflow-hidden border-muted/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5">
                      <div className="flex flex-col sm:flex-row p-4 gap-4">
                        <motion.div
                          className="relative w-full sm:w-1/4 h-40 sm:h-auto rounded-md overflow-hidden bg-muted/30 cursor-pointer"
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
                              className="object-cover transition-transform hover:scale-105"
                              onError={handleImageError}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              unoptimized
                              priority
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </motion.div>
                        <div className="flex flex-col sm:flex-1 justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <h3 className="text-xl font-medium">{item.cake_name}</h3>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRemoveItem(item)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Trash2 className="w-5 h-5" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remove item</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </motion.button>
                            </div>
                            {item.cake_note && (
                              <p className="text-muted-foreground mt-1 mb-4 text-sm">
                                Note: {item.cake_note}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-1 border rounded-md">
                              <motion.button
                                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuantityChange(item, -1)}
                                className="p-2"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>
                              <span className="px-4">{item.quantity}</span>
                              <motion.button
                                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuantityChange(item, 1)}
                                className="p-2"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{formatVND(item.sub_total_price)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <Button variant="link" className="h-auto p-0 flex items-center text-primary" asChild>
                          <Link href={`/customizeCake?editId=${item.available_cake_id || item.custom_cake_id}`}>
                            Edit custom cake
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
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
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
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
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </motion.div>

              <div className="flex justify-center mt-4">
                <Button variant="link" className="text-sm" asChild>
                  <Link href="/cakes/cakes">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Cake Modal */}
      {showCakeModal && selectedCake && (
        <Dialog open={showCakeModal} onOpenChange={setShowCakeModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cake Details</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-72">
              {selectedCake.main_image?.file_url ? (
                <Image
                  src={getImageUrl(selectedCake.main_image.file_url) || '/placeholder-cake.jpg'}
                  alt={selectedCake.cake_name}
                  fill
                  className="object-cover rounded-md"
                  onError={handleImageError}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-md shadow-md">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-4 p-4">
              <div className='flex justify-between'>
                <div>
                  <h4 className="font-medium text-lg">Specifications:</h4>
                  <p className="text-sm text-muted-foreground">
                    Name: {selectedCake.cake_name}<br />
                    {selectedCake.cake_note && `Note: ${selectedCake.cake_note}`}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-lg">Price:</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatVND(selectedCake.sub_total_price)}<br />
                    Quantity: {selectedCake.quantity}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CartPage;