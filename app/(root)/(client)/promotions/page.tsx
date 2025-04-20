'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import Image from 'next/image';
import { decodeJWT } from '@/lib/utils';

interface Voucher {
  id: string;
  code: string;
  discount_percentage: number;
  min_order_amount: number;
  max_discount_amount: number;
  expiration_date: string;
  description: string;
  voucher_type: string;
  bakery: {
    bakery_name: string;
    shop_image_files: Array<{
      file_url: string;
    }>;
  };
}

interface PrivateVoucher {
  id: string;
  voucher: Voucher;
  is_applied: boolean;
  created_at: string;
}

export default function PromotionsPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [privateVouchers, setPrivateVouchers] = useState<PrivateVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        // Fetch public vouchers
        console.log('Fetching public vouchers...');
        const publicResponse = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/vouchers');
        const publicData = await publicResponse.json();
        console.log('Public Vouchers API Response:', {
          status: publicResponse.status,
          statusText: publicResponse.statusText,
          data: publicData
        });
        setVouchers(publicData.payload);

        // Fetch private vouchers if user is logged in
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log('Access token found, attempting to fetch private vouchers...');
          const decodedToken = decodeJWT(accessToken);
          console.log('Decoded token:', decodedToken);

          if (decodedToken?.id) {
            console.log('Customer ID found:', decodedToken.id);
            const privateResponse = await fetch(
              `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/customers/${decodedToken.id}/vouchers?pageIndex=0&pageSize=10`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'accept': '*/*'
                }
              }
            );
            const privateData = await privateResponse.json();
            console.log('Private Vouchers API Response:', {
              status: privateResponse.status,
              statusText: privateResponse.statusText,
              data: privateData
            });

            if (privateData.status_code === 200) {
              console.log('Private vouchers fetched successfully:', privateData.payload);
              setPrivateVouchers(privateData.payload);
            } else {
              console.error('Error fetching private vouchers:', privateData);
            }
          } else {
            console.log('No customer ID found in decoded token');
          }
        } else {
          console.log('No access token found in localStorage');
        }
      } catch (error) {
        console.error('Error in fetchVouchers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-center mb-12 text-primary">
        Phiếu Quà Tặng
      </h1>

      {/* Private Vouchers Section */}
      {privateVouchers.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Phiếu Quà Tặng Của Bạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {privateVouchers.map((privateVoucher) => (
              <div
                key={privateVoucher.id}
                className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Ticket-style notches */}
                <div className="absolute left-0 top-0 w-full h-full flex justify-between pointer-events-none">
                  <div className="flex flex-col justify-between">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-gray-50 rounded-full" />
                    ))}
                  </div>
                  <div className="flex flex-col justify-between">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-gray-50 rounded-full" />
                    ))}
                  </div>
                </div>

                <div className="flex flex-row">
                  {/* Left section with discount and image */}
                  <div className="w-1/3 relative overflow-hidden">
                    {/* Bakery Image */}
                    <div className="absolute inset-0">
                      <Image
                        src={privateVoucher.voucher.bakery?.shop_image_files?.[0]?.file_url || '/placeholder-bakery.jpg'}
                        alt={privateVoucher.voucher.bakery?.bakery_name || 'Bakery'}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/60" />
                    </div>

                    {/* Discount overlay */}
                    <div className="relative p-6 h-full flex items-center justify-center">
                      <div className="text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                          {/* Colorful background blur effect */}
                          <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg blur-xl opacity-75 group-hover:animate-pulse"></div>

                          {/* Main discount text */}
                          <div className="relative">
                            <div className="text-6xl font-extrabold mb-2">
                              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500 text-transparent bg-clip-text animate-[gradient_3s_ease-in-out_infinite] bg-[length:200%_200%]">
                                {privateVoucher.voucher.discount_percentage}%
                              </span>
                            </div>
                            <div className="text-2xl font-bold">
                              <span className="bg-gradient-to-r from-white via-gray-100 to-white text-transparent bg-clip-text animate-[gradient_3s_ease-in-out_infinite] bg-[length:200%_200%]">
                                GIẢM
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right section with details */}
                  <div className="w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {privateVoucher.voucher.bakery?.bakery_name || 'Unknown Bakery'}
                      </h3>
                      <Badge
                        variant={privateVoucher.voucher.voucher_type === 'GLOBAL' ? 'default' : 'secondary'}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-colors"
                      >
                        {privateVoucher.voucher.voucher_type === 'GLOBAL' ? 'TOÀN HỆ THỐNG' : 'TIỆM BÁNH'}
                      </Badge>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm font-medium text-gray-600">Mã:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-3 py-1 rounded-md bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-primary">
                            {privateVoucher.voucher.code}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(privateVoucher.voucher.code)}
                            className="h-6 w-6 hover:bg-primary/10"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm text-gray-600">Đơn tối thiểu:</span>
                        <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                          {privateVoucher.voucher.min_order_amount.toLocaleString()} VND
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm text-gray-600">Giảm tối đa:</span>
                        <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                          {privateVoucher.voucher.max_discount_amount.toLocaleString()} VND
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Có hiệu lực đến:</span>
                        <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                          {format(new Date(privateVoucher.voucher.expiration_date), 'dd/MM/yyyy')}
                        </span>
                      </div>

                      {privateVoucher.voucher.description && (
                        <div className="mt-4 text-sm text-gray-500 bg-gradient-to-r from-pink-500/5 to-purple-500/5 p-3 rounded-md">
                          {privateVoucher.voucher.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Vouchers Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-primary">Phiếu Quà Tặng Có Sẵn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Ticket-style notches */}
              <div className="absolute left-0 top-0 w-full h-full flex justify-between pointer-events-none">
                <div className="flex flex-col justify-between">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-gray-50 rounded-full" />
                  ))}
                </div>
                <div className="flex flex-col justify-between">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-gray-50 rounded-full" />
                  ))}
                </div>
              </div>

              <div className="flex flex-row">
                {/* Left section with discount and image */}
                <div className="w-1/3 relative overflow-hidden">
                  {/* Bakery Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={voucher.bakery?.shop_image_files?.[0]?.file_url || '/placeholder-bakery.jpg'}
                      alt={voucher.bakery?.bakery_name || 'Bakery'}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/60" />
                  </div>

                  {/* Discount overlay */}
                  <div className="relative p-6 h-full flex items-center justify-center">
                    <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <div className="relative">
                        {/* Colorful background blur effect */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg blur-xl opacity-75 group-hover:animate-pulse"></div>

                        {/* Main discount text */}
                        <div className="relative">
                          <div className="text-6xl font-extrabold mb-2">
                            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500 text-transparent bg-clip-text animate-[gradient_3s_ease-in-out_infinite] bg-[length:200%_200%]">
                              {voucher.discount_percentage}%
                            </span>
                          </div>
                          <div className="text-2xl font-bold">
                            <span className="bg-gradient-to-r from-white via-gray-100 to-white text-transparent bg-clip-text animate-[gradient_3s_ease-in-out_infinite] bg-[length:200%_200%]">
                              GIẢM
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right section with details */}
                <div className="w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {voucher.bakery?.bakery_name || 'Unknown Bakery'}
                    </h3>
                    <Badge
                      variant={voucher.voucher_type === 'GLOBAL' ? 'default' : 'secondary'}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-colors"
                    >
                      {voucher.voucher_type === 'GLOBAL' ? 'TOÀN HỆ THỐNG' : 'TIỆM BÁNH'}
                    </Badge>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2">
                      <span className="text-sm font-medium text-gray-600">Mã:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-3 py-1 rounded-md bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-primary">
                          {voucher.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(voucher.code)}
                          className="h-6 w-6 hover:bg-primary/10"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2">
                      <span className="text-sm text-gray-600">Đơn tối thiểu:</span>
                      <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        {voucher.min_order_amount.toLocaleString()} VND
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2">
                      <span className="text-sm text-gray-600">Giảm tối đa:</span>
                      <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        {voucher.max_discount_amount.toLocaleString()} VND
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Có hiệu lực đến:</span>
                      <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        {format(new Date(voucher.expiration_date), 'dd/MM/yyyy')}
                      </span>
                    </div>

                    {voucher.description && (
                      <div className="mt-4 text-sm text-gray-500 bg-gradient-to-r from-pink-500/5 to-purple-500/5 p-3 rounded-md">
                        {voucher.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
