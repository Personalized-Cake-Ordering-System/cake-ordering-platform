'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Mock data for wishlist items (replace with actual data fetching)
const mockWishlistItems = [
    {
        id: '1',
        name: 'Chocolate Truffle Delight',
        image: '/imagecake.jpg',
        price: 49.99,
        bakery: 'Sweet Dreams Bakery',
        description: 'Rich chocolate cake with truffle filling and ganache frosting'
    },
    {
        id: '2',
        name: 'Strawberry Cream Fantasy',
        image: '/imagecake3.jpg',
        price: 42.50,
        bakery: 'Berry Good Cakes',
        description: 'Light vanilla sponge with fresh strawberries and cream'
    },
    {
        id: '3',
        name: 'Wedding Elegance',
        image: '/imagecake1.jpeg',
        price: 149.99,
        bakery: 'Celebration Cakes',
        description: 'Three-tier wedding cake with fondant flowers and pearl details'
    },
    {
        id: '4',
        name: 'Birthday Funfetti',
        image: '/imagecake2.jpeg',
        price: 38.99,
        bakery: 'Party Time Bakers',
        description: 'Colorful sprinkle-filled cake with buttercream frosting'
    }
];

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
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100
        }
    },
    exit: {
        opacity: 0,
        x: -100,
        transition: { duration: 0.3 }
    }
};

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const removeFromWishlist = (id: string) => {
        setIsRemoving(id);

        // Simulate a slight delay for animation
        setTimeout(() => {
            setWishlistItems(prev => prev.filter(item => item.id !== id));
            setIsRemoving(null);
            toast.success('Item removed from wishlist');
        }, 300);
    };

    const addToCart = (id: string) => {
        // Implementation for adding to cart would go here
        toast.success('Added to cart');
    };

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Link href="/cakes" className="inline-flex">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">My Wishlist</h1>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-center bg-pink-100 dark:bg-pink-950 text-pink-500 rounded-full h-8 w-8 ml-2"
                        >
                            <Heart className="h-4 w-4 fill-pink-500" />
                        </motion.div>
                    </div>

                    {wishlistItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                variant="ghost"
                                className="text-muted-foreground"
                                onClick={() => {
                                    setWishlistItems([]);
                                    toast.success('Wishlist cleared');
                                }}
                            >
                                Clear All
                            </Button>
                        </motion.div>
                    )}
                </div>

                <Separator />

                {wishlistItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-16 space-y-4"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.2
                            }}
                            className="h-24 w-24 rounded-full bg-muted flex items-center justify-center"
                        >
                            <Heart className="h-12 w-12 text-muted-foreground" />
                        </motion.div>
                        <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            Start adding your favorite cakes to your wishlist by clicking the heart icon on any cake.
                        </p>
                        <Link href="/cakes" className="pt-4">
                            <Button size="lg" className="rounded-full">
                                Discover Cakes
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {wishlistItems.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                exit="exit"
                                className={`${isRemoving === item.id ? 'opacity-50' : 'opacity-100'} transition-opacity`}
                            >
                                <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-lg transition-shadow">
                                    <div className="relative h-48 overflow-hidden group">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-3 right-3 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="rounded-full"
                                                onClick={() => removeFromWishlist(item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                                                <span className="font-medium text-pink-600 dark:text-pink-400">${item.price.toFixed(2)}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.bakery}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                        <div className="pt-2">
                                            <Button
                                                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                                onClick={() => addToCart(item.id)}
                                            >
                                                <ShoppingCart size={16} className="mr-2" />
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;