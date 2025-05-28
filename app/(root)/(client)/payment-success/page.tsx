'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/store/useCart';
import { toast } from 'sonner';

// Function to decode JWT token
const decodeJWT = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
};

const PaymentSuccessPage = () => {
    const router = useRouter();
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [userId, setUserId] = useState<string>('');
    const { deleteCartAPI } = useCart();

    useEffect(() => {
        // Delete cart from API and clear local storage after successful payment
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
        
        deleteCart();
        
        // Get order details from localStorage
        const savedOrder = localStorage.getItem('currentOrder');
        if (savedOrder) {
            const orderData = JSON.parse(savedOrder);
            setOrderDetails(orderData);

            // Get JWT token from localStorage
            const token = localStorage.getItem('accessToken');
            if (token) {
                console.log('JWT Token found in accessToken, decoding...');
                const decodedToken = decodeJWT(token);
                if (decodedToken && decodedToken.id) {
                    console.log('Decoded user ID:', decodedToken.id);
                    setUserId(decodedToken.id);
                    console.log('Payment success page loaded for user:', decodedToken.id, 'order:', orderData.orderInfo.orderCode);
                } else {
                    console.error('Failed to decode token or no ID found');
                }
            } else {
                console.error('No JWT token found in accessToken');
            }
        }
    }, [deleteCartAPI]);

    const handleContinueShopping = () => {
        router.push('/cakes');
    };

    const handleViewOrders = () => {
        router.push('/orderHistory');
    };

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
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 py-16 max-w-3xl"
        >
            <Card className="p-8 text-center">
                <motion.div variants={itemVariants} className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Thanh toán thành công!</h1>
                    <p className="text-muted-foreground">
                        Cảm ơn bạn đã đặt hàng. Thanh toán của bạn đã được xử lý thành công.
                    </p>
                </motion.div>

                {orderDetails && (
                    <motion.div variants={itemVariants} className="mb-8">
                        <div className="bg-muted/30 p-4 rounded-lg inline-block">
                            <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                            <p className="font-mono font-medium">{orderDetails.orderInfo.orderCode}</p>
                        </div>
                    </motion.div>
                )}

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={handleContinueShopping}
                        className="flex items-center justify-center"
                        size="lg"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Tiếp tục mua sắm
                    </Button>
                    <Button
                        onClick={handleViewOrders}
                        variant="outline"
                        className="flex items-center justify-center"
                        size="lg"
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Xem đơn hàng
                    </Button>
                </motion.div>
            </Card>
        </motion.div>
    );
};

export default PaymentSuccessPage; 