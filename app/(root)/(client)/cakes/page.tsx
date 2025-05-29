'use client'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { EyeIcon, Heart, ShoppingCart, Filter, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useWishlist } from '@/app/store/useWishlist';
import { toast } from 'sonner';

const MultiCakes = () => {
  const getCakeTypeDisplayName = (type: string): string => {
    const cakeTypeMap: { [key: string]: string } = {
      'BANH_KEM': 'Bánh Kem',
      'BANH_MI': 'Bánh Mì',
      'BANH_NGON': 'Bánh Ngọt',
      'BANH_MAN': 'Bánh Mặn',
      'BANH_TRUNG_THU': 'Bánh Trung Thu',
      'BANH_CHAY': 'Bánh Chay',
      'CUPCAKE': 'Cupcake',
      'BANH_THEO_MUA': 'Bánh Theo Mùa'
    };
    return cakeTypeMap[type] || type;
  };

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [allCakes, setAllCakes] = React.useState<any[]>([]);
  const [filteredCakes, setFilteredCakes] = React.useState<any[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const { addToWishlist, removeFromWishlist, items } = useWishlist();

  const fetchCakes = async () => {
    try {
      const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/available_cakes');
      const data = await response.json();
      if (data.status_code === 200) {
        setAllCakes(data.payload);
        setFilteredCakes(data.payload);
      }
    } catch (error) {
      console.error('Error fetching cakes:', error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  React.useEffect(() => {
    fetchCakes();
  }, []);

  React.useEffect(() => {
    if (selectedCategory) {
      const filtered = allCakes.filter(cake =>
        cake.available_cake_type === selectedCategory
      );
      setFilteredCakes(filtered);
    } else {
      setFilteredCakes(allCakes);
    }
  }, [selectedCategory, allCakes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category);
  };

  const cakeCategories = [
    { id: 1, name: 'BANH_KEM', label: 'Bánh Kem', icon: '🎂' },
    { id: 2, name: 'BANH_MI', label: 'Bánh Mì', icon: '🥖' },
    { id: 3, name: 'BANH_NGON', label: 'Bánh Ngọt', icon: '🍰' },
    { id: 4, name: 'BANH_MAN', label: 'Bánh Mặn', icon: '🥮' },
    { id: 5, name: 'BANH_TRUNG_THU', label: 'Bánh Trung Thu', icon: '🥮' },
    { id: 6, name: 'BANH_CHAY', label: 'Bánh Chay', icon: '🌱' },
    { id: 7, name: 'CUPCAKE', label: 'Cupcake', icon: '🧁' },
    { id: 8, name: 'BANH_THEO_MUA', label: 'Bánh Theo Mùa', icon: '🍂' },
  ];

  const handleWishlistToggle = (cake: any) => {
    const isInWishlist = items.some(item => item.id === cake.id);

    if (isInWishlist) {
      removeFromWishlist(cake.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: cake.id,
        name: cake.available_cake_name,
        price: cake.available_cake_price,
        image: cake.available_cake_image_files?.[0]?.file_url || '/placeholder-cake.jpg',
      });
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section - New Style with softer colors */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/api/placeholder/2000/800" 
            alt="" 
            fill 
            className="object-cover opacity-15 dark:opacity-10"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 container mx-auto py-20 px-4 flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200 border-none">
              Hàng trăm loại bánh thơm ngon
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6 text-gray-800 dark:text-white"
          >
            <span className="text-rose-500 dark:text-rose-300">Thế Giới</span> Bánh Ngọt
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10"
          >
            Trải nghiệm bộ sưu tập bánh thủ công tinh tế cho mọi dịp đặc biệt. Mỗi món bánh là một tác phẩm nghệ thuật, được làm từ những nguyên liệu tốt nhất.
          </motion.p>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="default" className="bg-rose-400 hover:bg-rose-500 text-white border-none shadow-md shadow-rose-100 dark:shadow-rose-900/10 px-6 py-2 rounded-full">
              Đặt Hàng Tùy Chỉnh
            </Button>
            <Button size="default" variant="outline" className="border-rose-300 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 dark:text-rose-300 dark:border-rose-700 px-6 py-2 rounded-full">
              Khám Phá Bán Chạy
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-16">
        {/* Category Section - Redesigned with softer colors */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-serif font-bold text-gray-700 dark:text-white flex items-center"
            >
              <Filter className="w-6 h-6 mr-2 text-rose-400" />
              Danh Mục Bánh
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4 md:mt-0"
            >
              <Button 
                variant="ghost" 
                onClick={() => filterByCategory(null)} 
                className={`${!selectedCategory ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300' : ''} rounded-full px-5 py-1.5`}
              >
                Xem tất cả
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
          >
            {cakeCategories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => filterByCategory(category.name)}
                className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                  selectedCategory === category.name
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300'
                    : 'bg-white/80 hover:bg-rose-50/50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                } shadow-sm hover:shadow-md`}
              >
                <span className="text-2xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium">{getCakeTypeDisplayName(category.name)}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Featured Products Banner - New with softer colors */}
        {!selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mb-16 rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-300 to-amber-300 opacity-80 z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">
              <div className="p-8 md:p-12 text-white">
                <Badge className="mb-6 bg-white/20 hover:bg-white/30 text-white border-none">Sản phẩm nổi bật</Badge>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6">Bánh Sinh Nhật Tinh Tế</h3>
                <p className="mb-8 opacity-90">Bộ sưu tập bánh sinh nhật mới nhất với thiết kế hiện đại và hương vị đặc biệt. Hoàn hảo cho mọi dịp kỷ niệm quan trọng.</p>
                <Button className="bg-white text-rose-500 hover:bg-gray-100 hover:text-rose-600 rounded-full px-6 py-2 text-sm">
                  Xem Bộ Sưu Tập
                </Button>
              </div>
              <div className="relative h-64 md:h-auto">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Image 
                    src="/api/placeholder/500/500" 
                    alt="Featured Cake" 
                    width={350} 
                    height={350} 
                    className="object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid - Redesigned with softer colors */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-serif font-bold text-gray-700 dark:text-white mb-10 text-center"
          >
            {selectedCategory ? getCakeTypeDisplayName(selectedCategory) : 'Tất Cả Sản Phẩm'}
          </motion.h2>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-400"></div>
            </div>
          ) : filteredCakes.length === 0 && selectedCategory ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-md"
            >
              <div className="max-w-md mx-auto">
                <div className="text-5xl mb-6">😢</div>
                <h3 className="text-2xl font-medium mb-4 text-gray-700 dark:text-white">Không Tìm Thấy Sản Phẩm</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Rất tiếc, hiện tại không có {cakeCategories.find(cat => cat.name === selectedCategory)?.label.toLowerCase() + " "}
                  mà bạn đang tìm kiếm. Vui lòng thử lại sau!
                </p>
                <Button
                  onClick={() => setSelectedCategory(null)}
                  className="bg-rose-400 hover:bg-rose-500 text-white shadow-md rounded-full px-6 py-2"
                >
                  Xem tất cả bánh
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCakes.map((cake) => (
                <motion.div
                  key={cake.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group h-full"
                >
                  <Link href={`/cakes/${cake.id}`}>
                    <Card className="h-full flex flex-col overflow-hidden border-none bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="relative">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <Image
                            src={cake.available_cake_image_files?.[0]?.file_url || '/placeholder-cake.jpg'}
                            alt={cake.available_cake_name}
                            fill
                            className="object-cover transition-all duration-500 group-hover:scale-110"
                          />
                          
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge className={`
                              ${cake.available_cake_type === 'BANH_KEM' 
                                ? 'bg-amber-300 hover:bg-amber-400' 
                                : 'bg-rose-400 hover:bg-rose-500'} 
                              text-white border-none px-2 py-1`
                            }>
                              {getCakeTypeDisplayName(cake.available_cake_type)}
                            </Badge>
                          </div>
                          
                          {/* Status */}
                          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              cake.available_cake_quantity > 0
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {cake.available_cake_quantity > 0
                                ? `Còn ${cake.available_cake_quantity} chiếc`
                                : 'Hết hàng'}
                            </span>
                          </div>
                          
                          {/* Quick action buttons */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.preventDefault();
                                handleWishlistToggle(cake);
                              }}
                              className="bg-white/80 dark:bg-gray-900/80 rounded-full p-2 shadow-sm hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                              <Heart
                                className={`h-5 w-5 ${items.some(item => item.id === cake.id)
                                  ? 'fill-rose-400 text-rose-400'
                                  : 'text-rose-400'}`
                                }
                              />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-white/80 dark:bg-gray-900/80 rounded-full p-2 shadow-sm hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                              <EyeIcon className="h-5 w-5 text-rose-400" />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-xl font-medium text-gray-700 dark:text-white line-clamp-1">
                          {cake.available_cake_name}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="flex-grow">
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {cake.available_cake_description}
                        </p>
                        
                        {/* Rating stars - new element */}
                        <div className="flex items-center mt-3">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                !cake.metric?.rating_average || cake.metric?.rating_average === 0
                                  ? 'fill-amber-300 text-amber-300' // Default 5 stars for new cakes
                                  : i < Math.round(cake.metric.rating_average)
                                    ? 'fill-amber-300 text-amber-300'
                                    : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                              }`} 
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            {!cake.metric?.rating_average || cake.metric?.rating_average === 0
                              ? '(Chưa có đánh giá)'
                              : `(${cake.metric.rating_average.toFixed(1)})`
                            }
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center">
                        <div className="text-lg font-bold text-rose-500 dark:text-rose-300">
                          {cake.available_cake_price.toLocaleString('vi-VN')}₫
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full bg-rose-400 hover:bg-rose-500 transition-all px-4 py-1 text-xs"
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                          Thêm Vào Giỏ
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Custom Your Order Banner - Redesigned with softer colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 overflow-hidden shadow-lg rounded-3xl"
        >
          <div className="relative bg-gradient-to-r from-rose-100 to-amber-100 dark:from-gray-900 dark:to-gray-800">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-rose-200 dark:bg-rose-800 blur-3xl"></div>
              <div className="absolute top-1/2 right-0 w-72 h-72 rounded-full bg-amber-200 dark:bg-amber-800 blur-3xl"></div>
              <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-pink-200 dark:bg-pink-800 blur-3xl"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">
              <div className="p-10 md:p-16 flex flex-col justify-center order-2 md:order-1">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Badge className="mb-6 px-4 py-2 text-sm bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300 border-none font-medium">
                    ✨ Thiết kế tùy chỉnh
                  </Badge>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl md:text-5xl font-serif font-bold text-gray-700 dark:text-white mb-8 leading-tight"
                >
                  Tạo Bánh Theo <span className="text-rose-500 dark:text-rose-300">Ý Tưởng</span> Của Bạn
                </motion.h2>
                
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mb-8 space-y-5"
                >
                  {[
                    { step: 1, title: "Chọn loại bánh", desc: "Kích thước và hương vị yêu thích của bạn" },
                    { step: 2, title: "Thiết kế phần trang trí", desc: "Thêm hình ảnh và thông điệp cá nhân" },
                    { step: 3, title: "Đặt hàng & nhận bánh", desc: "Chúng tôi sẽ làm bánh theo đúng yêu cầu" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
                      className="flex items-start group"
                    >
                      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-r from-rose-300 to-rose-400 dark:from-rose-500 dark:to-amber-500 flex items-center justify-center text-white mr-4 shadow-md shadow-rose-100/50 dark:shadow-rose-900/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="font-bold">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700 dark:text-white text-lg mb-1 group-hover:text-rose-500 dark:group-hover:text-rose-300 transition-colors duration-300">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="flex flex-wrap gap-4"
                >
                  <Button
                    className="bg-gradient-to-r from-rose-300 to-rose-400 hover:from-rose-400 hover:to-rose-500 text-white shadow-md shadow-rose-100/50 dark:shadow-rose-900/20 border-0 px-6 py-2 text-sm font-medium rounded-full"
                  >
                    Bắt Đầu Thiết Kế
                  </Button>
                  <Button
                    variant="outline"
                    className="border border-rose-200 text-rose-500 hover:bg-rose-50 dark:text-rose-300 dark:border-rose-700 px-5 py-2 text-sm font-medium rounded-full"
                  >
                    Xem Mẫu Bánh
                  </Button>
                </motion.div>
              </div>
              
              <div className="relative h-80 md:h-auto order-1 md:order-2 overflow-hidden">
                {/* Background gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-amber-100/80 to-rose-100/80 dark:from-rose-900/20 dark:via-amber-900/20 dark:to-rose-900/20"></div>
                
                {/* Floating cake images - with better image suggestions */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotateZ: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative w-64 h-64 md:w-72 md:h-72"
                  >
                    {/* Replace with a beautiful cake image - suggested: elegant tiered cake with flowers */}
                    <Image
                      src="https://images.unsplash.com/photo-1562777717-dc6984f65a63?q=80&w=1000"
                      alt="Custom Cake Design"
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                </motion.div>
                
                {/* Decorative elements - with better image suggestions */}
                <motion.div 
                  className="absolute -top-6 -right-6 w-24 h-24 md:w-32 md:h-32"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  {/* Replace with a decorative element - suggested: a cupcake or cake topper */}
                  <Image
                    src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1887"
                    alt="Decoration"
                    width={120}
                    height={120}
                    className="opacity-70"
                  />
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-4 left-4 w-16 h-16"
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, 10, 0, -10, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Replace with another decorative element - suggested: strawberries or cherries */}
                  <Image
                    src="https://images.unsplash.com/photo-1586985288123-2495f577c250?q=80&w=1780"
                    alt="Decoration"
                    width={60}
                    height={60}
                    className="opacity-80"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Collections with Background Images - Softer colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border-none">
                🍰 Khám phá thêm
              </Badge>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl md:text-5xl font-serif font-bold text-gray-700 dark:text-white mb-4"
            >
              Bộ Sưu Tập Nổi Bật
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300"
            >
              Khám phá các bộ sưu tập bánh đặc biệt của chúng tôi cho từng dịp quan trọng
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Bộ Sinh Nhật",
                description: "Trọn bộ sản phẩm cho bữa tiệc sinh nhật hoàn hảo với bánh, nến và phụ kiện trang trí",
                image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?q=80&w=1936",
                iconBg: "bg-blue-400",
                icon: "🎂",
                features: [
                  "Bánh sinh nhật tùy chọn",
                  "Bộ nến đặc biệt",
                  "Thiệp chúc mừng",
                  "Mũ tiệc"
                ]
              },
              {
                title: "Bộ Đám Cưới",
                description: "Bánh cưới và set trang trí tinh tế, sang trọng cho ngày trọng đại của bạn",
                image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?q=80&w=1974",
                iconBg: "bg-rose-400",
                icon: "💍",
                features: [
                  "Bánh cưới nhiều tầng",
                  "Tượng trang trí",
                  "Hộp quà cảm ơn",
                  "Phụ kiện cắt bánh"
                ]
              },
              {
                title: "Bộ Kỷ Niệm",
                description: "Những món quà ý nghĩa và tinh tế cho ngày đặc biệt của bạn và người thân",
                image: "https://images.unsplash.com/photo-1551404973-761c83cd8339?q=80&w=1974",
                iconBg: "bg-emerald-400",
                icon: "🎉",
                features: [
                  "Bánh kỷ niệm",
                  "Hộp quà cao cấp",
                  "Thiệp chúc mừng",
                  "Đồ trang trí bàn tiệc"
                ]
              }
            ].map((collection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-md">
                  {/* Card background with image */}
                  <div className="relative h-80">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-10"></div>
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Card content */}
                  <div className="absolute inset-0 z-20 p-6 flex flex-col">
                    <div className="flex-1">
                      <div className={`w-12 h-12 ${collection.iconBg} rounded-full flex items-center justify-center text-white text-2xl mb-4`}>
                        {collection.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-rose-200 transition-colors duration-300">
                        {collection.title}
                      </h3>
                      <div className="h-0.5 w-12 bg-white/70 mb-4 transform origin-left group-hover:scale-x-150 transition-transform duration-300"></div>
                      <p className="text-white/80 text-sm mb-4 max-w-[90%]">{collection.description}</p>
                    </div>
                    
                    {/* Feature list */}
                    <div className="space-y-2">
                      {collection.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-white/90 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-300 mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {/* Button */}
                    <div className="mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full text-sm font-medium transition-colors duration-300"
                      >
                        Xem Chi Tiết
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Subscription - Redesigned with softer colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-900/10 dark:to-amber-900/10 p-8 md:p-12 mb-20"
        >
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/70 text-rose-600 dark:bg-white/10 dark:text-rose-300 border-none">
              Ưu đãi độc quyền
            </Badge>
            <h2 className="text-3xl font-serif font-bold text-gray-700 dark:text-white mb-4">
              Đăng Ký Nhận Bản Tin
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Hãy là người đầu tiên biết về các ưu đãi mới, công thức làm bánh độc quyền và sự kiện đặc biệt của chúng tôi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-grow px-4 py-3 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-sm dark:bg-gray-800 dark:text-white"
              />
              <Button className="rounded-full bg-rose-400 hover:bg-rose-500 text-white px-6 py-2 shadow-md shadow-rose-100 dark:shadow-rose-900/10 text-sm">
                Đăng Ký Ngay
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MultiCakes;