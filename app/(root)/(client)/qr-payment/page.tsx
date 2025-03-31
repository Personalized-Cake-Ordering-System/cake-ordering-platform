'use client'

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, PackageCheck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function QRPaymentPage() {
    const searchParams = useSearchParams();
    const qrLink = searchParams.get('qrLink');
    const orderCode = searchParams.get('orderCode');
    const amount = searchParams.get('amount');
    const orderDetails = searchParams.get('orderDetails') ? JSON.parse(decodeURIComponent(searchParams.get('orderDetails')!)) : null;

    if (!qrLink || !orderDetails) {
        return <div>Invalid QR payment page</div>;
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-8 max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Order Status Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                    className="inline-flex rounded-full bg-green-100 p-6 dark:bg-green-900 mb-4"
                >
                    <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-muted-foreground">Order Code: {orderCode}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* QR Code Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-primary" />
                            Scan QR to Pay
                        </h2>
                        <div className="relative aspect-square w-full max-w-[300px] mx-auto mb-6 shadow-lg rounded-lg overflow-hidden">
                            <Image
                                src={qrLink}
                                alt="Payment QR Code"
                                width={500}
                                height={500}
                                priority={true}
                                className="w-full h-full object-contain"
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg font-semibold text-muted-foreground">Amount to Pay:</p>
                            <p className="text-3xl font-bold text-primary">
                                ${Number(amount).toLocaleString()}
                            </p>
                        </div>
                    </Card>
                </motion.div>

                {/* Order Details Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <PackageCheck className="mr-2 h-5 w-5 text-primary" />
                            Order Details
                        </h2>

                        <div className="space-y-6">
                            {/* Delivery Information */}
                            <div>
                                <h3 className="font-medium mb-2 text-muted-foreground">Delivery Information</h3>
                                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                                    <p className="font-medium">{orderDetails.customerName}</p>
                                    <p className="text-sm text-muted-foreground">{orderDetails.address}</p>
                                    <p className="text-sm text-muted-foreground">{orderDetails.email}</p>
                                    <p className="text-sm text-muted-foreground">{orderDetails.phone}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Order Items */}
                            <div>
                                <h3 className="font-medium mb-3 text-muted-foreground">Order Items</h3>
                                <div className="space-y-3">
                                    {orderDetails.items.map((item: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium">
                                                    {item.quantity}x Custom {item.config.size} Cake
                                                </span>
                                            </div>
                                            <span className="font-medium">
                                                ${(item.config.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Order Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${orderDetails.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>${orderDetails.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span>${orderDetails.deliveryFee.toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>${orderDetails.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Badge variant={orderDetails.deliveryMethod === 'express' ? 'default' : 'outline'}>
                                    {orderDetails.deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
                className="mt-8 flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Button asChild variant="outline">
                    <Link href="/cakes">Continue Shopping</Link>
                </Button>
                <Button asChild>
                    <Link href="/">Return to Home</Link>
                </Button>
            </motion.div>
        </motion.div>
    );
} 