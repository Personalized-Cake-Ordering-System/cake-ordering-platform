import { Button } from "@/components/ui/button" ;
import { ChevronLeft, ChevronRight, Store } from "lucide-react" ;
import Link from "next/link" ;

import { CakeItem } from "@/components/shared/client/home/cake-item" ;
import { CategoryItem } from "@/components/shared/client/home/category-item" ;
import {
  categoryData,
  popularProducts,
} from "@/components/shared/client/home/data" ;
import MainBanner from "@/components/shared/client/home/main-banner" ;
import { StoreHighlightCard } from "@/components/shared/client/home/store-highlight-card" ;
import { StoreItem } from "@/components/shared/client/home/store-item" ;
import { IBakery } from "@/features/barkeries/types/barkeries-type" ;
import { getBakeries } from "@/features/barkeries/actions/barkeries-action" ;
import { getCakes } from "@/features/barkeries/actions/cake-action" ;
const HomePage = async () => {
  const bakeries = await getBakeries() ;
  const cakes = await getCakes({}) ;
  const featuredBakeries = bakeries.data?.data?.slice(0, 8) ;
  
  // Filter bakeries to only show confirmed ones
  const confirmedBakeries = featuredBakeries?.filter(bakery => bakery.status === "CONFIRMED") || [] ;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 relative overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <MainBanner />
          </div>

          <div className="space-y-6 flex flex-col h-full">
            {confirmedBakeries.length >= 1 && (
              <StoreHighlightCard
                store={{
                  id: confirmedBakeries[0].id,
                  name: confirmedBakeries[0].bakery_name,
                  // rating: 4.8,
                  imageUrl:
                    confirmedBakeries[0].shop_image_files[0].file_url! || "",
                  isFeatured: true,
                  // cake_description: "Chuyên cung cấp các loại bánh kem tươi, bánh sinh nhật và bánh theo yêu cầu với nguyên liệu chất lượng cao.",
                  price_description: "Giá cả hợp lý từ 150.000đ, tùy theo kích thước và thiết kế bánh.",
                  // bakery_description: "Tiệm bánh gia đình với hơn 5 năm kinh nghiệm trong việc làm bánh và phục vụ khách hàng khu vực trung tâm Sài Gòn.",
                }}
                bgColor="bg-custom-pink/30"
                textColor="text-custom-teal"
              />
            )}

            {confirmedBakeries.length >= 2 && (
              <StoreHighlightCard
                store={{
                  id: confirmedBakeries[1].id,
                  name: confirmedBakeries[1].bakery_name,
                  // rating: 4.7,
                  imageUrl:
                    confirmedBakeries[1].shop_image_files[0].file_url! || "",
                  isFeatured: true,
                  // cake_description: "Đa dạng các loại bánh kem cao cấp, bánh sinh nhật sáng tạo và bánh theo chủ đề với thiết kế độc đáo.",
                  price_description: "Mức giá từ 200.000đ đến 2.000.000đ, phù hợp với mọi nhu cầu và ngân sách.",
                  // bakery_description: "Thương hiệu bánh kem cao cấp với đội ngũ đầu bếp chuyên nghiệp, cam kết mang đến những chiếc bánh ngon và đẹp mắt.",
                }}
                bgColor="bg-custom-teal/30"
                textColor="text-custom-pink"
              />
            )}
          </div>
        </div>

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
            <Link href="/stores">
              <Button className="bg-custom-teal hover:bg-custom-pink text-white transition-colors duration-300 shadow-md">
                XEM TẤT CẢ
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {confirmedBakeries.map((bakery) => (
              <StoreItem
                key={bakery.id}
                icon={
                  <div className="bg-custom-pink/30 dark:bg-custom-pink/30 p-3 rounded-full">
                    <Store className="h-6 w-6 text-custom-teal dark:text-custom-teal" />
                  </div>
                }
                name={bakery.bakery_name}
                rating={bakery.metric?.rating_average ? Number(bakery.metric.rating_average.toFixed(1)) : 4.5}
                speciality={bakery.bakery_name}
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
                className={`font-medium pb-2 whitespace-nowrap ${index === 0
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
            {cakes.payload?.map((product) => (
              <CakeItem
                key={product.id}
                id={product.id}
                discount={product.available_cake_quantity}
                imageUrl={product.available_cake_image_files?.[0]?.file_url}
                title={product.available_cake_type}
                store={product.bakery_id}
                price={product.available_cake_price}
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
  ) ;
} ;

export default HomePage ;
