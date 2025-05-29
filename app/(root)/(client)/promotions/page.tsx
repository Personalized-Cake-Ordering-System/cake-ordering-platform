'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles, Filter, ChevronLeft, ChevronRight, TicketCheck, Ticket } from "lucide-react";
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

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  page_size: number;
}

export default function PromotionsPage() {
  const [privateVouchers, setPrivateVouchers] = useState<PrivateVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterApplied, setFilterApplied] = useState<boolean | null>(false); // false = unused, true = used, null = all
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const pageSize = 6;

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const decodedToken = decodeJWT(accessToken);
          if (decodedToken?.id) {
            let url = `https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/customers/${decodedToken.id}/vouchers?pageIndex=${currentPage}&pageSize=${pageSize}`;
            
            if (filterApplied !== null) {
              url += `&isApplied=${filterApplied}`;
            }

            const privateResponse = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'accept': '*/*'
              }
            });
            const privateData = await privateResponse.json();
            if (privateData.status_code === 200) {
              setPrivateVouchers(privateData.payload || []);
              setPagination(privateData.pagination || null);
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
  }, [currentPage, filterApplied]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFilterChange = (applied: boolean | null) => {
    setFilterApplied(applied);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getEmptyStateMessage = () => {
    if (filterApplied === false) {
      return "Bạn không còn khuyến mãi nào sử dụng được.";
    } else if (filterApplied === true) {
      return "Chưa có khuyến mãi nào được sử dụng.";
    }
    return "Không có voucher nào.";
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

        {/* Filter Section */}
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Bộ lọc voucher</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterApplied === null ? "default" : "outline"}
                  onClick={() => handleFilterChange(null)}
                  className={`${
                    filterApplied === null
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                      : "border-purple-200 text-purple-700 hover:bg-purple-50"
                  } transition-all duration-200`}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Tất cả
                </Button>
                <Button
                  variant={filterApplied === false ? "default" : "outline"}
                  onClick={() => handleFilterChange(false)}
                  className={`${
                    filterApplied === false
                      ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white"
                      : "border-green-200 text-green-700 hover:bg-green-50"
                  } transition-all duration-200`}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Chưa sử dụng
                </Button>
                <Button
                  variant={filterApplied === true ? "default" : "outline"}
                  onClick={() => handleFilterChange(true)}
                  className={`${
                    filterApplied === true
                      ? "bg-gradient-to-r from-gray-600 to-slate-500 text-white"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  } transition-all duration-200`}
                >
                  <TicketCheck className="w-4 h-4 mr-2" />
                  Đã sử dụng
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Vouchers Section */}
        <div className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-1 w-6 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {filterApplied === null ? "Tất cả voucher" : 
                 filterApplied === false ? "Voucher chưa sử dụng" : "Voucher đã sử dụng"}
              </h2>
            </div>
            {pagination && (
              <div className="text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
                {pagination.total_items} voucher
              </div>
            )}
          </div>

          {privateVouchers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {privateVouchers.map((privateVoucher) => (
                <div
                  key={privateVoucher.id}
                  className={`group bg-white backdrop-blur-sm bg-opacity-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:translate-y-[-4px] ${
                    privateVoucher.is_applied ? 'opacity-75 border-2 border-gray-300' : 'border-2 border-transparent'
                  }`}
                >
                  <div className="relative flex flex-col md:flex-row">
                    {/* Status Badge */}
                    {privateVoucher.is_applied && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gray-500 text-white">
                          <TicketCheck className="w-3 h-3 mr-1" />
                          Đã sử dụng
                        </Badge>
                      </div>
                    )}

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
                    <div className={`w-full md:w-1/3 p-5 relative overflow-hidden ${
                      privateVoucher.is_applied 
                        ? 'bg-gradient-to-br from-gray-500 to-gray-600' 
                        : 'bg-gradient-to-br from-purple-600 to-pink-500'
                    }`}>
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
                            <span className={`font-mono text-sm font-bold px-3 py-1.5 rounded-md border ${
                              privateVoucher.is_applied
                                ? 'bg-gray-50 text-gray-500 border-gray-200'
                                : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-100'
                            }`}>
                              {privateVoucher.voucher.code}
                            </span>
                            {!privateVoucher.is_applied && (
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
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Đơn tối thiểu:</span>
                          <span className={`text-sm font-bold ${
                            privateVoucher.is_applied ? 'text-gray-500' : 'text-purple-700'
                          }`}>
                            {privateVoucher.voucher.min_order_amount.toLocaleString()} VND
                          </span>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Giảm tối đa:</span>
                          <span className={`text-sm font-bold ${
                            privateVoucher.is_applied ? 'text-gray-500' : 'text-purple-700'
                          }`}>
                            {privateVoucher.voucher.max_discount_amount.toLocaleString()} VND
                          </span>
                        </div>

                        {privateVoucher.voucher.description && (
                          <div className={`mt-3 p-3 text-sm rounded-lg border ${
                            privateVoucher.is_applied
                              ? 'text-gray-500 bg-gray-50 border-gray-200'
                              : 'text-gray-600 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
                          }`}>
                            {privateVoucher.voucher.description}
                          </div>
                        )}

                        {privateVoucher.is_applied && (
                          <div className="mt-3 p-3 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                            <TicketCheck className="w-4 h-4" />
                            Đã sử dụng vào: {format(new Date(privateVoucher.created_at), 'dd/MM/yyyy HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-white rounded-full p-8 shadow-lg">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có voucher</h3>
                  <p className="text-gray-500">{getEmptyStateMessage()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="h-10 w-10 rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.total_pages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(i)}
                        className={`h-10 w-10 rounded-full ${
                          currentPage === i
                            ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                            : "border-purple-200 text-purple-700 hover:bg-purple-50"
                        }`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.total_pages - 1}
                    className="h-10 w-10 rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center mt-3 text-sm text-gray-600">
                  Trang {currentPage + 1} / {pagination.total_pages} 
                  <span className="mx-2">•</span>
                  {pagination.total_items} voucher
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
