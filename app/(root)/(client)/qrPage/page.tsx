'use client'
import * as React from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { MapPin, Clock, CreditCard, Navigation } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// You'll need to install this package:
// npm install @googlemaps/js-api-loader
import { Loader } from '@googlemaps/js-api-loader';

const BAKERY_ADDRESS = "123 Bakery St, City, Country"; // Replace with actual bakery address
const BAKERY_COORDINATES = { lat: 0, lng: 0 }; // Replace with actual coordinates

const QRPage = () => {
    const searchParams = useSearchParams();
    const [distance, setDistance] = React.useState<number>(0);
    const [duration, setDuration] = React.useState<string>('');
    const [shippingFee, setShippingFee] = React.useState<number>(0);

    const orderDetails = {
        orderId: searchParams.get('orderId'),
        customerAddress: searchParams.get('address'),
        subtotal: parseFloat(searchParams.get('subtotal') || '0'),
        deliveryMethod: searchParams.get('deliveryMethod'),
    };

    // Calculate shipping fee based on distance
    const calculateShippingFee = (distanceInKm: number, isExpress: boolean) => {
        const baseRate = 5.99;
        const ratePerKm = 0.5;
        const expressFactor = isExpress ? 2 : 1;
        return (baseRate + distanceInKm * ratePerKm) * expressFactor;
    };

    // Calculate distance between bakery and customer
    React.useEffect(() => {
        const calculateDistance = async () => {
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
                version: "weekly",
            });

            try {
                const google = await loader.load();
                const service = new google.maps.DistanceMatrixService();

                const result = await service.getDistanceMatrix({
                    origins: [BAKERY_ADDRESS],
                    destinations: [orderDetails.customerAddress!],
                    travelMode: google.maps.TravelMode.DRIVING,
                });

                if (result.rows[0]?.elements[0]?.distance) {
                    const distanceInKm = result.rows[0].elements[0].distance.value / 1000;
                    const duration = result.rows[0].elements[0].duration.text;

                    setDistance(distanceInKm);
                    setDuration(duration);
                    setShippingFee(
                        calculateShippingFee(
                            distanceInKm,
                            orderDetails.deliveryMethod === 'express'
                        )
                    );
                }
            } catch (error) {
                console.error('Error calculating distance:', error);
            }
        };

        if (orderDetails.customerAddress) {
            calculateDistance();
        }
    }, [orderDetails.customerAddress, orderDetails.deliveryMethod]);

    const total = orderDetails.subtotal + shippingFee;

    // Generate payment data for QR code
    const paymentData = {
        orderId: orderDetails.orderId,
        amount: total,
        currency: 'USD',
        merchantId: 'BAKERY_ID', // Replace with actual merchant ID
        timestamp: new Date().toISOString(),
    };

    return (
        <motion.div
            className="container mx-auto px-4 py-8 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="p-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Order Payment</h1>
                    <p className="text-muted-foreground">
                        Scan the QR code to complete your payment
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* QR Code Section */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                            <QRCode
                                value={JSON.stringify(paymentData)}
                                size={200}
                                level="H"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Order ID: {orderDetails.orderId}
                        </p>
                    </div>

                    {/* Order Details Section */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Delivery Address</p>
                                        <p className="text-sm text-muted-foreground">
                                            {orderDetails.customerAddress}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Navigation className="w-5 h-5 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Distance</p>
                                        <p className="text-sm text-muted-foreground">
                                            {distance.toFixed(1)} km
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Estimated Delivery Time</p>
                                        <p className="text-sm text-muted-foreground">
                                            {duration}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${orderDetails.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping Fee</span>
                                    <span>${shippingFee.toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-5 h-5" />
                                <span className="font-medium">Payment Instructions</span>
                            </div>
                            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                                <li>Open your mobile banking app</li>
                                <li>Scan the QR code</li>
                                <li>Verify the payment details</li>
                                <li>Confirm the payment</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default QRPage; 