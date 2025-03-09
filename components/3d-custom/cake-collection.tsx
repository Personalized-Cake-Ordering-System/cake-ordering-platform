"use client"
import * as React from "react"
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Share2, ExternalLink } from 'lucide-react';

const CakeCollection = () => {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    console.log(hoveredIndex)
    const cakes = [
        {
            title: "Indulge in Sweetness",
            imagePath: "/imagecake.jpg",
            description: "Experience the perfect blend of flavors in every layer of this masterpiece",
            category: "Signature",
            rating: 4.9,
            reviews: 128
        },
        {
            title: "Savor the Moment",
            imagePath: "/imagecake1.jpeg",
            description: "Handcrafted with love and precision, creating unforgettable moments",
            category: "Premium",
            rating: 4.8,
            reviews: 156
        },
        {
            title: "Delight in Every Bite",
            imagePath: "/imagecake2.jpeg",
            description: "Each slice tells a unique story of flavor and artistry",
            category: "Exclusive",
            rating: 4.9,
            reviews: 142
        },
        {
            title: "Artistry in Motion",
            imagePath: "/imagecake3.jpg",
            description: "Where creativity meets confection in perfect harmony",
            category: "Limited",
            rating: 4.7,
            reviews: 113
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6
            }
        }
    };

    return (
        <section className="relative bg-gradient-to-b from-[#e5dcd9] to-[#f5f0ed] py-32 overflow-hidden">
            {/* Decorative Background Elements */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 1.5 }}
                className="absolute left-0 top-1/4 w-96 h-96 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full blur-3xl"
            />
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="absolute right-0 bottom-1/4 w-96 h-96 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full blur-3xl"
            />

            <div className="max-w-7xl mx-auto px-8 relative">
                {/* Header Section */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <motion.p
                        whileHover={{ scale: 1.05 }}
                        className="text-teal-600 font-medium mb-4 tracking-wide inline-block"
                    >
                        Crafting Culinary Masterpieces
                    </motion.p>
                    <h2 className="text-6xl font-black mb-8 bg-gradient-to-r from-teal-800 via-teal-600 to-purple-600 bg-clip-text text-transparent"
                        style={{
                            fontFamily: 'serif',
                            letterSpacing: '0.05em'
                        }}>
                        Passion for Perfection
                    </h2>
                    <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                        At our custom cake 3D shop, we blend artistry with innovation to create
                        extraordinary experiences that delight both the eyes and the palate.
                    </p>
                </motion.div>

                {/* Cake Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-16"
                >
                    {cakes.map((cake, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Category Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-teal-800">
                                    {cake.category}
                                </span>
                            </div>

                            {/* Image Container */}
                            <div className="relative w-full h-96 bg-white rounded-3xl shadow-xl overflow-hidden transform group-hover:scale-[1.02] transition-all duration-500 ease-out">
                                <Image
                                    src={cake.imagePath}
                                    alt={cake.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    priority
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                                        <p className="text-white/90 text-lg font-medium mb-4">
                                            {cake.description}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-4">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                            >
                                                <Heart className="w-5 h-5 text-white" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                            >
                                                <Share2 className="w-5 h-5 text-white" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                            >
                                                <ExternalLink className="w-5 h-5 text-white" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Below Image */}
                            <div className="mt-6 transform group-hover:-translate-y-2 transition-transform duration-500">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {cake.title}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                        <span className="text-yellow-400">★</span>
                                        <span className="ml-1 font-medium">{cake.rating}</span>
                                    </div>
                                    <span className="text-gray-500">
                                        ({cake.reviews} reviews)
                                    </span>
                                </div>
                                <div className="h-0.5 w-16 bg-gradient-to-r from-teal-500 to-purple-500 mt-4 transform scale-0 group-hover:scale-100 transition-transform duration-500" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default CakeCollection;