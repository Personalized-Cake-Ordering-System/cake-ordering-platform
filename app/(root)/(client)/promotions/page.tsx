'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles } from "lucide-react";
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
  const [privateVouchers, setPrivateVouchers] = useState<PrivateVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const decodedToken = decodeJWT(accessToken);
          if (decodedToken?.id) {
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
            if (privateData.status_code === 200) {
              setPrivateVouchers(privateData.payload);
            }
          }
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
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-rose-50">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 opacity-70 blur"></div>
          <div className="relative animate-spin rounded-full h-14 w-14 border-4 border-t-transparent border-violet-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 pb-16">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="relative mb-16 text-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1 w-full max-w-[400px] bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
          </div>
          <div className="relative inline-block bg-white px-8 py-3 rounded-full shadow-md">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-8 h-8" />
                Ưu Đãi Hấp Dẫn
                <Sparkles className="w-8 h-8" />
              </span>
            </h1>
          </div>
        </div>

        {/* Private Vouchers Section */}
        {privateVouchers.length > 0 && (
          <div className="mb-16">
            <div className="mb-8 flex items-center">
              <div className="h-1 w-6 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Voucher Của Bạn
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {privateVouchers.map((privateVoucher) => (
                <div
                  key={privateVoucher.id}
                  className="group bg-white backdrop-blur-sm bg-opacity-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:translate-y-[-4px]"
                >
                  <div className="relative flex flex-col md:flex-row">
                    {/* Dashed separator line */}
                    <div className="absolute left-0 md:left-1/3 top-full md:top-0 w-full md:w-0.5 h-0.5 md:h-full flex md:flex-col items-center justify-center overflow-hidden">
                      <div className="w-full md:w-0.5 h-full md:h-full relative">
                        <div className="absolute inset-0 flex flex-col md:items-center justify-evenly -space-y-2">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className="h-2 w-2 md:h-2 md:w-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Left Section */}
                    <div className="w-full md:w-1/3 p-5 relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500">
                      <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
                      
                      <div className="relative h-full flex flex-col justify-between">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-white/90 truncate">
                            {privateVoucher.voucher.bakery?.bakery_name || 'Tiệm Bánh'}
                          </h3>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-white/20 text-white border-none hover:bg-white/30"
                          >
                            {privateVoucher.voucher.voucher_type === 'GLOBAL' ? 'TOÀN HỆ THỐNG' : 'TIỆM BÁNH'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-center flex-1">
                          <div className="text-center">
                            <div className="relative inline-block">
                              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                              <div className="relative">
                                <div className="text-7xl font-black text-white mb-0">
                                  {privateVoucher.voucher.discount_percentage}
                                  <span className="text-3xl align-top font-bold">%</span>
                                </div>
                                <div className="text-xl font-bold text-white/90 uppercase tracking-widest">
                                  Giảm Giá
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-white/80 font-medium">
                          Hiệu lực đến: {format(new Date(privateVoucher.voucher.expiration_date), 'dd/MM/yyyy')}
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Mã Voucher:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-100">
                              {privateVoucher.voucher.code}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(privateVoucher.voucher.code)}
                              className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700"
                            >
                              {copiedCode === privateVoucher.voucher.code ? 
                                <Check className="h-4 w-4" /> : 
                                <Copy className="h-4 w-4" />
                              }
                            </Button>
                          </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Đơn tối thiểu:</span>
                          <span className="text-sm font-bold text-purple-700">
                            {privateVoucher.voucher.min_order_amount.toLocaleString()} VND
                          </span>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Giảm tối đa:</span>
                          <span className="text-sm font-bold text-purple-700">
                            {privateVoucher.voucher.max_discount_amount.toLocaleString()} VND
                          </span>
                        </div>

                        {privateVoucher.voucher.description && (
                          <div className="mt-3 p-3 text-sm text-gray-600 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
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
      </div>
    </div>
  );
}
