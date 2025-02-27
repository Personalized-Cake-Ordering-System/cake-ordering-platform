"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Store,
} from "lucide-react";

import {
  categoryData,
  featuredStores,
  popularProducts,
} from "@/components/shared/client/home/data";
import { StoreItem } from "@/components/shared/client/home/store-item";
import { CakeItem } from "@/components/shared/client/home/cake-item";
import { CategoryItem } from "@/components/shared/client/home/category-item";
import MainBanner from "@/components/shared/client/home/main-banner";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Main Banner */}
          <div className="md:col-span-2 relative overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <MainBanner />
          </div>

          {/* Side Cards */}
          <div className="space-y-6 flex flex-col h-full">
            {/* Bánh Mì Phương Card */}
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 flex-1">
              <CardContent className="p-0 h-full">
                <div className="bg-custom-pink/30 dark:bg-custom-pink/30 p-6 flex items-center justify-between h-full">
                  <div className="w-1/2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Bánh Mì Phương
                    </h3>
                    <div className="text-sm text-yellow-600 mt-1 font-medium">
                      ★★★★★ 300+ đánh giá
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      Bánh mì thơm ngon
                    </p>
                    <p className="text-xl text-custom-teal dark:text-custom-teal font-semibold mt-4">
                      15.000đ
                    </p>
                    <Button
                      variant="link"
                      className="text-gray-900 dark:text-gray-200 font-semibold hover:text-custom-teal dark:hover:text-custom-teal p-0 mt-3"
                    >
                      XEM CỬA HÀNG →
                    </Button>
                  </div>
                  <div className="w-1/2 flex justify-center items-center">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 shadow-lg rounded-lg">
                      <Image
                        src="https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D"
                        alt="Bánh mì Phương"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sweet Bakery Card */}
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 flex-1">
              <CardContent className="p-0 h-full">
                <div className="bg-custom-teal/30 dark:bg-custom-teal/30 p-6 flex items-center justify-between h-full">
                  <div className="w-1/2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Sweet Bakery
                    </h3>
                    <div className="text-sm bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-1 rounded-full inline-block mt-1 font-medium">
                      Mới mở cửa
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      Bánh cupcake và bánh ngọt
                    </p>
                    <p className="text-xl text-custom-pink dark:text-custom-pink font-semibold mt-4">
                      25.000đ
                    </p>
                    <Button
                      variant="link"
                      className="text-gray-900 dark:text-gray-200 font-semibold hover:text-custom-pink dark:hover:text-custom-pink p-0 mt-3"
                    >
                      XEM CỬA HÀNG →
                    </Button>
                  </div>
                  <div className="w-1/2 flex justify-center items-center">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 shadow-lg rounded-lg">
                      <Image
                        src="https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D"
                        alt="Sweet Bakery"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Category Section */}
        <div className="mb-12 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Cửa hàng nổi bật
              </h2>
              <p className="text-gray-700 dark:text-gray-400">
                Khám phá các cửa hàng bánh chất lượng nhất tại Việt Nam
              </p>
            </div>
            <Button className="bg-custom-teal hover:bg-custom-pink text-white transition-colors duration-300 shadow-md">
              XEM TẤT CẢ
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {featuredStores.map((store) => (
              <StoreItem
                key={store.id}
                icon={
                  <div className="bg-custom-pink/30 dark:bg-custom-pink/30 p-3 rounded-full">
                    <Store className="h-6 w-6 text-custom-teal dark:text-custom-teal" />
                  </div>
                }
                name={store.name}
                rating={store.rating}
                speciality={store.speciality}
              />
            ))}
          </div>
        </div>

        {/* Popular Products Section */}
        <div className="mb-12 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Bánh bán chạy
              </h2>
              <p className="text-gray-700 dark:text-gray-400">
                Đừng bỏ lỡ các ưu đãi đặc biệt đến hết tháng 2.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-custom-pink/20 hover:border-custom-pink dark:hover:bg-custom-pink/20 dark:hover:border-custom-pink transition-colors duration-300 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5 text-custom-teal dark:text-custom-teal" />
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-custom-pink/20 hover:border-custom-pink dark:hover:bg-custom-pink/20 dark:hover:border-custom-pink transition-colors duration-300 shadow-sm"
              >
                <ChevronRight className="h-5 w-5 text-custom-teal dark:text-custom-teal" />
              </Button>
            </div>
          </div>

          {/* Product Filter Tabs */}
          <div className="flex items-center space-x-6 mb-6 overflow-x-auto pb-2">
            {[
              "TẤT CẢ",
              "BÁNH KEM",
              "BÁNH MÌ",
              "BÁNH NGỌT",
              "BÁNH MẶN",
              "BÁNH TRUNG THU",
              "BÁNH CHAY",
              "BÁNH THEO MÙA",
            ].map((category, index) => (
              <button
                key={category}
                className={`font-medium pb-2 whitespace-nowrap ${
                  index === 0
                    ? "text-custom-teal dark:text-custom-teal border-b-2 border-custom-teal dark:border-custom-teal"
                    : "text-gray-700 dark:text-gray-400 hover:text-custom-pink dark:hover:text-custom-pink transition-colors duration-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {popularProducts.map((product) => (
              <CakeItem
                key={product.id}
                discount={product.discount}
                imageUrl={product.imageUrl}
                title={product.title}
                store={product.store}
                price={product.price}
              />
            ))}
          </div>
        </div>

        {/* Store Categories Section */}
        <div className="mb-12 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Khám phá theo loại bánh
              </h2>
              <p className="text-gray-700 dark:text-gray-400">
                Tìm bánh theo sở thích và nhu cầu của bạn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryData.map((category) => (
              <CategoryItem
                key={category.id}
                title={category.title}
                storeCount={category.storeCount}
                imageUrl={category.imageUrl}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
