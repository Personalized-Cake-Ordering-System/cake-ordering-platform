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

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Main Banner */}
          <div className="md:col-span-2 relative overflow-hidden rounded-lg">
            <div className="relative h-96 bg-gradient-pink dark:bg-gradient-pink rounded-lg overflow-hidden shadow-md">
              <div className="absolute inset-0 flex">
                <div className="w-1/2 h-full relative flex justify-center items-center">
                  <Image
                    src="/api/placeholder/500/700"
                    alt="Bánh Sinh Nhật Hoa Hồng - Tiệm Bánh Hạnh Phúc"
                    width={500}
                    height={700}
                    className="object-contain h-full"
                  />
                </div>
                <div className="w-1/2 h-full p-10 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      Cửa hàng nổi bật tháng 2
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                    Tiệm Bánh Hạnh Phúc
                  </h2>
                  <div className="mb-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      Chuyên bánh kem sinh nhật và bánh cưới
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="text-gray-600 dark:text-gray-400">
                      Giá chỉ từ
                    </span>
                    <span className="text-3xl font-semibold text-custom-teal dark:text-custom-teal ml-2">
                      320.000đ
                    </span>
                  </div>
                  <Button className="bg-custom-teal hover:bg-custom-pink text-white w-44 transition-colors duration-300">
                    XEM CỬA HÀNG
                  </Button>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <ChevronLeft className="h-6 w-6 text-custom-teal dark:text-custom-teal" />
              </button>
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <ChevronRight className="h-6 w-6 text-custom-teal dark:text-custom-teal" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <button className="w-3 h-3 rounded-full bg-custom-teal dark:bg-custom-teal"></button>
                <button className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-custom-pink dark:hover:bg-custom-pink transition-colors duration-200"></button>
                <button className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-custom-pink dark:hover:bg-custom-pink transition-colors duration-200"></button>
              </div>
            </div>
          </div>

          {/* Side Cards */}
          <div className="space-y-6">
            {/* Bánh Mì Phương Card */}
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-custom-pink/20 dark:bg-custom-pink/30 p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Bánh Mì Phương
                      <br />
                      300+ đánh giá
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Bánh mì thơm ngon
                    </p>
                    <p className="text-xl text-custom-teal dark:text-custom-teal font-semibold mt-2">
                      15.000đ
                    </p>
                    <Button
                      variant="link"
                      className="text-gray-800 dark:text-gray-200 font-semibold hover:text-custom-teal dark:hover:text-custom-teal p-0 mt-1"
                    >
                      XEM CỬA HÀNG →
                    </Button>
                  </div>
                  <div className="w-1/2">
                    <Image
                      src="/api/placeholder/200/200"
                      alt="Bánh mì Phương"
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sweet Bakery Card */}
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-custom-teal/20 dark:bg-custom-teal/30 p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Sweet Bakery
                      <br />
                      Mới mở cửa
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Bánh cupcake và bánh ngọt
                    </p>
                    <p className="text-xl text-custom-pink dark:text-custom-pink font-semibold mt-2">
                      25.000đ
                    </p>
                    <Button
                      variant="link"
                      className="text-gray-800 dark:text-gray-200 font-semibold hover:text-custom-pink dark:hover:text-custom-pink p-0 mt-1"
                    >
                      XEM CỬA HÀNG →
                    </Button>
                  </div>
                  <div className="w-1/2">
                    <Image
                      src="/api/placeholder/200/200"
                      alt="Sweet Bakery"
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Category Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Cửa hàng nổi bật
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Khám phá các cửa hàng bánh chất lượng nhất tại Việt Nam
              </p>
            </div>
            <Button className="bg-custom-teal hover:bg-custom-pink text-white transition-colors duration-300">
              XEM TẤT CẢ
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {featuredStores.map((store) => (
              <StoreItem
                key={store.id}
                icon={
                  <div className="bg-custom-pink/20 dark:bg-custom-pink/30 p-3 rounded-full">
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
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Bánh bán chạy
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Đừng bỏ lỡ các ưu đãi đặc biệt đến hết tháng 2.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-custom-pink/10 hover:border-custom-pink dark:hover:bg-custom-pink/20 dark:hover:border-custom-pink transition-colors duration-300"
              >
                <ChevronLeft className="h-5 w-5 text-custom-teal dark:text-custom-teal" />
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-custom-pink/10 hover:border-custom-pink dark:hover:bg-custom-pink/20 dark:hover:border-custom-pink transition-colors duration-300"
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
                    : "text-gray-600 dark:text-gray-400 hover:text-custom-pink dark:hover:text-custom-pink transition-colors duration-300"
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
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Khám phá theo loại bánh
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
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
