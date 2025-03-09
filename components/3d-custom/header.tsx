"use client"

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PresentationControls, Stage } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

function Model({ onClick, rotating }: { onClick: () => void; rotating: boolean }) {
    const { scene } = useGLTF('/cake5.glb');

    React.useEffect(() => {
        if (rotating) {
            scene.rotation.y += 0.005;
        }
    }, [rotating, scene]);

    return (
        <primitive
            object={scene}
            onClick={onClick}
            scale={1.2}
        />
    );
}

export default function HeaderDashboard() {
    const [rotating, setRotating] = React.useState(false);
    const [activeProduct, setActiveProduct] = React.useState<number | string | null>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // After mounting, we can safely show the theme toggle
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const products = [
        {
            name: 'ONI MASK',
            price: 59.99,
            bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
            image: '/imagecake.jpg',
            description: 'Traditional Japanese-inspired design'
        },
        {
            name: 'PINK DROP',
            price: 89.99,
            bg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900',
            image: '/imagecake1.jpeg',
            description: 'Elegant pink masterpiece'
        },
        {
            name: 'THANK YOU',
            price: 69.99,
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
            image: '/imagecake2.jpeg',
            description: 'Perfect for showing gratitude'
        },
        {
            name: 'YELLOW & BLACK',
            price: 79.99,
            bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900',
            image: '/imagecake3.jpg',
            description: 'Bold and modern design'
        }
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 dark:from-gray-900 dark:to-purple-900 transition-colors duration-300">
            {/* Theme Toggle Button */}
            {mounted && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {theme === 'dark' ? <Sun className="text-yellow-400" size={24} /> : <Moon className="text-purple-900" size={24} />}
                </motion.button>
            )}

            {/* Hero Section */}
            <div className="relative min-h-screen flex items-center pt-24">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 text-[220px] font-black text-purple-200 dark:text-purple-900 pointer-events-none tracking-tighter"
                >
                    Customizer Cake
                </motion.div>

                {/* Left Content */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-1/2 pl-24 z-10"
                >
                    <h1 className="text-7xl font-black text-purple-900 dark:text-white mb-6 leading-tight">
                        Design Your
                        <span className="block bg-gradient-to-r from-purple-900 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
                            Dream Cake
                        </span>
                    </h1>
                    <p className="text-2xl mb-12 text-gray-700 dark:text-gray-300 leading-relaxed">
                        Not just a cake, your cake. Design a masterpiece that as unique as your imagination.
                    </p>
                    <Link href="/Model3DCustom">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:from-orange-500 hover:to-pink-600 transition-colors shadow-lg"
                        >
                            Create Your Cake
                            <ChevronRight size={20} />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* 3D Model Section */}
                <div className="absolute right-0 w-1/2 h-full">
                    <Canvas shadows>
                        <Suspense fallback={null}>
                            <PresentationControls
                                global
                                rotation={[0, rotating ? Math.PI * 2 : 0, 0]}
                                polar={[-Math.PI / 3, Math.PI / 3]}
                                azimuth={[-Math.PI / 1.4, Math.PI / 2]}
                            >
                                <Stage environment={theme === 'dark' ? 'night' : 'sunset'} intensity={0.8}>
                                    <Model onClick={() => setRotating(!rotating)} rotating={rotating} />
                                </Stage>
                            </PresentationControls>
                            <OrbitControls enableZoom={false} />
                        </Suspense>
                    </Canvas>
                </div>
            </div>

            {/* Latest Drop Section */}
            <section className="bg-white dark:bg-gray-800 py-32 transition-colors duration-300">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-7xl mx-auto px-8"
                >
                    <h2 className="text-7xl font-black text-center mb-6">
                        <span className="bg-gradient-to-r from-purple-900 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
                            POPULAR CAKES
                        </span>
                    </h2>
                    <p className="text-2xl text-center mb-20 text-gray-600 dark:text-gray-300">
                        Discover our most beloved creations
                    </p>

                    <div className="grid grid-cols-4 gap-12">
                        {products.map((product, index) => (
                            <motion.div
                                key={product.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className={`${product.bg} p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300`}
                                onMouseEnter={() => setActiveProduct(product.name)}
                                onMouseLeave={() => setActiveProduct(null)}
                            >
                                <div className="flex justify-between mb-4">
                                    <span className="text-2xl font-bold dark:text-white">${product.price}</span>
                                    <span className="flex items-center gap-1">
                                        <Star className="text-yellow-400 fill-yellow-400" size={20} />
                                        <span className="font-medium dark:text-white">4.8</span>
                                    </span>
                                </div>
                                <div className="relative h-80 bg-white dark:bg-gray-700 rounded-2xl mb-6 shadow-inner overflow-hidden group">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                        priority={true}
                                    />
                                </div>
                                <h3 className="text-center font-bold text-xl mb-2 dark:text-white">{product.name}</h3>
                                <p className="text-center text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full py-4 bg-purple-900 dark:bg-purple-700 text-white rounded-xl hover:bg-purple-800 dark:hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>
        </div>
    );
}