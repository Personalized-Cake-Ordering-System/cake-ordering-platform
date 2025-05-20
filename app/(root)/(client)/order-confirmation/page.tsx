  
'use client' ;

import { motion } from 'framer-motion' ;
import { useRouter } from 'next/navigation' ;
import { Button } from '@/components/ui/button' ;
import { Card } from '@/components/ui/card' ;
import { CheckCircle, Home, ShoppingBag, Clock, Wallet } from 'lucide-react' ;
import { useEffect, useState } from 'react' ;
import { Badge } from '@/components/ui/badge' ;
import { Separator } from '@/components/ui/separator' ;
import Link from 'next/link' ;
import { useCart } from '@/app/store/useCart' ;
import { toast } from 'sonner' ;

// Function to decode JWT token (if needed)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1] ;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/') ;
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    ) ;
    return JSON.parse(jsonPayload) ;
  } catch (error) {
    console.error('Error decoding JWT token:', error) ;
    return null ;
  }
} ;

const OrderConfirmationPage = () => {
  const router = useRouter() ;
  const [orderDetails, setOrderDetails] = useState<any>(null) ;
  const [loading, setLoading] = useState(true) ;
  const { deleteCartAPI } = useCart() ;

  // Add VND currency formatter
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount) ;
  } ;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  } ;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  } ;

  useEffect(() => {
    // Delete cart from API and clear local storage after successful order
    const deleteCart = async () => {
      try {
        const result = await deleteCartAPI();
        if (!result) {
          console.error('Failed to delete cart from API');
        }
      } catch (error) {
        console.error('Error deleting cart:', error);
        toast.error('Error clearing cart data');
      }
    };

    // Get order details from localStorage
    const savedOrder = localStorage.getItem('currentOrder') ;
    if (savedOrder) {
      const orderData = JSON.parse(savedOrder) ;
      setOrderDetails(orderData) ;
      // Clear the current order from localStorage
      localStorage.removeItem('currentOrder') ;
      
      // Call API to delete cart
      deleteCart();
    }
    setLoading(false) ;
  }, [deleteCartAPI]) ;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    ) ;
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="p-6 text-center border dark:border-border">
          <h2 className="text-xl font-bold mb-4">No order information found</h2>
          <p className="text-muted-foreground mb-6">We couldn&apos ;t find any details for your order.</p>
          <Button asChild>
            <Link href="/checkout">Return to Checkout</Link>
          </Button>
        </Card>
      </div>
    ) ;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-16 max-w-4xl"
    >
      <Card className="p-8 border dark:border-border shadow-lg">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được thanh toán thành công bằng ví điện tử.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5 text-primary" />
              Thông tin đơn hàng
            </h2>
            
            <div className="bg-muted/20 dark:bg-muted/10 p-4 rounded-lg mb-4 border dark:border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
                <Badge variant="outline" className="font-mono">
                  {orderDetails.orderInfo.orderCode}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 dark:text-white">Đã thanh toán</Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2 text-muted-foreground">Chi tiết sản phẩm</h3>
                <div className="space-y-3">
                  {orderDetails.orderInfo.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm py-1 px-2 rounded-md hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors">
                      <span>
                        {item.cake_name} x {item.quantity}
                      </span>
                      <span className="font-medium">{formatVND(item.sub_total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="dark:border-border/60" />
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatVND(orderDetails.orderInfo.totalProductPrice)}</span>
                </div>
                
                {orderDetails.orderInfo.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá</span>
                    <span className="text-primary dark:text-primary-foreground">-{formatVND(orderDetails.orderInfo.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>{formatVND(orderDetails.orderInfo.shippingFee)}</span>
                </div>
                
                <Separator className="my-2 dark:border-border/60" />
                
                <div className="flex justify-between font-medium">
                  <span>Tổng cộng</span>
                  <span>{formatVND(orderDetails.orderInfo.total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Thông tin giao hàng
            </h2>
            
            <div className="bg-muted/20 dark:bg-muted/10 p-4 rounded-lg space-y-4 border dark:border-border">
              <div>
                <h3 className="font-medium text-sm mb-1 text-muted-foreground">Họ tên người nhận</h3>
                <p>{orderDetails.customerInfo.fullName}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-1 text-muted-foreground">Email</h3>
                <p>{orderDetails.customerInfo.email}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-1 text-muted-foreground">Số điện thoại</h3>
                <p>{orderDetails.customerInfo.phone}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-1 text-muted-foreground">Địa chỉ giao hàng</h3>
                <p>{orderDetails.customerInfo.address}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-1 text-muted-foreground">Phương thức thanh toán</h3>
                <p className="flex items-center"><Wallet className="h-4 w-4 mr-2 text-primary" />Ví điện tử</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button asChild variant="outline" size="lg" className="border dark:border-border hover:bg-muted/30 dark:hover:bg-muted/20">
            <Link href="/cakes">Tiếp tục mua sắm</Link>
          </Button>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/orderHistory">Xem lịch sử đơn hàng</Link>
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  ) ;
} ;

export default OrderConfirmationPage ; 