"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ICake } from "@/features/barkeries/types/cake";
import { cartService } from "@/app/services/cartService";

const DiscoverPage = () => {
    const router = useRouter();
    const [featuredCakes, setFeaturedCakes] = useState<ICake[]>([]);
    const [categories, setCategories] = useState([
        { id: 1, name: "Bánh Sinh Nhật", image: "/imagecake.jpg" },
        { id: 2, name: "Bánh Cưới", image: "/imagecake1.jpeg" },
        { id: 3, name: "Bánh Tự Chọn", image: "/imagecake2.jpeg" },
        { id: 4, name: "Bánh Cupcake", image: "/imagecake3.jpg" },
    ]);

    // Format VND currency
    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Fetch featured cakes
    useEffect(() => {
        const fetchCakes = async () => {
            try {
                const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/available_cakes');
                const data = await response.json();
                if (data.status_code === 200) {
                    setFeaturedCakes(data.payload);
                }
            } catch (error) {
                console.error('Error fetching cakes:', error);
            }
        };

        fetchCakes();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };

    const hoverVariants = {
        hover: {
            scale: 1.05,
            transition: {
                duration: 0.3,
            },
        },
    };

    const handleAddToCart = async (cake: ICake) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
                router.push('/sign-in');
                return;
            }

            const cartPayload = {
                bakeryId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                order_note: "",
                phone_number: "",
                shipping_address: "",
                latitude: "",
                longitude: "",
                pickup_time: new Date().toISOString(),
                shipping_type: "DELIVERY",
                payment_type: "QR_CODE",
                voucher_code: "",
                cartItems: [{
                    cake_name: cake.available_cake_name,
                    main_image_id: cake.available_cake_image_files[0]?.id || "",
                    main_image: cake.available_cake_image_files[0] || null,
                    quantity: 1,
                    cake_note: "",
                    sub_total_price: cake.available_cake_price,
                    available_cake_id: cake.id,
                    custom_cake_id: null
                }]
            };

            const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(cartPayload)
            });

            const data = await response.json();

            if (data.status_code === 200) {
                toast.success('Đã thêm vào giỏ hàng thành công');
                router.push('/cart');
            } else {
                toast.error(data.errors?.[0] || 'Thêm vào giỏ hàng thất bại');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Thêm vào giỏ hàng thất bại');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative h-[60vh] flex items-center justify-center overflow-hidden"
            >
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/imagecake.jpg"
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative z-10 text-center text-white px-4"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">
                        Khám Phá Thế Giới Bánh Ngọt
                    </h1>
                    <p className="text-xl md:text-2xl mb-8">
                        Khám phá bộ sưu tập bánh ngọt thủ công của chúng tôi
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold"
                    >
                        Bắt Đầu Khám Phá
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Categories Section */}
            <motion.section
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="py-16 px-4"
            >
                <h2 className="text-3xl font-bold text-center mb-12">Danh Mục</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {categories.map((category) => (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            whileHover="hover"
                            className="relative h-64 rounded-xl overflow-hidden shadow-lg"
                        >
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <h3 className="text-white text-2xl font-bold">{category.name}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Featured Cakes Section */}
            <motion.section
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="py-16 px-4 bg-white dark:bg-gray-800"
            >
                <h2 className="text-3xl font-bold text-center mb-12">Bánh Nổi Bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {featuredCakes.map((cake) => (
                        <motion.div
                            key={cake.id}
                            variants={itemVariants}
                            whileHover="hover"
                            className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg"
                        >
                            <div className="relative h-64">
                                <Image
                                    src={cake.available_cake_image_files[0]?.file_url || '/placeholder-cake.jpg'}
                                    alt={cake.available_cake_name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{cake.available_cake_name}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {cake.available_cake_description}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-pink-500">
                                        {formatVND(cake.available_cake_price)}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAddToCart(cake)}
                                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full"
                                    >
                                        Thêm Vào Giỏ
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Special Offers Section */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="py-16 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Ưu Đãi Đặc Biệt</h2>
                    <p className="text-xl mb-8">
                        Giảm 20% cho đơn hàng đầu tiên! Mã: SWEET20
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-pink-500 px-8 py-3 rounded-full text-lg font-semibold"
                    >
                        Mua Ngay
                    </motion.button>
                </div>
            </motion.section>
        </div>
    );
};

export default DiscoverPage;
