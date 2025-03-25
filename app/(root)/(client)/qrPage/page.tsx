'use client'
import * as React from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { MapPin, Clock, CreditCard, Navigation } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { Loader } from '@googlemaps/js-api-loader';

const BAKERY_ADDRESS = "91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội";
const GOONG_API_KEY = "2R2HQynx7ypczZZcxS1w7uuJaxXIGoeXymvGGx0u";

type GeocodingResponse = {
  status: string;
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      }
    },
    formatted_address: string;
  }>;
};

type DistanceResponse = {
  status: string;
  rows: Array<{
    elements: Array<{
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      status: string;
    }>;
  }>;
};

const QRPage = () => {
  const searchParams = useSearchParams();
  const [distance, setDistance] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<string>('');
  const [shippingFee, setShippingFee] = React.useState<number>(0);

  const orderDetails = {
    orderId: searchParams.get('orderId'),
    customerAddress: searchParams.get('address'),
    customerName: searchParams.get('customerName'),
    customerEmail: searchParams.get('customerEmail'),
    customerPhone: searchParams.get('customerPhone'),
    lat: parseFloat(searchParams.get('lat') || '0'),
    lng: parseFloat(searchParams.get('lng') || '0'),
    subtotal: parseFloat(searchParams.get('subtotal') || '0'),
    deliveryMethod: searchParams.get('deliveryMethod'),
  };

  React.useEffect(() => {
    // Calculate distance using coordinates
    const calculateDistance = async () => {
      try {
        console.log('Calculating distance with coordinates:', orderDetails.lat, orderDetails.lng);
        const response = await fetch(
          `https://rsapi.goong.io/DistanceMatrix?origins=${BAKERY_ADDRESS}&destinations=${orderDetails.lat},${orderDetails.lng}&vehicle=car&api_key=${GOONG_API_KEY}`
        );

        const data: DistanceResponse = await response.json();
        console.log('API response:', data);

        if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
          const element = data.rows[0].elements[0];
          return {
            distance: element.distance,
            duration: element.duration
          };
        }
        throw new Error('Failed to calculate distance');
      } catch (error) {
        console.error('Error calculating distance:', error);
        throw error;
      }
    };

    const getDistance = async () => {
      try {
        const result = await calculateDistance();
        if (result) {
          setDistance(result.distance.value / 1000);
          setDuration(result.duration.text);
        }
      } catch (error) {
        console.error('Failed to get distance:', error);
      }
    };

    if (orderDetails.lat && orderDetails.lng) {
      getDistance();
    }
  }, [orderDetails.lat, orderDetails.lng]);

  // Calculate shipping fee based on distance
  const calculateShippingFee = (distanceInKm: number, isExpress: boolean) => {
    const baseRate = 5.99;
    const ratePerKm = 0.5;
    const expressFactor = isExpress ? 2 : 1;
    return (baseRate + distanceInKm * ratePerKm) * expressFactor;
  };

  const shippingFeeCalculated = calculateShippingFee(distance, orderDetails.deliveryMethod === 'express');
  const total = orderDetails.subtotal + shippingFeeCalculated;

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
      className="container mx-auto px-4 py-8 max-w-3xl bg-gray-50 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue-600">Order Payment</h1>
          <p className="text-muted-foreground">
            Scan the QR code to complete your payment
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* QR Code Section */}
          <div className="flex-1 flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4 border border-gray-200">
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
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Delivery Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 text-blue-600" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">
                      {orderDetails.customerAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 mt-1 text-blue-600" />
                  <div>
                    <p className="font-medium">Distance</p>
                    <p className="text-sm text-muted-foreground font-bold">
                      {distance.toFixed(1)} km
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-1 text-blue-600" />
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
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Payment Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span>${shippingFeeCalculated.toFixed(2)}</span>
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
                <CreditCard className="w-5 h-5 text-blue-600" />
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