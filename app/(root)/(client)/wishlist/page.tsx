'use client';

import { useWishlist } from '@/app/store/useWishlist';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const WishlistPage = () => {
    const { items, removeFromWishlist } = useWishlist();

    const handleRemoveFromWishlist = (id: string) => {
        removeFromWishlist(id);
        toast.success('Removed from wishlist');
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Danh sách yêu thích của tôi</h1>

            {items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Danh sách yêu thích của bạn đang trống. Hãy thêm những chiếc bánh yêu thích của bạn vào đây!</p>
                    <Link href="/cakes">
                        <Button className="bg-pink-500 hover:bg-pink-600">
                            Xem các loại bánh ngon
                        </Button>
                    </Link>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariant}
                            className="h-full"
                        >
                            <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                                <div className="relative aspect-video">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <CardContent className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-semibold text-xl">{item.name}</h3>
                                        <Badge variant="outline" className="bg-transparent border-pink-200 text-pink-500">
                                            Đã lưu
                                        </Badge>
                                    </div>

                                    <div className="flex justify-between items-center mt-auto pt-4">
                                        <span className="text-xl font-bold text-pink-600">
                                            {item.price.toLocaleString('vi-VN')} VND
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleRemoveFromWishlist(item.id)}
                                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                            <Link href={`/cakes/${item.id}`}>
                                                <Button className="bg-pink-500 hover:bg-pink-600">
                                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                                    Xem chi tiết
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default WishlistPage;