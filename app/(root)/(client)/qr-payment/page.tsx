'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Copy, CheckCircle, Clock, Loader2 } from 'lucide-react';

const LoadingQR = () => (
    <div className="w-[300px] h-[300px] mx-auto flex items-center justify-center bg-muted/10 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
);

const QRPaymentPage = () => {
    const router = useRouter();
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
    const [isLoading, setIsLoading] = useState(true);

    // Add VND currency formatter
    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Add animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    useEffect(() => {
        // Get order details from localStorage
        const savedOrder = localStorage.getItem('currentOrder');
        if (savedOrder) {
            setOrderDetails(JSON.parse(savedOrder));
        }

        // Set up countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleBackToCheckout = () => {
        router.push('/checkout');
    };

    const copyOrderCode = () => {
        if (orderDetails?.orderInfo.orderCode) {
            navigator.clipboard.writeText(orderDetails.orderInfo.orderCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!orderDetails) return null;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 py-8 max-w-7xl"
        >
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Button
                    variant="ghost"
                    onClick={handleBackToCheckout}
                    className="mb-6 flex items-center hover:scale-105 transition-transform"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Checkout
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code Section */}
                <motion.div variants={cardVariants}>
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                            >
                                Scan to Pay
                            </motion.h2>
                            <motion.div
                                className="relative w-[300px] h-[300px] mx-auto mb-6 bg-white p-4 rounded-lg shadow-sm"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {isLoading && <LoadingQR />}
                                <Image
                                    src={orderDetails.qrLink}
                                    alt="VietQR Payment Code"
                                    fill
                                    className={`object-contain ${isLoading ? 'hidden' : ''}`}
                                    onLoadingComplete={() => setIsLoading(false)}
                                    onError={(e) => {
                                        console.error('QR image failed to load:', e);
                                        setIsLoading(false);
                                    }}
                                    priority
                                />
                            </motion.div>

                            <motion.div
                                className="flex items-center justify-center space-x-4 mb-6"
                                animate={{ scale: countdown < 300 ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 0.5, repeat: countdown < 300 ? Infinity : 0, repeatType: "reverse" }}
                            >
                                <Clock className={`h-5 w-5 ${countdown < 300 ? 'text-red-500' : 'text-yellow-500'}`} />
                                <span className={`font-medium ${countdown < 300 ? 'text-red-500' : ''}`}>
                                    Payment expires in {formatTime(countdown)}
                                </span>
                            </motion.div>

                            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Order Code:</span>
                                    <div className="flex items-center">
                                        <span className="font-mono mr-2">{orderDetails.orderInfo.orderCode}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={copyOrderCode}
                                            className="h-8 w-8 p-0"
                                        >
                                            {copied ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Amount:</span>
                                    <span className="font-bold text-lg">
                                        {formatVND(orderDetails.orderInfo.total)}
                                    </span>
                                </div>

                                <div className="text-sm text-muted-foreground mt-4">
                                    <p>1. Open your banking app</p>
                                    <p>2. Select &quot;Scan QR&quot;</p>
                                    <p>3. Scan this VietQR code</p>
                                    <p>4. Confirm the payment</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Order Details Section */}
                <motion.div variants={cardVariants}>
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                        >
                            Order Details
                        </motion.h2>

                        <div className="space-y-6">
                            {/* Customer Information */}
                            <div>
                                <h3 className="font-semibold mb-2">Customer Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-muted-foreground">Name:</span> {orderDetails.customerInfo.fullName}</p>
                                    <p><span className="text-muted-foreground">Email:</span> {orderDetails.customerInfo.email}</p>
                                    <p><span className="text-muted-foreground">Phone:</span> {orderDetails.customerInfo.phone}</p>
                                    <p><span className="text-muted-foreground">Address:</span> {orderDetails.customerInfo.address}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold mb-4">Order Items</h3>
                                <div className="space-y-4">
                                    {orderDetails.orderInfo.items.map((item: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-4">
                                            <div className="relative h-16 w-16 flex-shrink-0">
                                                {item.main_image?.file_url ? (
                                                    <Image
                                                        src={item.main_image.file_url}
                                                        alt={item.cake_name}
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-muted rounded-md" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.cake_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.cake_note || 'No special notes'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatVND(item.sub_total_price)}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Order Summary */}
                            <div>
                                <h3 className="font-semibold mb-4">Order Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatVND(orderDetails.orderInfo.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>{formatVND(orderDetails.orderInfo.tax)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {orderDetails.orderInfo.deliveryMethod === 'express' ? 'Express' : 'Standard'} Delivery
                                        </span>
                                        <span>{formatVND(orderDetails.orderInfo.deliveryFee)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>{formatVND(orderDetails.orderInfo.total)}</span>
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

export default QRPaymentPage; 